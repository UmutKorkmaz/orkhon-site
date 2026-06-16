"use client";

import Link from "next/link";
import { useLang, LangToggle } from "@/lib/i18n";
import { FOOTER, LINKS } from "@/lib/content";

export function SiteFooter() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="orkhon-site-footer">
      <div className="orkhon-container orkhon-site-footer__inner">
        <div className="orkhon-site-footer__brand">
          <div className="orkhon-site-footer__name">
            <span aria-hidden="true">𐰆</span> Orkhon
          </div>
          <p className="orkhon-site-footer__tagline">{t(FOOTER.tagline)}</p>
          <p className="orkhon-site-footer__meta">
            © {year} · {t(FOOTER.builtBy)}
          </p>
        </div>

        <div className="orkhon-site-footer__side">
          <nav className="orkhon-site-footer__links" aria-label="Footer">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(FOOTER.links.github)}
            </a>
            <a
              href={LINKS.huggingface}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(FOOTER.links.huggingface)}
            </a>
            <Link href={LINKS.chat}>{t(FOOTER.links.chat)}</Link>
          </nav>
          <LangToggle className="orkhon-site-footer__lang" />
        </div>
      </div>

      <style>{`
        .orkhon-site-footer {
          border-top: 1px solid var(--line);
          background: linear-gradient(180deg, var(--bg-0), var(--bg-1));
          padding-block: clamp(3rem, 2.5rem + 2vw, 5rem);
          margin-top: var(--space-section);
        }
        .orkhon-site-footer__inner {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 2rem;
        }
        .orkhon-site-footer__name {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--ink-0);
          letter-spacing: 0.02em;
        }
        .orkhon-site-footer__name span {
          color: var(--ochre);
          margin-right: 0.2rem;
        }
        .orkhon-site-footer__tagline {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--ink-1);
          font-size: 1.05rem;
          max-width: 34ch;
          margin-top: 0.75rem;
          line-height: 1.4;
        }
        .orkhon-site-footer__meta {
          margin-top: 1rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: var(--ink-3);
        }
        .orkhon-site-footer__side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
        }
        .orkhon-site-footer__links {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          justify-content: flex-end;
        }
        .orkhon-site-footer__links a {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: var(--ink-1);
        }
        .orkhon-site-footer__links a:hover { color: var(--cyan); }
        @media (max-width: 640px) {
          .orkhon-site-footer__inner { flex-direction: column; }
          .orkhon-site-footer__side { align-items: flex-start; }
          .orkhon-site-footer__links { justify-content: flex-start; }
        }
      `}</style>
    </footer>
  );
}
