"use client";

// MODEL ZOO — the centerpiece. A grid of cards for all 7 MODELS. Each card
// carries: codename, kind badge (with KIND_LABEL), params, metric, the
// lineage story, and a "good for" line. The kind badge color encodes the
// three lineages (base / instruct / imported).

import { MODELS, KIND_LABEL, type ModelKind } from "@/lib/models";
import { useLang } from "@/lib/i18n";
import { SECTIONS } from "@/lib/content";
import { MotionReveal, MotionItem, SectionHeading } from "./motion";

const KIND_BADGE_CLASS: Record<ModelKind, string> = {
  base: "orkhon-badge orkhon-badge--base",
  instruct: "orkhon-badge orkhon-badge--instruct",
  imported: "orkhon-badge orkhon-badge--imported",
};

const KIND_GLYPH: Record<ModelKind, string> = {
  base: "▲",
  instruct: "◆",
  imported: "⊕",
};

export function ModelZoo() {
  const { t } = useLang();
  const s = SECTIONS.modelZoo;

  return (
    <section id={s.id} className="orkhon-section orkhon-zoo">
      <div className="orkhon-container">
        <SectionHeading index="03" heading={s.heading} intro={s.intro} />

        <MotionReveal className="orkhon-zoo__legend">
          {(["base", "instruct", "imported"] as ModelKind[]).map((k) => (
            <MotionItem as="span" key={k} className={KIND_BADGE_CLASS[k]}>
              <span aria-hidden="true">{KIND_GLYPH[k]}</span>
              {KIND_LABEL[k]}
            </MotionItem>
          ))}
        </MotionReveal>

        <MotionReveal className="orkhon-zoo__grid">
          {MODELS.map((m) => (
            <MotionItem as="article" key={m.id} className="orkhon-zoo__card" data-kind={m.kind}>
              <header className="orkhon-zoo__head">
                <span className={KIND_BADGE_CLASS[m.kind]}>
                  <span aria-hidden="true">{KIND_GLYPH[m.kind]}</span>
                  {KIND_LABEL[m.kind]}
                </span>
                <span className="orkhon-zoo__date">{m.date}</span>
              </header>

              <h3 className="orkhon-zoo__codename">
                {m.codename}
                <code className="orkhon-zoo__id">{m.id}</code>
              </h3>

              <p className="orkhon-zoo__tagline">{t(m.tagline)}</p>

              <dl className="orkhon-zoo__stats">
                <div className="orkhon-zoo__stat">
                  <dt>{t({ en: "Params", tr: "Parametre" })}</dt>
                  <dd>{m.params}</dd>
                </div>
                <div className="orkhon-zoo__stat">
                  <dt>{t({ en: "Metric", tr: "Ölçüt" })}</dt>
                  <dd>{m.metric || "—"}</dd>
                </div>
              </dl>

              <p className="orkhon-zoo__lineage">{t(m.lineage)}</p>

              <footer className="orkhon-zoo__good">
                <span className="orkhon-zoo__good-label">
                  {t({ en: "Good for", tr: "İşi" })}
                </span>
                <span className="orkhon-zoo__good-text">{t(m.goodFor)}</span>
              </footer>
            </MotionItem>
          ))}
        </MotionReveal>
      </div>

      <style>{`
        .orkhon-zoo { position: relative; }
        .orkhon-zoo__legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: clamp(1.5rem, 1rem + 1vw, 2.5rem);
        }

        .orkhon-zoo__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
          gap: clamp(1rem, 0.6rem + 1.2vw, 1.5rem);
        }

        .orkhon-zoo__card {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding: clamp(1.25rem, 1rem + 1vw, 1.6rem);
          background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          position: relative;
          overflow: hidden;
          transition: border-color var(--duration-normal) var(--ease-out-expo),
                      transform var(--duration-normal) var(--ease-out-expo),
                      box-shadow var(--duration-normal) var(--ease-out-expo);
        }
        .orkhon-zoo__card::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 2px;
          background: var(--line);
          transition: background var(--duration-normal) var(--ease-out-expo);
        }
        .orkhon-zoo__card[data-kind="base"]::before { background: var(--ochre-dim); }
        .orkhon-zoo__card[data-kind="instruct"]::before { background: var(--cyan-dim); }
        .orkhon-zoo__card[data-kind="imported"]::before { background: var(--line-strong); }

        .orkhon-zoo__card:hover {
          border-color: var(--line-strong);
          transform: translateY(-3px);
          box-shadow: 0 1px 0 rgba(255, 240, 200, 0.04) inset, 0 32px 56px -32px rgba(0, 0, 0, 0.95);
        }
        .orkhon-zoo__card[data-kind="instruct"]:hover {
          box-shadow: var(--shadow-glow), 0 32px 56px -32px rgba(0, 0, 0, 0.9);
        }

        .orkhon-zoo__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .orkhon-zoo__date {
          font-family: var(--font-mono);
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          color: var(--ink-3);
        }

        .orkhon-zoo__codename {
          font-size: clamp(1.5rem, 1.2rem + 0.8vw, 1.9rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.6rem;
        }
        .orkhon-zoo__id {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 400;
          color: var(--ink-3);
          letter-spacing: 0.04em;
        }

        .orkhon-zoo__tagline {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 1.02rem;
          line-height: 1.4;
          color: var(--ink-1);
        }

        .orkhon-zoo__stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin: 0;
          padding: 0.6rem 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }
        .orkhon-zoo__stat { display: flex; flex-direction: column; gap: 0.15rem; }
        .orkhon-zoo__stat dt {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-3);
        }
        .orkhon-zoo__stat dd {
          margin: 0;
          font-family: var(--font-mono);
          font-size: 0.95rem;
          color: var(--cyan);
          font-weight: 500;
        }

        .orkhon-zoo__lineage {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--ink-2);
          flex: 1;
        }

        .orkhon-zoo__good {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding-top: 0.85rem;
          margin-top: auto;
          border-top: 1px dashed var(--line);
        }
        .orkhon-zoo__good-label {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ochre);
        }
        .orkhon-zoo__good-text {
          font-family: var(--font-sans);
          font-size: 0.86rem;
          line-height: 1.5;
          color: var(--ink-1);
        }
      `}</style>
    </section>
  );
}
