"use client";

// ConsentGate — KVKK/GDPR acceptance panel shown above the composer for a
// signed-in user who has NOT yet accepted the data-processing policy.
//
// Contract with /api/consent (owned by another agent):
//   GET  /api/consent
//     200 → { accepted: boolean, version: string, policy: BilingualPolicy }
//       `policy` is the human-readable KVKK/GDPR text. The shape is tolerant:
//       it may arrive as { en: string, tr: string }, as a single string
//       (applied to both locales), or omitted (we fall back to bundled copy).
//   POST /api/consent { version: string }
//     200 → { accepted: true, version: string }
//     4xx/5xx → { error: string, message: string }
//
// The gate is purely additive: if any fetch fails, we never block the user —
// chat still works, only persistence is skipped. The decline note makes that
// explicit. We render nothing while loading (no flash) and nothing once
// accepted (saving begins).

import { useCallback, useEffect, useId, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useLang, type Bilingual } from "@/lib/i18n";

/* ---------- shapes ---------- */

type MaybeLang = Partial<Bilingual> | string | null | undefined;

interface ConsentState {
  accepted: boolean;
  version?: string;
  policy?: MaybeLang;
}

interface ConsentGateProps {
  /** Called once the user accepts; the parent flips to "saving enabled". */
  onAccepted: (version: string) => void;
}

/* ---------- copy ---------- */

const COPY = {
  title: {
    en: "Save your Lab runs — with your consent",
    tr: "Lab denemelerini kaydet — senin izninle",
  },
  intro: {
    en: "KVKK & GDPR require your consent before we store any run. Accept to keep Lab history under your account so you can return to it.",
    tr: "KVKK ve GDPR, herhangi bir denemeyi saklamadan önce iznini gerektirir. Kabul edersen Lab geçmişin hesabın altında kaydedilir ve sonra dönüp bakabilirsin.",
  },
  policyLabel: {
    en: "What we store",
    tr: "Ne saklıyoruz",
  },
  decline: {
    en: "Without accepting, the Lab still works but runs aren't saved.",
    tr: "Kabul etmezsen Lab yine çalışır ama denemeler kaydedilmez.",
  },
  accept: {
    en: "Accept & save my runs",
    tr: "Kabul et ve denemelerimi kaydet",
  },
  accepting: {
    en: "Saving preference…",
    tr: "Tercih kaydediliyor…",
  },
  fetchError: {
    en: "Couldn't load the policy right now. The Lab still works — saving will retry later.",
    tr: "Politika şu an yüklenemedi. Lab yine çalışır — kaydetme daha sonra yeniden denenecek.",
  },
  acceptError: {
    en: "Couldn't save your choice. Please try again.",
    tr: "Seçimin kaydedilemedi. Lütfen tekrar dene.",
  },
  retry: {
    en: "Retry",
    tr: "Tekrar dene",
  },
} as const;

/** Bundled fallback policy in case the backend omits it. Keep it short. */
const FALLBACK_POLICY: Bilingual = {
  en: "Only the prompts you send and the model's replies, linked to your account so you can reopen Lab runs later. We don't share this with third parties. You can delete any saved run at any time — your right to erasure is honored immediately.",
  tr: "Yalnızca gönderdiğin promptlar ve modelin yanıtları, Lab denemelerine sonra dönebilmen için hesabınla ilişkilendirilir. Bunu üçüncü taraflarla paylaşmayız. İstediğin kayıtlı denemeyi istediğin an silebilirsin — silme hakkın anında uygulanır.",
};

/** Normalize a tolerant policy shape into a {en, tr} pair. */
function normalizePolicy(raw: MaybeLang, lang: "en" | "tr"): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw && typeof raw === "object") {
    const en = typeof raw.en === "string" ? raw.en.trim() : "";
    const tr = typeof raw.tr === "string" ? raw.tr : "";
    const picked = lang === "tr" ? tr || en : en || tr;
    if (picked) return picked;
  }
  return FALLBACK_POLICY[lang];
}

export function ConsentGate({ onAccepted }: ConsentGateProps) {
  const { t, lang } = useLang();
  const [state, setState] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const panelId = useId();

  const fetchConsent = useCallback(async () => {
    setLoading(true);
    setFetchFailed(false);
    try {
      const res = await fetch("/api/consent", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Partial<ConsentState>;
      const next: ConsentState = {
        accepted: data.accepted === true,
        version: typeof data.version === "string" ? data.version : "v1",
        policy: data.policy ?? null,
      };
      setState(next);
      // If the user already accepted on another device/session, propagate.
      if (next.accepted && next.version) {
        onAccepted(next.version);
      }
    } catch {
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  }, [onAccepted]);

  useEffect(() => {
    void fetchConsent();
  }, [fetchConsent]);

  const accept = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      const version = state?.version ?? "v1";
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onAccepted(version);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }, [onAccepted, state?.version, submitting]);

  // While loading, render a minimal placeholder so the composer slot doesn't
  // shift. No flash of the policy text.
  if (loading) {
    return (
      <div className="orkhon-consent orkhon-consent--loading" role="status">
        <Loader2 size={14} className="orkhon-consent__spinner" aria-hidden="true" />
        <span className="orkhon-consent__hint">{t({ en: "Checking consent…", tr: "İzin denetleniyor…" })}</span>
      </div>
    );
  }

  // Already accepted (server-side state) → nothing to gate.
  if (state?.accepted) return null;

  return (
    <div className="orkhon-consent" id={panelId} role="region" aria-label={t(COPY.title)}>
      <div className="orkhon-consent__head">
        <span className="orkhon-consent__icon" aria-hidden="true">
          <ShieldCheck size={16} />
        </span>
        <h2 className="orkhon-consent__title">{t(COPY.title)}</h2>
      </div>

      <p className="orkhon-consent__intro">{t(COPY.intro)}</p>

      <div className="orkhon-consent__policy">
        <span className="orkhon-consent__policy-label">{t(COPY.policyLabel)}</span>
        <p className="orkhon-consent__policy-body">
          {normalizePolicy(state?.policy, lang)}
        </p>
      </div>

      {fetchFailed && (
        <p className="orkhon-consent__note orkhon-consent__note--error" role="alert">
          {t(COPY.fetchError)}{" "}
          <button
            type="button"
            className="orkhon-consent__retry"
            onClick={() => void fetchConsent()}
          >
            {t(COPY.retry)}
          </button>
        </p>
      )}

      {submitError && (
        <p className="orkhon-consent__note orkhon-consent__note--error" role="alert">
          {t(COPY.acceptError)}{" "}
          <button
            type="button"
            className="orkhon-consent__retry"
            onClick={() => void accept()}
            disabled={submitting}
          >
            {t(COPY.retry)}
          </button>
        </p>
      )}

      <div className="orkhon-consent__actions">
        <button
          type="button"
          className="orkhon-consent__accept orkhon-btn orkhon-btn--primary"
          onClick={() => void accept()}
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 size={15} className="orkhon-consent__spinner" aria-hidden="true" />
          ) : (
            <ShieldCheck size={15} aria-hidden="true" />
          )}
          <span>{submitting ? t(COPY.accepting) : t(COPY.accept)}</span>
        </button>
        <span className="orkhon-consent__decline">{t(COPY.decline)}</span>
      </div>
    </div>
  );
}
