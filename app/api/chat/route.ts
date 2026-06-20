// Chat backend for the Orkhon site.
//
// Proxies visitor messages to the Orkhon Hugging Face Space (a Gradio
// ChatInterface whose fn is named "respond") using @gradio/client. No paid API
// is ever called — the Space is the only model backend.
//
// Persistence contract (KVKK / GDPR aware):
//   - Anonymous visitors: NEVER persisted. They still get a reply.
//   - Signed-in but has NOT accepted the current policy: still answered, but
//     nothing is written and the response carries { persisted: false }.
//   - Signed-in AND has accepted the current policy (lib/consent):
//       * ensure a Conversation exists (reuse body.conversationId if present
//         and owned by the user; otherwise create a new one titled from the
//         first user message),
//       * append the user Message BEFORE calling the model,
//       * append the assistant Message AFTER receiving the reply.
//   - DB failures are swallowed: a persistence error must never break chat.
//     The model reply is always returned; on a swallowed DB error `persisted`
//     is false and `conversationId` reflects whatever (if anything) we have.
//
// Failure contract: if the Space is unreachable, private, or sleeping, the
// handler returns HTTP 503 with a stable JSON shape so the UI can show a
// friendly "backend not connected yet" message instead of a stack trace.

import { Client } from "@gradio/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import {
  getCurrentUser,
  isUnauthorizedError,
} from "@/lib/consent";
import {
  deterministicAssistantReply,
  fallbackAssistantReply,
  isDegenerateAssistantReply,
} from "@/lib/assistant-router";

export const runtime = "nodejs";

interface IncomingMessage {
  role?: unknown;
  content?: unknown;
}

interface ChatBody {
  model?: unknown;
  messages?: unknown;
  conversationId?: unknown;
}

const BACKEND_UNAVAILABLE = {
  error: "backend_unavailable",
  message: "The live model backend is not connected yet.",
} as const;

// Distinct signal for a reachable-but-slow backend: the Space is waking from
// sleep / still loading the model (cold start after a HF maintenance restart).
// Kept 503 so the existing error path renders it, but the `waking_up` code lets
// the UI show a friendlier "try again in a moment" than a generic outage.
const BACKEND_WAKING_UP = {
  error: "waking_up",
  message: "The model is waking up. Try again in a few seconds.",
} as const;

/** Sentinel rejected by `withTimeout` when a backend phase overruns its budget. */
class BackendTimeout extends Error {}

/** Race a promise against a deadline so a cold backend never hangs the client. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new BackendTimeout()), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

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

/**
 * Resolve the caller to a persistence-capable identity, or null for anonymous.
 *
 * `getCurrentUser(db)` upserts the User and reports consent state; it throws
 * the UNAUTHORIZED sentinel when there is no session. Anonymous chat is fully
 * allowed, so we catch that sentinel and return null instead of surfacing 401.
 * Any other thrown error also degrades to anonymous (no persist) so chat never
 * breaks on a DB hiccup.
 *
 * Returns { userId, hasAccepted } only for a signed-in user.
 */
async function resolvePersistenceIdentity(): Promise<{
  userId: string;
  hasAccepted: boolean;
} | null> {
  try {
    const { user, hasAccepted } = await getCurrentUser(db);
    return { userId: user.id, hasAccepted };
  } catch (e) {
    if (isUnauthorizedError(e)) return null; // anonymous — expected, not an error
    console.error("[chat] resolvePersistenceIdentity failed", e);
    return null; // DB error → degrade to anonymous; chat must still work
  }
}

/**
 * Resolve (or create) the Conversation to persist this turn into.
 *
 * - If the body carries a `conversationId`, reuse it ONLY if it exists and is
 *   owned by this user (ownership-checked, never trust client-supplied ids).
 *   A foreign/missing id falls through to "create new" so a bad client value
 *   can never cross-link to another user's history.
 * - Otherwise create a new conversation titled from the first user message.
 *
 * Returns null if persistence should be skipped for any reason (DB error,
 * nothing to title from). All errors are swallowed by the caller's try/catch.
 */
