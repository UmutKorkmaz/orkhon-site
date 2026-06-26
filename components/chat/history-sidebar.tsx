"use client";

// HistorySidebar — list of the signed-in user's saved conversations, shown
// alongside the chat surface. Newest first. Click to load (repopulate the
// thread); per-row delete (right-to-erasure). Includes a "New run" action.
//
// Contract with /api/conversations (owned by another agent):
//   GET /api/conversations
//     200 → { conversations: Conversation[] }
//   GET /api/conversations/[id]
//     200 → { conversation: { id, title?, messages: ChatMessage[] } }
//   DELETE /api/conversations/[id]
//     200 → { deleted: true }
//
// The sidebar is purely a list + actions component. It is fed the current
// conversationId and reports selection/deletion/new-chat upward via props so
// the page owns the single source of truth. Failure-tolerant: a failed list
// fetch shows a retry; a failed delete rolls back the optimistic removal.

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { ChatMessage } from "./message-thread";

/* ---------- shapes ---------- */

export interface ConversationSummary {
  id: string;
  title?: string;
  /** Optional ISO timestamp; we sort newest-first by this when present. */
  updatedAt?: string;
  createdAt?: string;
  /** Optional preview snippet for the row. */
  preview?: string;
}

interface ListResponse {
  conversations?: ConversationSummary[];
}

interface DetailResponse {
  conversation?: {
    id: string;
    title?: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };
}

interface HistorySidebarProps {
  /** Currently loaded conversation id, or null for a fresh thread. */
  activeId: string | null;
  /** Open an existing conversation (loads its messages). */
  onSelect: (id: string, messages: ChatMessage[]) => void;
  /** Start a brand-new thread (clears the surface). */
  onNewChat: () => void;
  /** Bump a version counter to force a list refresh after a saved turn. */
  refreshKey?: number;
}

/* ---------- copy ---------- */

const COPY = {
  heading: { en: "Saved runs", tr: "Kayıtlı denemeler" },
  newChat: { en: "New run", tr: "Yeni deneme" },
  empty: {
    en: "No saved runs yet. Accept consent and run a prepared prompt — your Lab history will appear here.",
    tr: "Henüz kayıtlı deneme yok. İzni kabul edip hazırlanmış bir prompt çalıştır — Lab geçmişin burada görünecek.",
  },
  loading: { en: "Loading runs…", tr: "Denemeler yükleniyor…" },
  loadError: { en: "Couldn't load runs.", tr: "Denemeler yüklenemedi." },
  loadErrorHint: { en: "Retry", tr: "Tekrar dene" },
  deleteError: { en: "Delete failed — restored.", tr: "Silinemedi — geri yüklendi." },
  deleteLabel: { en: "Delete saved run", tr: "Kayıtlı denemeyi sil" },
  openLabel: { en: "Open saved run", tr: "Kayıtlı denemeyi aç" },
  untitled: { en: "Untitled run", tr: "Başlıksız deneme" },
} as const;

function stableId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function relativeTime(iso: string | undefined, lang: "en" | "tr"): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const diff = Date.now() - t;
  const min = Math.round(diff / 60000);
  const hr = Math.round(diff / 3600000);
  const day = Math.round(diff / 86400000);
  if (lang === "tr") {
    if (min < 1) return "şimdi";
    if (min < 60) return `${min} dk önce`;
    if (hr < 24) return `${hr} sa önce`;
    if (day < 7) return `${day} gün önce`;
    return new Date(t).toLocaleDateString("tr-TR");
  }
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return new Date(t).toLocaleDateString("en-US");
}

