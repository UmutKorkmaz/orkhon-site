"use client";

// ChatShell — owns the per-session orchestration for the Orkhon Lab route and
// composes the three consent/history surfaces around the presentational
// ChatSurface.
//
// Responsibilities:
//   1. Read the session (next-auth). Anonymous → no history UI + a subtle
//      "Sign in to save your chats" hint. Signed in → sidebar + consent gate.
//   2. Track consentAccepted. The gate POSTs /api/consent; only after it
//      fires onAccepted do we enable persistence (we still pass
//      conversationId to /api/chat, but the gate hides until accepted and the
//      backend is the final authority on whether saves happen).
//   3. Track the active conversationId. use-chat hands it back via
//      onConversation after each persisted turn; we feed it forward into the
//      next send() so turns append to the right thread. New run resets it.
//   4. Bump a refreshKey after each persisted turn so the history sidebar
//      re-fetches its list.
//
// This component owns all chat-facing state that is NOT the message thread,
// so ChatSurface stays a pure presentational shell.

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { ChatSurface } from "./chat-surface";
import { ModelSelector } from "./model-selector";
import { ModelLabPanel } from "./model-lab-panel";
import { MODELS, LIVE_MODEL_IDS } from "@/lib/models";
import { useChat } from "./use-chat";
import { ConsentGate } from "./consent-gate";
import { HistorySidebar } from "./history-sidebar";
import type { ChatMessage } from "./message-thread";
import "./chat.css";

export function ChatShell() {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  // Avoid flashing history UI during the initial loading state.
  const sessionResolved = status === "authenticated" || status === "unauthenticated";
  // The history sidebar only exists when signed in. When it is absent we must
  // NOT reserve its grid column — otherwise an anonymous visitor sees the
  // whole chat surface shoved into the right column beside an empty gutter.
  const showSidebar = sessionResolved && isSignedIn;

  // Default to the current unified assistant when it is served; otherwise fall
  // back to any live model. This must match a key
  // the family Space knows (see lib/models.ts LIVE_MODEL_IDS).
  const [model, setModel] = useState<string>(() => {
    if (LIVE_MODEL_IDS.has("tangri")) return "tangri";
    return MODELS.find((m) => LIVE_MODEL_IDS.has(m.id))?.id ?? "tangri";
  });
  const [composerDraft, setComposerDraft] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleConversation = useCallback((id: string, persisted: boolean) => {
    setConversationId(id);
    if (persisted) setHistoryRefresh((n) => n + 1);
  }, []);

  const {
    messages,
    sending,
    awaitingFirstToken,
    error,
    send,
    clearError,
    reset,
    load,
  } = useChat({ onConversation: handleConversation });

  const handleAccepted = useCallback(() => {
    setConsentAccepted(true);
  }, []);

  const handleSelectConversation = useCallback(
    (id: string, msgs: ChatMessage[]) => {
      setConversationId(id);
      // Repopulate the thread from the saved conversation.
      load(msgs);
    },
    [load],
  );

  const handleNewChat = useCallback(() => {
    setConversationId(null);
    reset();
  }, [reset]);

  const handleUsePrompt = useCallback((text: string) => {
    setComposerDraft({
      id: Date.now(),
      text,
    });
  }, []);

  return (
    <div
      className={`orkhon-chat-shell${
        showSidebar ? "" : " orkhon-chat-shell--no-sidebar"
      }`}
    >
      {showSidebar && (
        <div className="orkhon-chat-shell__sidebar">
          <HistorySidebar
            activeId={conversationId}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
            refreshKey={historyRefresh}
          />
        </div>
      )}

      <div className="orkhon-chat-shell__main">
        <ChatSurface
          modelSelector={<ModelSelector value={model} onChange={setModel} />}
          modelLab={
            <ModelLabPanel modelId={model} onUsePrompt={handleUsePrompt} />
          }
          composerDraft={composerDraft ?? undefined}
          messages={messages}
          sending={sending}
          awaitingFirstToken={awaitingFirstToken}
          error={error}
          onDismissError={clearError}
          onSend={(text) =>
            send(model, text, {
              conversationId: consentAccepted ? conversationId : null,
            })
          }
          onReset={handleNewChat}
          composerAffix={
            sessionResolved && isSignedIn && !consentAccepted ? (
              <ConsentGate onAccepted={handleAccepted} />
            ) : undefined
          }
        />
      </div>

      <ChatShellStyles />
    </div>
  );
}

