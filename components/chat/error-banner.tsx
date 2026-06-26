"use client";

// Error banner for the Orkhon chat surface.
//
// We distinguish two failure shapes:
//   1. "Backend not connected" — the model backend (Gradio / vLLM / etc.) is
//      cold, down, or still warming up. This is the common, on-brand case:
//      the site is live but the live weights aren't serving yet. We explain
//      what is happening and how it resolves, instead of showing a stack
//      trace.
//   2. Generic errors — rate limits, malformed responses, network drops.
//      Surfaced with a concise message; the raw detail is available via the
//      "details" toggle for the curious.
//
// Detection of "backend not connected" is intentionally lenient: a network
// failure, a 5xx, a 502/503, or a body that literally says the backend is
// unavailable all map to the warming-up message.

import { useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

export type ChatErrorKind = "backend" | "generic";

export interface ChatError {
  kind: ChatErrorKind;
  message: string;
}

interface ErrorBannerProps {
  error: ChatError;
  onDismiss: () => void;
}

const BACKEND_COPY: { en: { title: string; body: string; how: string }; tr: { title: string; body: string; how: string } } = {
  en: {
    title: "The live model backend is warming up",
    body: "Orkhon's serving weights aren't connected right now. The site is live, but the inference backend is cold, restarting, or still loading a checkpoint into memory.",
    how: "How it works: your request is forwarded to the live Turkic model backend. Once it finishes loading and accepts connections, chat resumes — usually within a minute or two. Nothing on your end needs to change; just try again shortly.",
  },
  tr: {
    title: "Canlı model sunucusu ısınıyor",
    body: "Orkhon'un sunum ağırlıkları şu anda bağlı değil. Site yayında, ancak çıkarım sunucusu soğuk, yeniden başlıyor veya bir kontrol noktasını belleğe henüz yüklüyor.",
    how: "Nasıl çalışır: isteğiniz canlı Türkçe model sunucusuna iletilir. Sunucu yüklenmeyi bitirip bağlantıları kabul ettiğinde sohbet devam eder — genellikle bir-iki dakika içinde. Sizin tarafınızda bir şey değiştirmeniz gerekmez; kısa bir süre sonra tekrar deneyin.",
  },
};

const GENERIC_COPY: { en: { title: string }; tr: { title: string } } = {
  en: { title: "Something went wrong" },
  tr: { title: "Bir şeyler ters gitti" },
};

const DISMISS: { en: string; tr: string } = {
  en: "Dismiss",
  tr: "Kapat",
};

const DETAILS: { en: string; tr: string } = {
  en: "Details",
  tr: "Ayrıntılar",
};

const RETRY_HINT: { en: string; tr: string } = {
  en: "Try again in a moment.",
  tr: "Biraz sonra tekrar deneyin.",
};

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  const { t } = useLang();
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (error.kind === "backend") {
    const copy = t(BACKEND_COPY);
    return (
      <BannerShell
        icon={<AlertTriangle size={16} aria-hidden="true" />}
        tone="backend"
        onDismiss={onDismiss}
      >
        <strong className="orkhon-err__title">{copy.title}</strong>
        <p className="orkhon-err__body">{copy.body}</p>
        <p className="orkhon-err__how">{copy.how}</p>
        <DetailsToggle
          open={detailsOpen}
          onToggle={() => setDetailsOpen((o) => !o)}
          detail={error.message}
        />
      </BannerShell>
    );
  }

  const copy = t(GENERIC_COPY);
  return (
    <BannerShell
      icon={<AlertTriangle size={16} aria-hidden="true" />}
      tone="generic"
      onDismiss={onDismiss}
    >
      <strong className="orkhon-err__title">{copy.title}</strong>
      <p className="orkhon-err__body">{error.message || t(RETRY_HINT)}</p>
      <DetailsToggle
        open={detailsOpen}
        onToggle={() => setDetailsOpen((o) => !o)}
        detail={error.message}
      />
    </BannerShell>
  );
}

function BannerShell({
  icon,
  tone,
  onDismiss,
  children,
}: {
  icon: ReactNode;
  tone: "backend" | "generic";
  onDismiss: () => void;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <div
      className={`orkhon-err orkhon-err--${tone}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="orkhon-err__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="orkhon-err__content">{children}</div>
      <button
        type="button"
        className="orkhon-err__dismiss"
        onClick={onDismiss}
        aria-label={t(DISMISS)}
      >
        ×
      </button>
    </div>
  );
}

function DetailsToggle({
  open,
  onToggle,
  detail,
}: {
  open: boolean;
  onToggle: () => void;
  detail: string;
}) {
  const { t } = useLang();
  if (!detail) return null;
  return (
    <div className="orkhon-err__details-wrap">
      <button
        type="button"
        className="orkhon-err__details-toggle"
        onClick={onToggle}
        aria-expanded={open}
      >
        <ChevronDown
          size={13}
          aria-hidden="true"
          data-open={open ? "true" : "false"}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform var(--duration-fast) ease",
          }}
        />
        {t(DETAILS)}
      </button>
      {open && (
        <pre className="orkhon-err__details">
          <code>{detail}</code>
        </pre>
      )}
    </div>
  );
}
