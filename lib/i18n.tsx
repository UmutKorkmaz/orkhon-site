"use client";

// Tiny client i18n for the Orkhon site. No library, no server. Just a
// React context that holds 'en' | 'tr', persists the choice to
// localStorage, defaults from navigator.language, and offers a `t()`
// helper that picks obj[lang].

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "tr";

export interface Bilingual {
  en: string;
  tr: string;
}

const STORAGE_KEY = "orkhon-lang";
const SUPPORTED: Lang[] = ["en", "tr"];

function detectInitialLang(): Lang {
  // SSR safety: window is undefined on the server.
  if (typeof window === "undefined") return "en";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "tr") return stored;
  } catch {
    // localStorage may be blocked (private mode) — fall through to navigator.
  }

  const nav = window.navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("tr")) return "tr";
  return "en";
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Pick the active variant from any {en, tr} object. */
  t: <T,>(obj: { en: T; tr: T }) => T;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Render the server markup in English; sync to the real choice after mount.
  // This avoids hydration mismatches while still persisting + respecting
  // navigator.language on the client.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const detected = detectInitialLang();
    setLangState(detected);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Best-effort persistence.
      }
    }
  }, []);

  const t = useCallback(
    <T,>(obj: { en: T; tr: T }) => obj[lang],
    [lang],
  );

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t }),
    [lang, setLang, t],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within a <LanguageProvider>");
  }
  return ctx;
}

/** Inline language toggle (EN / TR). Client component. */
export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={className}
      role="group"
      aria-label="Language"
      data-orkhon-lang-toggle=""
    >
      {SUPPORTED.map((code, i) => (
        <span key={code}>
          <button
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            data-active={lang === code ? "true" : "false"}
            className="orkhon-lang-btn"
          >
            {code === "en" ? "EN" : "TR"}
          </button>
          {i < SUPPORTED.length - 1 && (
            <span className="orkhon-lang-sep" aria-hidden="true">
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
