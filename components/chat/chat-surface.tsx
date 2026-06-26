"use client";

// ChatSurface — the assembled layout for the Orkhon Lab route.
//
// This is a presentational shell: it lays out the header (kicker, model
// selector, session status, reset), the scrolling message thread, the error
// banner, and the composer. All state is passed in via props so the page
// can wire it to useChat() without this component knowing about fetching.
//
// Bilingual copy lives here (kicker, title, reset label, aria labels) and is
// resolved through useLang(). Design tokens come from globals.css; chat
// surface styles live in chat.css, injected at the bottom of this file so
// the component is self-contained and co-located with its markup.

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { SessionStatus } from "./session-status";
import { MessageThread, type ChatMessage } from "./message-thread";
import { ErrorBanner, type ChatError } from "./error-banner";
import { Composer } from "./composer";
import "./chat.css";

const COPY = {
  kicker: {
    en: "Model-based language lab",
    tr: "Model tabanlı dil laboratuvarı",
  },
  title: {
    en: "Orkhon Lab",
    tr: "Orkhon Lab",
  },
  intro: {
    en: "Select a live Orkhon family model, load a prepared experiment, edit the prompt, and run it against the same backend that serves the public demo.",
    tr: "Canlı bir Orkhon ailesi modeli seç, hazırlanmış deneyi yükle, promptu düzenle ve public demoyu sunan aynı backend üzerinde çalıştır.",
  },
  reset: {
    en: "New run",
    tr: "Yeni deneme",
  },
} as const;

interface ChatSurfaceProps {
  modelSelector: ReactNode;
  messages: ChatMessage[];
  sending: boolean;
  awaitingFirstToken: boolean;
  error: ChatError | null;
  onDismissError: () => void;
  onSend: (text: string) => void;
  onReset: () => void;
  modelLab?: ReactNode;
  composerDraft?: {
    id: number;
    text: string;
  };
  /** Optional node rendered directly above the composer (e.g. consent gate). */
  composerAffix?: ReactNode;
}

export function ChatSurface({
  modelSelector,
  messages,
  sending,
  awaitingFirstToken,
  error,
  onDismissError,
  onSend,
  onReset,
  modelLab,
  composerDraft,
  composerAffix,
}: ChatSurfaceProps) {
  const { t } = useLang();
  const modelLabel = t(MODEL_LABEL);
  const hasMessages = messages.length > 0;

  return (
    <section className="orkhon-chat" aria-label={t(COPY.title)}>
      <header className="orkhon-chat__header orkhon-container">
        <div className="orkhon-chat__heading">
          <span className="orkhon-kicker">{t(COPY.kicker)}</span>
          <h1 className="orkhon-chat__title">{t(COPY.title)}</h1>
          <p className="orkhon-chat__intro">{t(COPY.intro)}</p>
        </div>

        <div className="orkhon-chat__controls">
          <div className="orkhon-chat__control-row">
            <span
              className="orkhon-chat__control-label"
              id="orkhon-model-label"
            >
              {modelLabel}
            </span>
            {modelSelector}
          </div>
          <SessionStatus />
        </div>
      </header>

      <div className="orkhon-chat__body orkhon-container">
        {modelLab && <div className="orkhon-chat__lab">{modelLab}</div>}

        <MessageThread
          messages={messages}
          awaitingFirstToken={awaitingFirstToken}
        />

        {error && (
          <div className="orkhon-chat__error-wrap">
            <ErrorBanner error={error} onDismiss={onDismissError} />
          </div>
        )}

        <div className="orkhon-chat__composer-wrap">
          {composerAffix}
          {hasMessages && (
            <button
              type="button"
              className="orkhon-chat__reset"
              onClick={onReset}
              disabled={sending}
              aria-label={t(COPY.reset)}
            >
              <RotateCcw size={13} aria-hidden="true" />
              {t(COPY.reset)}
            </button>
          )}
          <Composer onSend={onSend} disabled={sending} draft={composerDraft} />
        </div>
      </div>

      <ChatStyles />
    </section>
  );
}

const MODEL_LABEL: { en: string; tr: string } = {
  en: "Model",
  tr: "Model",
};

/* ---------- styles ---------- */

function ChatStyles() {
  return (
    <style>{`
      .orkhon-chat {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 4rem);
      }

      /* ---- header ---- */
      .orkhon-chat__header {
        padding-top: clamp(2.5rem, 2rem + 2vw, 4rem);
        padding-bottom: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: clamp(1.5rem, 1rem + 2vw, 3rem);
        align-items: end;
        border-bottom: 1px solid var(--line);
      }
      .orkhon-chat__heading { min-width: 0; }
      .orkhon-chat__title {
        font-size: clamp(2.2rem, 1.6rem + 2.4vw, 3.4rem);
        margin-top: 0.6rem;
      }
      .orkhon-chat__intro {
        margin-top: 0.75rem;
        color: var(--ink-2);
        max-width: 52ch;
        font-size: 0.96rem;
        line-height: 1.55;
      }

      .orkhon-chat__controls {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        align-items: stretch;
        min-width: 0;
      }
      .orkhon-chat__control-row {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }
      .orkhon-chat__control-label {
        font-family: var(--font-mono);
        font-size: 0.66rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--ink-3);
      }

      @media (max-width: 880px) {
        .orkhon-chat__header {
          grid-template-columns: 1fr;
          align-items: start;
        }
      }

      /* ---- body ---- */
      .orkhon-chat__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding-block: clamp(1rem, 0.75rem + 1vw, 1.75rem);
        min-height: 0;
      }
      .orkhon-chat__lab {
        margin-bottom: clamp(1rem, 0.8rem + 1vw, 1.5rem);
      }

      .orkhon-chat__error-wrap {
        margin-top: 0.75rem;
      }
      .orkhon-chat__composer-wrap {
        margin-top: 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }
      .orkhon-chat__reset {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-family: var(--font-mono);
        font-size: 0.74rem;
        letter-spacing: 0.06em;
        color: var(--ink-2);
        background: transparent;
        border: 1px solid var(--line-strong);
        border-radius: var(--radius);
        padding: 0.4rem 0.75rem;
        cursor: pointer;
        transition: color var(--duration-fast) ease, border-color var(--duration-fast) ease, background var(--duration-fast) ease;
      }
      .orkhon-chat__reset:hover:not(:disabled) {
        color: var(--ink-0);
        border-color: var(--ochre);
        background: var(--bg-3);
      }
      .orkhon-chat__reset:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `}</style>
  );
}
