"use client";

// Streaming chat hook for the Orkhon chat surface.
//
// Contract with /api/chat (owned by another agent):
//   POST /api/chat
//   body: {
//     model: string,
//     messages: Array<{ role, content }>,
//     conversationId?: string,   // present when appending to a saved thread
//   }
//   response: either
//     (a) a streamed text/plain body (tokens appended as they arrive) with a
//         trailing JSON-shape trailer is NOT expected; OR
//     (b) a JSON envelope. Two successful JSON shapes are supported:
//           { reply: string }                          — legacy, no persistence
//           { reply?: string, conversationId, persisted } — persisted turn
//         Any JSON envelope without `reply` and without `conversationId` is
//         treated as an error envelope.
//   We do not assume SSE — many backends stream a plain text body.
//
// `onConversation` is fired once the backend hands back a conversationId so
// the page can pin the active thread and let the history sidebar refresh.
//
// We append incoming text to the in-flight assistant message. We never
// mutate messages in place — every update produces a new array (immutability
// rule).

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "./message-thread";
import type { ChatError, ChatErrorKind } from "./error-banner";

/** Tolerant shape for any JSON body the chat backend may return. */
interface ChatJsonEnvelope {
  reply?: unknown;
  conversationId?: unknown;
  persisted?: unknown;
  error?: unknown;
  message?: unknown;
}

interface UseChatResult {
  messages: ChatMessage[];
  sending: boolean;
  awaitingFirstToken: boolean;
  error: ChatError | null;
  send: (
    model: string,
    text: string,
    options?: { conversationId?: string | null },
  ) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  /** Replace the thread (used when opening a saved conversation). */
  load: (messages: ChatMessage[]) => void;
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

export function useChat(
  options?: {
    /** Fired when the backend returns a conversationId for the active thread. */
    onConversation?: (conversationId: string, persisted: boolean) => void;
  },
): UseChatResult {
  const onConversation = options?.onConversation;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [awaitingFirstToken, setAwaitingFirstToken] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onConversationRef = useRef(onConversation);
  // Keep the ref fresh without making `send` depend on the callback identity
  // (which would otherwise invalidate the memoized send on every parent render).
  useEffect(() => {
    onConversationRef.current = onConversation;
  }, [onConversation]);

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

  const send = useCallback(
    async (
      model: string,
      text: string,
      sendOptions?: { conversationId?: string | null },
    ) => {
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
    // Include conversationId when appending to a saved thread.
    const outbound: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      conversationId?: string;
    } = {
      model,
      messages: [
        ...prior
          .filter((m) => m.content.length > 0)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMsg.role, content: userMsg.content },
      ],
    };
    if (sendOptions?.conversationId) {
      outbound.conversationId = sendOptions.conversationId;
    }

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

    // The backend may answer with either a streamed text/plain body OR a
    // JSON envelope. Two successful JSON shapes are supported:
    //   { reply: string }                              — legacy
    //   { reply?: string, conversationId, persisted }  — persisted turn
    // Any other JSON is treated as an error envelope.
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const raw = await readBodySnippet(res);
      let parsed: ChatJsonEnvelope | null = null;
      try {
        parsed = JSON.parse(raw) as ChatJsonEnvelope;
      } catch {
        parsed = null;
      }

      const replyStr =
        parsed !== null && typeof parsed.reply === "string"
          ? parsed.reply
          : "";
      const convId =
        parsed !== null && typeof parsed.conversationId === "string"
          ? parsed.conversationId
          : null;
      const persisted = parsed?.persisted === true;

      if (replyStr || convId) {
        // Success: fill the assistant bubble with the reply (if any) and
        // report the conversation id back so the page can pin the thread.
        setAwaitingFirstToken(false);
        if (replyStr) {
          commit((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: replyStr } : m,
            ),
          );
        } else {
          dropEmptyAssistant();
        }
        if (convId) onConversationRef.current?.(convId, persisted);
        setSending(false);
        setAwaitingFirstToken(false);
        return;
      }

      // No reply and no conversationId → genuine error envelope.
      dropEmptyAssistant();
      setSending(false);
      setAwaitingFirstToken(false);
      const msg =
        (parsed !== null && typeof parsed.message === "string" && parsed.message) ||
        (parsed !== null && typeof parsed.error === "string" && parsed.error) ||
        raw ||
        "unexpected JSON response";
      setError({
        kind: classifyError(res.status, msg),
        message: msg,
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

  // Replace the entire thread — used when a user opens a saved conversation
  // from the history sidebar. Aborts any in-flight stream first and clears
  // transient error/streaming state so the loaded messages render cleanly.
  const load = useCallback(
    (incoming: ChatMessage[]) => {
      abortRef.current?.abort();
      const next = incoming.map((m) => ({ ...m }));
      commit(() => next);
      setError(null);
      setSending(false);
      setAwaitingFirstToken(false);
    },
    [commit],
  );

  return { messages, sending, awaitingFirstToken, error, send, clearError, reset, load };
}
