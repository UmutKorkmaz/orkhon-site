"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { NAV, LINKS } from "@/lib/content";

export function SiteNav() {
  const { t } = useLang();

  return (
    <header className="orkhon-site-header">
      <div className="orkhon-container orkhon-site-header__inner">
        <Link href="/" className="orkhon-brand" aria-label="Orkhon — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="orkhon-brand__logo" />
          <span className="orkhon-brand__name">Orkhon</span>
        </Link>

        <nav className="orkhon-site-nav__links" aria-label="Site">
          <Link href="/" className="orkhon-site-nav__link">
            {t(NAV.home)}
          </Link>
          <Link href={LINKS.models} className="orkhon-site-nav__link">
            {t(NAV.models)}
          </Link>
          <a href={LINKS.chat} className="orkhon-site-nav__link">
            {t(NAV.chat)}
          </a>
          <a
            href={LINKS.github}
            className="orkhon-site-nav__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(NAV.github)}
          </a>
        </nav>
      </div>

      <style>{`
        .orkhon-site-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(12, 10, 8, 0.72);
          backdrop-filter: blur(12px) saturate(140%);
          -webkit-backdrop-filter: blur(12px) saturate(140%);
          border-bottom: 1px solid var(--line);
        }
        .orkhon-site-header__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          height: 4rem;
        }
        .orkhon-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          color: var(--ink-0);
          font-family: var(--font-serif);
        }
        .orkhon-brand:hover { color: var(--ink-0); }
        .orkhon-brand__logo {
          height: 2rem;
          width: auto;
          display: block;
          border-radius: 0.35rem;
        }
        .orkhon-brand__name {
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .orkhon-site-nav__links {
          display: flex;
          align-items: center;
          gap: clamp(1rem, 0.5rem + 1.5vw, 2rem);
        }
        .orkhon-site-nav__link {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--ink-1);
          transition: color var(--duration-fast) ease;
        }
        .orkhon-site-nav__link:hover { color: var(--cyan); }
        @media (max-width: 640px) {
          .orkhon-site-nav__links { gap: 0.9rem; }
          .orkhon-site-nav__link { font-size: 0.74rem; }
        }
      `}</style>
    </header>
  );
}