/* ---------- styles ---------- */

function ChatShellStyles() {
  return (
    <style>{`
      .orkhon-chat-shell {
        display: grid;
        grid-template-columns: minmax(220px, 280px) 1fr;
        gap: clamp(1rem, 0.75rem + 1vw, 2rem);
        align-items: start;
      }
      /* Anonymous / loading: no sidebar → drop the reserved column so the
         chat surface fills the full width instead of hugging the right side. */
      .orkhon-chat-shell--no-sidebar {
        grid-template-columns: 1fr;
      }
      .orkhon-chat-shell__sidebar {
        position: sticky;
        top: clamp(1rem, 0.75rem + 1vw, 2rem);
        max-height: calc(100vh - 6rem);
        overflow: hidden;
      }
      .orkhon-chat-shell__main {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      @media (max-width: 980px) {
        .orkhon-chat-shell {
          grid-template-columns: 1fr;
        }
        .orkhon-chat-shell__sidebar {
          position: static;
          max-height: none;
          order: 2;
        }
        .orkhon-chat-shell__main {
          order: 1;
        }
      }

      /* ============ consent gate ============ */
      .orkhon-consent {
        border: 1px solid var(--ochre-dim);
        border-radius: var(--radius-lg);
        background:
          radial-gradient(120% 80% at 50% -10%, rgba(192, 138, 62, 0.06), transparent 60%),
          linear-gradient(180deg, var(--bg-1), var(--bg-0));
        padding: clamp(1rem, 0.85rem + 0.8vw, 1.5rem);
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        margin-bottom: 0.4rem;
      }
      .orkhon-consent--loading {
        border-color: var(--line);
        flex-direction: row;
        align-items: center;
        gap: 0.55rem;
        padding: 0.7rem 0.95rem;
      }
      .orkhon-consent__head {
        display: flex;
        align-items: center;
        gap: 0.55rem;
      }
      .orkhon-consent__icon { color: var(--ochre); flex: none; }
      .orkhon-consent__title {
        font-family: var(--font-serif);
        font-size: 1.1rem;
        color: var(--ink-0);
        margin: 0;
      }
      .orkhon-consent__intro {
        margin: 0;
        color: var(--ink-1);
        font-size: 0.9rem;
        line-height: 1.55;
      }
      .orkhon-consent__policy {
        border-left: 2px solid var(--ochre-dim);
        padding: 0.5rem 0 0.5rem 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .orkhon-consent__policy-label {
        font-family: var(--font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--ink-3);
      }
      .orkhon-consent__policy-body {
        margin: 0;
        color: var(--ink-2);
        font-size: 0.84rem;
        line-height: 1.6;
      }
      .orkhon-consent__actions {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        flex-wrap: wrap;
        margin-top: 0.2rem;
      }
      .orkhon-consent__decline {
        font-size: 0.78rem;
        color: var(--ink-2);
        line-height: 1.4;
      }
      .orkhon-consent__note {
        margin: 0;
        font-size: 0.8rem;
        color: var(--rust);
        line-height: 1.4;
      }
      .orkhon-consent__note--error { display: inline; }
      .orkhon-consent__retry {
        background: none;
        border: 1px solid var(--line-strong);
        border-radius: var(--radius);
        color: var(--ink-1);
        font-family: var(--font-mono);
        font-size: 0.72rem;
        padding: 0.2rem 0.5rem;
        cursor: pointer;
        margin-left: 0.3rem;
        transition: border-color var(--duration-fast) ease, color var(--duration-fast) ease;
      }
      .orkhon-consent__retry:hover { border-color: var(--ochre); color: var(--ink-0); }
      .orkhon-consent__spinner {
        animation: orkhon-spin 0.9s linear infinite;
      }
      @keyframes orkhon-spin {
        to { transform: rotate(360deg); }
      }

      /* ============ history sidebar ============ */
      .orkhon-history {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        background: linear-gradient(180deg, var(--bg-1), var(--bg-0));
        padding: clamp(0.85rem, 0.7rem + 0.6vw, 1.1rem);
        height: 100%;
      }
      .orkhon-history__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .orkhon-history__heading {
        font-family: var(--font-mono);
        font-size: 0.66rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--ink-3);
        margin: 0;
      }
      .orkhon-history__new {
        padding: 0.35rem 0.65rem;
        font-size: 0.72rem;
        gap: 0.3rem;
      }
      .orkhon-history__list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        overflow-y: auto;
        max-height: calc(100vh - 14rem);
        padding-right: 0.2rem;
        margin-right: -0.2rem;
      }
      .orkhon-history__status {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.8rem;
        color: var(--ink-2);
        padding: 0.6rem 0.2rem;
      }
      .orkhon-history__status--error { color: var(--rust); flex-wrap: wrap; }
      .orkhon-history__retry {
        background: none;
        border: 1px solid var(--line-strong);
        border-radius: var(--radius);
        color: var(--ink-1);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        padding: 0.15rem 0.45rem;
        cursor: pointer;
        margin-left: 0.2rem;
        transition: border-color var(--duration-fast) ease, color var(--duration-fast) ease;
      }
      .orkhon-history__retry:hover { border-color: var(--ochre); color: var(--ink-0); }
      .orkhon-history__empty {
        margin: 0;
        color: var(--ink-3);
        font-size: 0.82rem;
        line-height: 1.55;
        padding: 0.8rem 0.2rem;
      }
      .orkhon-history__row {
        display: flex;
        align-items: stretch;
        gap: 0.1rem;
        border-radius: var(--radius);
        border: 1px solid transparent;
        transition: border-color var(--duration-fast) ease, background var(--duration-fast) ease;
      }
      .orkhon-history__row:hover {
        background: var(--bg-3);
      }
      .orkhon-history__row.is-active {
        border-color: var(--ochre-dim);
        background: rgba(192, 138, 62, 0.06);
      }
      .orkhon-history__open {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem 0.55rem;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        color: var(--ink-1);
      }
      .orkhon-history__open:hover { color: var(--ink-0); }
      .orkhon-history__open:disabled { cursor: progress; opacity: 0.6; }
      .orkhon-history__icon {
        flex: none;
        margin-top: 0.1rem;
        color: var(--ink-3);
      }
      .is-active .orkhon-history__icon { color: var(--ochre); }
      .orkhon-history__meta {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        min-width: 0;
      }
      .orkhon-history__title {
        font-size: 0.84rem;
        color: inherit;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .orkhon-history__sub {
        font-family: var(--font-mono);
        font-size: 0.66rem;
        color: var(--ink-3);
        letter-spacing: 0.02em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .orkhon-history__err {
        font-size: 0.68rem;
        color: var(--rust);
      }
      .orkhon-history__del {
        flex: none;
        align-self: center;
        background: none;
        border: 1px solid transparent;
        border-radius: var(--radius);
        color: var(--ink-3);
        padding: 0.3rem;
        cursor: pointer;
        opacity: 0;
        transition: color var(--duration-fast) ease, border-color var(--duration-fast) ease, opacity var(--duration-fast) ease, background var(--duration-fast) ease;
      }
      .orkhon-history__row:hover .orkhon-history__del,
      .orkhon-history__row:focus-within .orkhon-history__del {
        opacity: 1;
      }
      .orkhon-history__del:hover:not(:disabled) {
        color: var(--rust);
        border-color: var(--rust);
        background: rgba(194, 90, 58, 0.08);
      }
      .orkhon-history__del:disabled { cursor: progress; }
      .orkhon-history__spinner {
        animation: orkhon-spin 0.9s linear infinite;
      }

      /* Touch / coarse pointers: always show the delete affordance. */
      @media (pointer: coarse) {
        .orkhon-history__del { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .orkhon-consent__spinner,
        .orkhon-history__spinner {
          animation: none;
        }
        .orkhon-history__row,
        .orkhon-history__open,
        .orkhon-history__del,
        .orkhon-consent__retry,
        .orkhon-history__retry {
          transition: none;
        }
      }
    `}</style>
  );
}
