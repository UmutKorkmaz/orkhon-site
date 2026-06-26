"use client";

// Message thread for the Orkhon chat surface.
//
// Responsibilities:
//   - Render the running list of {role, content} messages.
//   - User messages render as plain (escaped) text in a tight bubble.
//   - Assistant messages render through the Markdown component (the only
//     place assistant output is interpreted).
//   - A streaming "composing" indicator shows when an assistant turn is in
//     flight but no tokens have arrived yet.
//   - Auto-scroll to the bottom as tokens stream in, unless the reader has
//     scrolled up to read history (then we don't yank them down).
//
// Content from the model is treated as untrusted markup and only ever
// reaches the DOM through the Markdown renderer, which escapes before
// re-interpreting syntax.

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Markdown } from "./markdown";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageThreadProps {
  messages: ChatMessage[];
  /** True while we are waiting on the first token of an assistant turn. */
  awaitingFirstToken: boolean;
}

const STREAMING_PLACEHOLDER: { en: string; tr: string } = {
  en: "Carving the response…",
  tr: "Yanıt kazınıyor…",
};

export function MessageThread({
  messages,
  awaitingFirstToken,
}: MessageThreadProps) {
  const { t } = useLang();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);

  // Track whether the reader is near the bottom. If they scrolled up, we
  // stop auto-scrolling so streaming tokens don't pull them down.
  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedRef.current = distance < 80;
  }

  useEffect(() => {
    if (!pinnedRef.current) return;
    tailRef.current?.scrollIntoView({ block: "end" });
  }, [messages, awaitingFirstToken]);

  const isEmpty = messages.length === 0 && !awaitingFirstToken;

  if (isEmpty) {
    return <EmptyState />;
  }

  return (
    <div
      ref={scrollerRef}
      className="orkhon-thread"
      onScroll={onScroll}
      role="log"
      aria-live="polite"
      aria-label="Lab run"
    >
      <div className="orkhon-thread__inner">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {awaitingFirstToken && (
          <div className="orkhon-msg orkhon-msg--assistant">
            <div className="orkhon-msg__avatar" aria-hidden="true">
              <Sparkles size={14} />
            </div>
            <div className="orkhon-msg__bubble orkhon-msg__bubble--assistant">
              <span className="orkhon-thread__composing" role="status">
                <span className="orkhon-thread__dot" />
                <span className="orkhon-thread__dot" />
                <span className="orkhon-thread__dot" />
                <span className="orkhon-thread__composing-label">
                  {t(STREAMING_PLACEHOLDER)}
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={tailRef} aria-hidden="true" />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`orkhon-msg orkhon-msg--${message.role}`}>
      {isUser ? (
        <div
          className="orkhon-msg__bubble orkhon-msg__bubble--user"
          // User content is echoed back as plain text; React escapes it.
        >
          {message.content}
        </div>
      ) : (
        <>
          <div className="orkhon-msg__avatar" aria-hidden="true">
            <Sparkles size={14} />
          </div>
          <div className="orkhon-msg__bubble orkhon-msg__bubble--assistant">
            <Markdown content={message.content} />
          </div>
        </>
      )}
    </div>
  );
}

const EMPTY_STATE: { en: { title: string; body: string }; tr: { title: string; body: string } } = {
  en: {
    title: "Begin the inscription",
    body: "Pick a model, load a prepared run, edit the prompt, and Orkhon writes back.",
  },
  tr: {
    title: "Yazıtı başlat",
    body: "Bir model seç, hazır denemeyi yükle, promptu düzenle ve Orkhon yanıtlasın.",
  },
};

function EmptyState() {
  const { t } = useLang();
  const copy = t(EMPTY_STATE);
  return (
    <div className="orkhon-thread__empty">
      <div className="orkhon-thread__empty-mark" aria-hidden="true">
        𐰆
      </div>
      <h2 className="orkhon-thread__empty-title">{copy.title}</h2>
      <p className="orkhon-thread__empty-body">{copy.body}</p>
    </div>
  );
}
