// Chat backend for the Orkhon site.
//
// Proxies visitor messages to the Orkhon Hugging Face Space (a Gradio
// ChatInterface whose fn is named "respond") using @gradio/client. No paid API
// is ever called — the Space is the only model backend.
//
// Failure contract: if the Space is unreachable, private, or sleeping, the
// handler returns HTTP 503 with a stable JSON shape so the UI can show a
// friendly "backend not connected yet" message instead of a stack trace.

import { Client } from "@gradio/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface IncomingMessage {
  role?: unknown;
  content?: unknown;
}

interface ChatBody {
  model?: unknown;
  messages?: unknown;
}

const BACKEND_UNAVAILABLE = {
  error: "backend_unavailable",
  message: "The live model backend is not connected yet.",
} as const;

function json(status: number, body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, { status, ...init });
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

export async function POST(req: Request): Promise<NextResponse> {
  // --- Parse + validate body -------------------------------------------------
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return json(400, {
      error: "bad_request",
      message: "Request body must be valid JSON.",
    });
  }

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return json(400, {
      error: "bad_request",
      message: "`messages` must be a non-empty array.",
    });
  }

  const messages: IncomingMessage[] = [];
  for (const m of rawMessages) {
    if (typeof m !== "object" || m === null) {
      return json(400, {
        error: "bad_request",
        message: "Each message must be an object.",
      });
    }
    const msg = m as IncomingMessage;
    if (typeof msg.content !== "string" || msg.content.length === 0) {
      return json(400, {
        error: "bad_request",
        message: "Each message needs non-empty string `content`.",
      });
    }
    messages.push({ role: msg.role, content: msg.content });
  }

  // --- Auth + rate limit -----------------------------------------------------
  const user = await getSessionUser();
  const ip = getClientIp(req);
  const limitKey = user ? `user:${user.id}` : `ip:${ip}`;
  const limit = checkRateLimit(limitKey, !!user);
  if (!limit.allowed) {
    return json(
      429,
      {
        error: "rate_limited",
        message: "Too many messages. Try again later.",
        retryAfter: limit.resetSeconds,
      },
      { headers: { "Retry-After": String(limit.resetSeconds) } },
    );
  }

  // --- Build the Gradio call -------------------------------------------------
  // Gradio ChatInterface respond(message, history) -> [assistantMsg, history].
  // history is a list of [user, assistant] tuples for all PRIOR turns; the
  // current user turn is passed as `message`, so drop it from history.
  const latestMessage = messages[messages.length - 1]?.content ?? "";
  const history: Array<[string, string]> = [];
  for (let i = 0; i + 1 < messages.length; i += 2) {
    const u = messages[i]?.content;
    const a = messages[i + 1]?.content;
    if (typeof u === "string" && typeof a === "string") {
      history.push([u, a]);
    }
  }

  try {
    const space = process.env.ORKHON_SPACE ?? "korkmazumut/orkhon-demo";
    const token = process.env.ORKHON_HF_TOKEN;
    // ClientOptions.token is typed `hf_${string}`; cast the narrow options
    // object so a plain env string satisfies it without weakening the SDK type.
    const opts = token
      ? ({ token } as { token: `hf_${string}` })
      : undefined;

    const app = await Client.connect(space, opts);
    const result = await app.predict<unknown[]>("respond", [
      latestMessage,
      history,
    ]);

    const data = result.data;
    const first = Array.isArray(data) ? data[0] : undefined;
    const reply =
      typeof first === "string" ? first : JSON.stringify(first ?? "");

    return json(200, { reply });
  } catch (e) {
    console.error("[chat] backend error", e);
    return json(503, BACKEND_UNAVAILABLE);
  }
}
