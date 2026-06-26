"use client";

// Session / tier status strip for the Orkhon chat surface.
//
// next-auth v5's useSession() returns { status: "loading" | "authenticated" | "unauthenticated" }.
// During SSR and the first client render, status is "loading" — we render a
// neutral placeholder so the strip never flashes the wrong state. The route
// is a client component, so by the time the user interacts, status has
// resolved. We still guard every branch.
//
// We do NOT implement auth here (another agent owns /api/auth). This
// component only *reads* the session that next-auth's provider exposes.

import { useSession, signIn, signOut } from "next-auth/react";
import { useLang } from "@/lib/i18n";

const COPY = {
  loading: { en: "Checking session…", tr: "Oturum denetleniyor…" },
  anon: {
    badge: { en: "Free tier", tr: "Ücretsiz katman" },
    hint: {
      en: "Anonymous — limited runs. Sign in for unlimited Lab use.",
      tr: "Anonim — sınırlı deneme. Sınırsız Lab kullanımı için oturum açın.",
    },
    signIn: { en: "Sign in with Google", tr: "Google ile oturum aç" },
  },
  authed: {
    badge: { en: "Unlimited", tr: "Sınırsız" },
    hint: {
      en: "Signed in — unlimited Lab use enabled.",
      tr: "Oturum açık — sınırsız Lab kullanımı etkin.",
    },
    signOut: { en: "Sign out", tr: "Oturumu kapat" },
  },
} as const;

export function SessionStatus() {
  const { status, data } = useSession();
  const { t } = useLang();

  if (status === "loading") {
    return (
      <div className="orkhon-session orkhon-session--loading" role="status">
        <span className="orkhon-session__dot orkhon-session__dot--loading" />
        <span className="orkhon-session__hint">{t(COPY.loading)}</span>
      </div>
    );
  }

  if (status === "authenticated") {
    const name = data?.user?.name ?? data?.user?.email ?? null;
    return (
      <div className="orkhon-session orkhon-session--authed" role="status">
        <span className="orkhon-session__badge orkhon-session__badge--authed">
          {t(COPY.authed.badge)}
        </span>
        <span className="orkhon-session__hint">
          {name
            ? `${name} · ${t(COPY.authed.hint)}`
            : t(COPY.authed.hint)}
        </span>
        <button
          type="button"
          className="orkhon-session__btn"
          onClick={() => signOut()}
        >
          {t(COPY.authed.signOut)}
        </button>
      </div>
    );
  }

  // unauthenticated (or undefined in an unexpected state) → free tier.
  return (
    <div className="orkhon-session orkhon-session--anon" role="status">
      <span className="orkhon-session__badge orkhon-session__badge--anon">
        {t(COPY.anon.badge)}
      </span>
      <span className="orkhon-session__hint">{t(COPY.anon.hint)}</span>
      <button
        type="button"
        className="orkhon-session__btn orkhon-session__btn--google"
        onClick={() => signIn("google")}
      >
        {t(COPY.anon.signIn)}
      </button>
    </div>
  );
}
