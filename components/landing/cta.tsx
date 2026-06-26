"use client";

// CTA — the closing invitation. Lab or read the source. A large serif
// statement with the two primary actions, echoing the hero.

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { LINKS } from "@/lib/content";
import { MotionSolo } from "./motion";
import { GitHubMark, RuneArrow } from "./icons";

export function Cta() {
  const { t } = useLang();

  return (
    <section className="orkhon-section orkhon-cta">
      <div className="orkhon-container">
        <MotionSolo className="orkhon-cta__panel">
          <p className="orkhon-kicker orkhon-cta__kicker">
            {t({
              en: "From inscription to inference",
              tr: "Yazıttan çıkarıma",
            })}
          </p>

          <h2 className="orkhon-cta__title">
            {t({
              en: "Hold the lineage in your hands.",
              tr: "Soyu kendi ellerinde tut.",
            })}
          </h2>

          <p className="orkhon-cta__sub">
            {t({
              en: "Choose a model in the Lab, or read every line of the stack that built it.",
              tr: "Lab'de bir model seç ya da onu inşa eden yığının her satırını oku.",
            })}
          </p>

          <div className="orkhon-cta__actions">
            <Link href={LINKS.chat} className="orkhon-btn orkhon-btn--primary orkhon-cta__btn">
              {t({ en: "Open the lab", tr: "Laboratuvarı aç" })}
              <RuneArrow />
            </Link>
            <a
              href={LINKS.github}
              className="orkhon-btn orkhon-btn--ghost orkhon-cta__btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubMark />
              {t({ en: "Read the source", tr: "Kaynağı oku" })}
            </a>
          </div>

          <div className="orkhon-cta__glyphs" aria-hidden="true">
            <span>𐰆</span>
            <span>𐰀</span>
            <span>𐰓</span>
            <span>𐰣</span>
            <span>𐰘</span>
          </div>
        </MotionSolo>
      </div>

      <style>{`
        .orkhon-cta { position: relative; }
        .orkhon-cta__panel {
          position: relative;
          text-align: center;
          padding: clamp(2.5rem, 2rem + 3vw, 5rem) clamp(1.5rem, 1rem + 2vw, 4rem);
          background:
            radial-gradient(80% 120% at 50% 0%, rgba(79, 227, 212, 0.10), transparent 60%),
            radial-gradient(60% 100% at 50% 100%, rgba(192, 138, 62, 0.08), transparent 60%),
            linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--line-strong);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.1rem;
        }
        .orkhon-cta__kicker { color: var(--ochre); }
        .orkhon-cta__title {
          font-size: clamp(2rem, 1.4rem + 2.6vw, 3.6rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.05;
          max-width: 18ch;
          color: var(--ink-0);
        }
        .orkhon-cta__sub {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.05rem, 0.98rem + 0.4vw, 1.3rem);
          line-height: 1.5;
          color: var(--ink-1);
          max-width: 42ch;
        }
        .orkhon-cta__actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .orkhon-cta__btn { font-size: 0.9rem; padding: 0.85rem 1.5rem; }

        .orkhon-cta__glyphs {
          display: flex;
          gap: clamp(0.6rem, 0.3rem + 1vw, 1.5rem);
          margin-top: clamp(1.5rem, 1rem + 1vw, 2.5rem);
          font-family: var(--font-serif);
          color: var(--ochre-dim);
          font-size: clamp(1.2rem, 1rem + 0.8vw, 1.8rem);
          opacity: 0.7;
        }

        @media (max-width: 480px) {
          .orkhon-cta__btn { flex: 1 1 auto; justify-content: center; }
        }
      `}</style>
    </section>
  );
}
