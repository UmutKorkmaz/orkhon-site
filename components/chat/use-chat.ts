"use client";

// Streaming chat hook for the Orkhon chat surface.
//
// Contract with /api/chat (owned by another agent):
//   POST /api/chat
//   body: { model: string, messages: Array<{ role, content }> }
//   response: either a streamed text/plain body (tokens appended as they
//   arrive) or a JSON error envelope. We do not assume SSE — many backends
//   stream a plain text body. If the response is JSON, we treat it as an
//   error envelope.
//
// We append incoming text to the in-flight assistant message. We never
// mutate messages in place — every update produces a new array (immutability
// rule).

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "./message-thread";
import type { ChatError, ChatErrorKind } from "./error-banner";

interface UseChatResult {
  messages: ChatMessage[];
  sending: boolean;
  awaitingFirstToken: boolean;
  error: ChatError | null;
  send: (model: string, text: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

function makeId(): string {
  // Crypto.randomUUID is available in all modern browsers and Node 19+;
  // fall back to a timestamp-based id just in case.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Classify a raw failure into backend-vs-generic for the error banner. */
function classifyError(
  status: number | null,
  bodySnippet: string,
): ChatErrorKind {
  if (status === null) return "backend"; // network failure / no response
  if (status === 404) return "backend"; // route missing → backend not wired
  if (status >= 500) return "backend"; // upstream / cold backend
  if (status === 429) return "generic"; // rate limit
  if (/backend|warm|cold|unavailable|timeout|gradio|502|503|504/i.test(bodySnippet)) {
    return "backend";
  }
  return "generic";
}

async function readBodySnippet(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text.slice(0, 400);
  } catch {
    return "";
  }
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [awaitingFirstToken, setAwaitingFirstToken] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Mirror of `messages` kept in a ref so `send` can snapshot the current
  // history synchronously (the async fetch needs the value at call time,
  // not after a re-render). Kept in sync via `commit`.
  const historyRef = useRef<ChatMessage[]>([]);
  const commit = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setMessages((prev) => {
        const next = updater(prev);
        historyRef.current = next;
        return next;
      });
    },
    [],
  );

  const send = useCallback(async (model: string, text: string) => {
    if (!text.trim()) return;

    // Drop any previous in-flight request before starting a new one.
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    // Snapshot history *before* seeding so the outbound payload reflects
    // the conversation the model needs to see. Using a ref avoids relying on
    // a state-updater side effect (which double-fires under StrictMode).
    const prior = historyRef.current;

    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content: text,
    };
    const assistantMsg: ChatMessage = {
      id: makeId(),
      role: "assistant",
      content: "",
    };

    // Seed the thread immutably with the new user turn + an empty assistant
    // placeholder that streaming tokens will fill in.
    commit((prev) => [...prev, userMsg, assistantMsg]);
    setSending(true);
    setAwaitingFirstToken(true);
    setError(null);

    // On any failure before the first token, drop the empty assistant
    // placeholder so the thread doesn't show a blank bubble next to an error.
    const dropEmptyAssistant = () => {
      commit((prev) =>
        prev.filter(
          (m) => m.id !== assistantMsg.id || m.content.length > 0,
        ),
      );
    };

    // Outbound payload: prior visible turns + the new user message. We drop
    // any empty assistant placeholder (shouldn't happen, but be safe).
    const outbound = {
      model,
      messages: [
        ...prior
          .filter((m) => m.content.length > 0)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMsg.role, content: userMsg.content },
      ],
    };

    let res: Response;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain; charset=utf-8",
        },
        body: JSON.stringify(outbound),
        signal: controller.signal,
      });
    } catch (networkErr) {
      if (controller.signal.aborted) {
        // User started a new request; do not surface an error.
        return;
      }
      dropEmptyAssistant();
      setSending(false);
      setAwaitingFirstToken(false);
      setError({
        kind: "backend",
        message: networkErr instanceof Error ? networkErr.message : "network error",
      });
      return;
    }

    if (!res.ok || !res.body) {
      const snippet = await readBodySnippet(res);
      dropEmptyAssistant();
      setSending(false);
      setAwaitingFirstToken(false);
      setError({
        kind: classifyError(res.status, snippet),
        message: snippet || `HTTP ${res.status}`,
      });
      return;
    }

    // Detect JSON error envelopes (some backends return JSON on failure even
    // with an Accept: text/plain header). If the body starts with `{` or `[`
    // AND cannot be reasonably parsed as streaming text, treat as error.
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = await readBodySnippet(res);
      dropEmptyAssistant();
      setSending(false);
      setAwaitingFirstToken(false);
      setError({
        kind: classifyError(res.status, json),
        message: json || "unexpected JSON response",
      });
      return;
    }

    // Stream the text body, appending tokens to the assistant message.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        acc += chunk;
        setAwaitingFirstToken(false);
        // Immutable update: replace the assistant message by id.
        commit((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: acc } : m,
          ),
        );
      }
      // Flush any trailing bytes held by the decoder.
      const tail = decoder.decode();
      if (tail) {
        acc += tail;
        commit((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: acc } : m,
          ),
        );
      }
    } catch (streamErr) {
      if (controller.signal.aborted) {
        return;
      }
      if (acc.length === 0) dropEmptyAssistant();
      setSending(false);
      setAwaitingFirstToken(false);
      setError({
        kind: "generic",
        message: streamErr instanceof Error ? streamErr.message : "stream interrupted",
      });
      return;
    }

    // If we never received a token, surface a backend warming-up error
    // rather than leaving an empty assistant bubble.
    if (acc.length === 0) {
      dropEmptyAssistant();
      setError({
        kind: "backend",
        message: "empty response from backend",
      });
    }

    setSending(false);
    setAwaitingFirstToken(false);
  }, [commit]);

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    commit(() => []);
    setError(null);
    setSending(false);
    setAwaitingFirstToken(false);
  }, [commit]);

  return { messages, sending, awaitingFirstToken, error, send, clearError, reset };
}