export function HistorySidebar({
  activeId,
  onSelect,
  onNewChat,
  refreshKey = 0,
}: HistorySidebarProps) {
  const { t, lang } = useLang();
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setListError(false);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/conversations", {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ListResponse;
      const list = Array.isArray(data.conversations) ? data.conversations : [];
      // Sort newest-first: updatedAt → createdAt → preserve order.
      const sorted = [...list].sort((a, b) => {
        const ta = Date.parse(a.updatedAt ?? a.createdAt ?? "");
        const tb = Date.parse(b.updatedAt ?? b.createdAt ?? "");
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return tb - ta;
      });
      setItems(sorted);
    } catch {
      if (controller.signal.aborted) return;
      setListError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
    return () => abortRef.current?.abort();
  }, [fetchList, refreshKey]);

  const openConversation = useCallback(
    async (id: string) => {
      if (id === activeId) return;
      setLoadingId(id);
      try {
        const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as DetailResponse;
        const conv = data.conversation;
        if (!conv || !Array.isArray(conv.messages)) {
          throw new Error("malformed conversation");
        }
        const messages: ChatMessage[] = conv.messages
          .filter(
            (m) =>
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string",
          )
          .map((m) => ({
            id: stableId(),
            role: m.role,
            content: m.content,
          }));
        onSelect(id, messages);
      } catch {
        // Fall back to selecting with no messages so the header still updates;
        // the user can retry by clicking again. Keep it quiet — no toast.
        onSelect(id, []);
      } finally {
        setLoadingId(null);
      }
    },
    [activeId, onSelect],
  );

  const removeConversation = useCallback(
    async (id: string) => {
      if (deletingId) return;
      setDeletingId(id);
      setDeleteErrorId(null);
      // Optimistic removal: snapshot for rollback.
      const snapshot = items;
      setItems((prev) => prev.filter((c) => c.id !== id));
      try {
        const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // If the deleted conversation was active, surface a fresh thread.
        if (id === activeId) onNewChat();
      } catch {
        setItems(snapshot); // rollback
        setDeleteErrorId(id);
      } finally {
        setDeletingId(null);
      }
    },
    [activeId, deletingId, items, onNewChat],
  );

  return (
    <aside className="orkhon-history" aria-label={t(COPY.heading)}>
      <header className="orkhon-history__head">
        <h2 className="orkhon-history__heading">{t(COPY.heading)}</h2>
        <button
          type="button"
          className="orkhon-history__new orkhon-btn orkhon-btn--primary"
          onClick={onNewChat}
        >
          <Plus size={14} aria-hidden="true" />
          <span>{t(COPY.newChat)}</span>
        </button>
      </header>

      <div className="orkhon-history__list" role="list">
        {loading && (
          <div className="orkhon-history__status" role="status">
            <Loader2 size={13} className="orkhon-history__spinner" aria-hidden="true" />
            <span>{t(COPY.loading)}</span>
          </div>
        )}

        {!loading && listError && (
          <div className="orkhon-history__status orkhon-history__status--error" role="alert">
            <AlertCircle size={13} aria-hidden="true" />
            <span>{t(COPY.loadError)}</span>
            <button
              type="button"
              className="orkhon-history__retry"
              onClick={() => void fetchList()}
            >
              {t(COPY.loadErrorHint)}
            </button>
          </div>
        )}

        {!loading && !listError && items.length === 0 && (
          <p className="orkhon-history__empty">{t(COPY.empty)}</p>
        )}

        {!loading &&
          !listError &&
          items.map((c) => {
            const isActive = c.id === activeId;
            const isLoadingThis = loadingId === c.id;
            const isDeletingThis = deletingId === c.id;
            const hadError = deleteErrorId === c.id;
            const when = relativeTime(c.updatedAt ?? c.createdAt, lang);
            return (
              <div
                key={c.id}
                role="listitem"
                className={`orkhon-history__row${isActive ? " is-active" : ""}`}
                data-active={isActive ? "true" : "false"}
              >
                <button
                  type="button"
                  className="orkhon-history__open"
                  onClick={() => void openConversation(c.id)}
                  disabled={isLoadingThis || isDeletingThis}
                  aria-label={`${t(COPY.openLabel)}: ${c.title ?? t(COPY.untitled)}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="orkhon-history__icon" aria-hidden="true">
                    {isLoadingThis ? (
                      <Loader2 size={13} className="orkhon-history__spinner" />
                    ) : (
                      <MessageSquare size={13} />
                    )}
                  </span>
                  <span className="orkhon-history__meta">
                    <span className="orkhon-history__title">
                      {c.title?.trim() || t(COPY.untitled)}
                    </span>
                    {(when || c.preview) && (
                      <span className="orkhon-history__sub">
                        {when}
                        {when && c.preview ? " · " : ""}
                        {c.preview}
                      </span>
                    )}
                    {hadError && (
                      <span className="orkhon-history__err">{t(COPY.deleteError)}</span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  className="orkhon-history__del"
                  onClick={() => void removeConversation(c.id)}
                  disabled={isDeletingThis}
                  aria-label={`${t(COPY.deleteLabel)}: ${c.title ?? t(COPY.untitled)}`}
                >
                  {isDeletingThis ? (
                    <Loader2 size={13} className="orkhon-history__spinner" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            );
          })}
      </div>
    </aside>
  );
}
