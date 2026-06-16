"use client";

// PIPELINE — the ten-stage inscription. Each stage is a chisel station;
// tokens enter as raw bytes and leave as a served model. Horizontal on
// wide screens, vertical-stepped on narrow ones.

import { useLang } from "@/lib/i18n";
import { SECTIONS, PIPELINE_STAGES } from "@/lib/content";
import { MotionReveal, MotionItem, SectionHeading } from "./motion";

// Short glyph for each stage — kept inline so no icon-font dependency.
const STAGE_GLYPH: Record<string, string> = {
  tokenizer: "🯊",
  data_prep: "🯋",
  pretrain: "▲",
  sft: "◆",
  dpo: "◇",
  grpo_rlvr: "✦",
  eval: "⊙",
  tools_rag_agent: "⊞",
  serve: "⌁",
  export: "⤓",
};

export function Pipeline() {
  const { lang, t } = useLang();
  const s = SECTIONS.pipeline;
  const stages = PIPELINE_STAGES[lang];

  return (
    <section id={s.id} className="orkhon-section orkhon-pipe">
      <div className="orkhon-container">
        <SectionHeading index="02" heading={s.heading} intro={s.intro} />

        <MotionReveal as="ol" className="orkhon-pipe__flow">
          {stages.map((stage, i) => {
            const isLast = i === stages.length - 1;
            return (
              <MotionItem as="li" key={stage.key} className="orkhon-pipe__stage">
                <div className="orkhon-pipe__node" aria-hidden="true">
                  <span className="orkhon-pipe__glyph">{STAGE_GLYPH[stage.key] ?? "·"}</span>
                  <span className="orkhon-pipe__index">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="orkhon-pipe__label">
                  <span className="orkhon-pipe__name">{stage.label[lang]}</span>
                  <code className="orkhon-pipe__key">{stage.key}</code>
                </div>
                {!isLast && (
                  <span className="orkhon-pipe__conn" aria-hidden="true">
                    <span className="orkhon-pipe__conn-line" />
                  </span>
                )}
              </MotionItem>
            );
          })}
        </MotionReveal>

        <div className="orkhon-pipe__legend">
          <span className="orkhon-pipe__legend-end">
            <strong>{t({ en: "raw bytes in", tr: "ham bayt girdi" })}</strong>
          </span>
          <span className="orkhon-pipe__legend-arrow" aria-hidden="true">→</span>
          <span className="orkhon-pipe__legend-mid">
            {t({
              en: "one continuous act of inscription",
              tr: "tek bir yazı eylemi",
            })}
          </span>
          <span className="orkhon-pipe__legend-arrow" aria-hidden="true">→</span>
          <span className="orkhon-pipe__legend-end">
            <strong>{t({ en: "served model out", tr: "sunulan model çıktı" })}</strong>
          </span>
        </div>
      </div>

      <style>{`
        .orkhon-pipe { position: relative; }
        .orkhon-pipe__flow {
          list-style: none;
          margin: 0 0 clamp(2rem, 1.5rem + 1.5vw, 3rem);
          padding: clamp(1.5rem, 1rem + 2vw, 2.5rem);
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: clamp(1rem, 0.5rem + 1.5vw, 1.75rem) clamp(1rem, 0.5rem + 1vw, 1.5rem);
          background: linear-gradient(180deg, var(--bg-1), var(--bg-0));
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
        }
        .orkhon-pipe__stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.65rem;
        }
        .orkhon-pipe__node {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(2.6rem, 2rem + 1.5vw, 3.2rem);
          height: clamp(2.6rem, 2rem + 1.5vw, 3.2rem);
          border: 1px solid var(--line-strong);
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, var(--bg-3), var(--bg-inset));
          color: var(--ochre);
          transition: border-color var(--duration-normal) var(--ease-out-expo),
                      box-shadow var(--duration-normal) var(--ease-out-expo),
                      transform var(--duration-normal) var(--ease-out-expo);
        }
        .orkhon-pipe__stage:hover .orkhon-pipe__node {
          border-color: var(--cyan-dim);
          box-shadow: var(--shadow-glow);
          transform: translateY(-2px);
          color: var(--cyan);
        }
        .orkhon-pipe__glyph {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          line-height: 1;
        }
        .orkhon-pipe__index {
          position: absolute;
          bottom: -0.5rem;
          right: -0.5rem;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: var(--ink-3);
          background: var(--bg-0);
          padding: 0.05rem 0.3rem;
          border: 1px solid var(--line);
          border-radius: 999px;
          letter-spacing: 0.06em;
        }
        .orkhon-pipe__label { display: flex; flex-direction: column; gap: 0.25rem; }
        .orkhon-pipe__name {
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--ink-0);
          line-height: 1.2;
        }
        .orkhon-pipe__key {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--ink-3);
          letter-spacing: 0.02em;
        }
        .orkhon-pipe__conn {
          position: absolute;
          top: clamp(1.3rem, 1rem + 0.75vw, 1.6rem);
          left: 100%;
          width: clamp(1rem, 0.5rem + 1vw, 1.5rem);
          height: 1px;
          display: none; /* shown only on wide single-row layouts via media query */
        }
        .orkhon-pipe__conn-line {
          display: block;
          height: 1px;
          background: linear-gradient(90deg, var(--line-strong), transparent);
        }

        .orkhon-pipe__legend {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.6rem 0.9rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: var(--ink-2);
        }
        .orkhon-pipe__legend-end strong { color: var(--cyan); font-weight: 500; }
        .orkhon-pipe__legend-arrow { color: var(--ochre-dim); }
        .orkhon-pipe__legend-mid { color: var(--ink-3); font-style: italic; font-family: var(--font-serif); }

        /* Tablet: 5 -> 3 columns, hide row connectors. */
        @media (max-width: 820px) {
          .orkhon-pipe__flow { grid-template-columns: repeat(3, 1fr); }
        }
        /* Phone: single column, vertical step rail. */
        @media (max-width: 520px) {
          .orkhon-pipe__flow { grid-template-columns: 1fr; gap: 1.25rem; }
          .orkhon-pipe__stage { flex-direction: row; align-items: center; }
          .orkhon-pipe__label { gap: 0.15rem; }
        }
      `}</style>
    </section>
  );
}