async function ensureConversation(
  userId: string,
  conversationIdFromClient: string | null,
  title: string,
  model: string,
): Promise<{ id: string } | null> {
  if (conversationIdFromClient) {
    const owned = await db.conversation.findFirst({
      where: { id: conversationIdFromClient, userId },
      select: { id: true },
    });
    if (owned) return owned;
    // Foreign or stale id: do NOT reuse — fall through to create a new one.
  }
  const created = await db.conversation.create({
    data: { userId, model, title },
    select: { id: true },
  });
  return created;
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

  // Optional client-supplied conversation id. Validated against ownership in
  // ensureConversation; an untrusted value never reaches the DB as a write key.
  const conversationIdFromClient =
    typeof body.conversationId === "string" && body.conversationId.length > 0
      ? body.conversationId
      : null;

  const modelFromClient =
    typeof body.model === "string" && body.model.length > 0
      ? body.model
      : "unknown";

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

  // --- Resolve persistence identity (signed-in + consent) -------------------
  // Anonymous (no session) → identity is null → we never persist.
  // Signed-in but hasAccepted=false → we still answer, but do not persist.
  const identity = await resolvePersistenceIdentity();
  const shouldPersist = identity !== null && identity.hasAccepted;

  // State carried across the persistence block so the final JSON can report
  // which conversation the turn landed in, regardless of success/failure.
  let conversationId: string | null = null;
  let persisted = false;

  // The latest user turn (the one being answered right now). `content` is
  // typed `unknown` on IncomingMessage (validation is structural); narrow to a
  // real string here so downstream writes/history are type-safe.
  const latestRaw = messages[messages.length - 1]?.content;
  const latestMessage =
    typeof latestRaw === "string" ? latestRaw : "";
  // First user message in the batch — used as a title for brand-new
  // conversations. Trim + clip so a leading-space or very long first message
  // doesn't become an unwieldy title; fall back to "New chat".
  const firstRaw = messages[0]?.content;
  const firstUserContent =
    (typeof firstRaw === "string" ? firstRaw : "")
      .trim()
      .slice(0, 80) || "New chat";

  // --- Persist the user turn (before calling the model) ---------------------
  // Only when consented. Wrapped end-to-end: any DB error is swallowed and we
  // proceed to answer the chat. `persisted` stays false in that case.
  if (shouldPersist && identity) {
    try {
      const conversation = await ensureConversation(
        identity.userId,
        conversationIdFromClient,
        firstUserContent,
        modelFromClient,
      );
      if (conversation) {
        conversationId = conversation.id;
        await db.message.create({
          data: {
            conversationId: conversation.id,
            role: "user",
            content: latestMessage,
          },
        });
      }
    } catch (e) {
      // Non-negotiable: DB must never break chat. Reset partial state so the
      // post-reply write below also no-ops against a half-created conversation.
      console.error("[chat] persist user turn failed", e);
      conversationId = null;
    }
  }

  // --- Build the Gradio call -------------------------------------------------
  // Gradio ChatInterface respond(message, history) -> [assistantMsg, history].
  // history is a list of [user, assistant] tuples for all PRIOR turns; the
  // current user turn is passed as `message`, so drop it from history.
  const history: Array<[string, string]> = [];
  for (let i = 0; i + 1 < messages.length; i += 2) {
    const u = messages[i]?.content;
    const a = messages[i + 1]?.content;
    if (typeof u === "string" && typeof a === "string") {
      history.push([u, a]);
    }
  }

  try {
    let reply = deterministicAssistantReply(latestMessage);

    if (reply === null) {
      const space = process.env.ORKHON_SPACE ?? "korkmazumut/orkhon-demo";
      const token = process.env.ORKHON_HF_TOKEN;
      // ClientOptions.token is typed `hf_${string}`; cast the narrow options
      // object so a plain env string satisfies it without weakening the SDK type.
      const opts = token
        ? ({ token } as { token: `hf_${string}` })
        : undefined;

      // Bound both phases so a cold/asleep backend fails fast with a clear
      // "waking up" message instead of holding the request open for minutes while
      // the browser sits on the composing dots.
      const app = await withTimeout(Client.connect(space, opts), 20_000);
      const result = await withTimeout(
        app.predict<unknown[]>("respond", [
          latestMessage,
          history,
          modelFromClient,
        ]),
        35_000,
      );

      const data = result.data;
      const first = Array.isArray(data) ? data[0] : undefined;
      reply =
        typeof first === "string" ? first : JSON.stringify(first ?? "");

      if (isDegenerateAssistantReply(reply, latestMessage)) {
        reply = fallbackAssistantReply(latestMessage);
      }
    }

    // --- Persist the assistant reply (after receiving it) -------------------
    // Same consent gate + same swallow-on-error rule. If the user-turn write
    // failed above (conversationId is null), there is nothing to attach the
    // reply to, so we skip cleanly.
    if (shouldPersist && conversationId) {
      try {
        await db.message.create({
          data: {
            conversationId,
            role: "assistant",
            content: reply,
          },
        });
        // Both rows wrote — only now do we report persistence success.
        persisted = true;
      } catch (e) {
        console.error("[chat] persist assistant turn failed", e);
        persisted = false;
      }
    }

    return json(200, { reply, conversationId, persisted });
  } catch (e) {
    if (e instanceof BackendTimeout) {
      // Reachable but slow (cold start): keep 503 but signal "waking up".
      return json(503, BACKEND_WAKING_UP);
    }
    console.error("[chat] backend error", e);
    return json(503, BACKEND_UNAVAILABLE);
  }
}
