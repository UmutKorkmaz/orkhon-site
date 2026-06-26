"use client";

// HERO — the thesis. Inscription stone (left) ↔ neural net (right), joined
// by a transformation axis. Built from inline SVG + CSS so there are no
// heavy image assets; everything scales from 320px up.

import { useLang } from "@/lib/i18n";
import { HERO, THESIS, LINKS } from "@/lib/content";
import { MotionSolo } from "./motion";
import { GitHubMark, RuneArrow } from "./icons";

export function Hero() {
  const { t } = useLang();

  return (
    <section className="orkhon-hero" aria-labelledby="hero-title">
      <div className="orkhon-container orkhon-hero__inner">
        <MotionSolo className="orkhon-hero__copy" delay={0.05}>
          <p className="orkhon-kicker orkhon-hero__kicker">{t(HERO.kicker)}</p>
          <h1 id="hero-title" className="orkhon-hero__title">
            {t(HERO.title)}
          </h1>
          <p className="orkhon-hero__subtitle">{t(HERO.subtitle)}</p>

          <div className="orkhon-hero__ctas">
            <a href={LINKS.chat} className="orkhon-btn orkhon-btn--primary">
              {t(HERO.cta.tryChat)}
              <RuneArrow />
            </a>
            <a
              href={LINKS.github}
              className="orkhon-btn orkhon-btn--ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubMark />
              {t(HERO.cta.readSource)}
            </a>
          </div>
        </MotionSolo>

        <MotionSolo className="orkhon-hero__motif" delay={0.18} y={18}>
          <InscriptionNet />
        </MotionSolo>
      </div>

      <div className="orkhon-container">
        <p className="orkhon-hero__thesis">{t(THESIS)}</p>
      </div>

      <style>{`
        .orkhon-hero {
          position: relative;
          padding-block: clamp(3.5rem, 2.5rem + 4vw, 7rem) clamp(2rem, 1.5rem + 2vw, 4rem);
          overflow: hidden;
        }
        .orkhon-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(60% 50% at 18% 0%, rgba(192, 138, 62, 0.10), transparent 70%),
            radial-gradient(55% 45% at 95% 10%, rgba(79, 227, 212, 0.10), transparent 70%);
          pointer-events: none;
        }
        .orkhon-hero__inner {
          position: relative;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(2rem, 1rem + 4vw, 4.5rem);
          align-items: center;
        }
        .orkhon-hero__copy { display: flex; flex-direction: column; gap: 1.4rem; }
        .orkhon-hero__kicker { color: var(--ochre); }
        .orkhon-hero__title {
          font-size: clamp(3.5rem, 2rem + 8vw, 8.5rem);
          font-weight: 600;
          letter-spacing: -0.035em;
          line-height: 0.92;
          color: var(--ink-0);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.04);
        }
        .orkhon-hero__subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.15rem, 1rem + 0.7vw, 1.5rem);
          line-height: 1.45;
          color: var(--ink-1);
          max-width: 38ch;
        }
        .orkhon-hero__ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.6rem;
        }
        .orkhon-hero__thesis {
          position: relative;
          margin-top: clamp(2.5rem, 2rem + 2vw, 4rem);
          max-width: 52rem;
          font-family: var(--font-serif);
          font-size: clamp(1.05rem, 0.98rem + 0.35vw, 1.2rem);
          line-height: 1.7;
          color: var(--ink-2);
          border-left: 1px solid var(--ochre-dim);
          padding-left: clamp(1rem, 0.5rem + 1.5vw, 1.75rem);
        }
        .orkhon-hero__thesis::first-letter {
          font-family: var(--font-serif);
          font-size: 1.15em;
          color: var(--ochre);
          font-style: normal;
        }

        @media (max-width: 900px) {
          .orkhon-hero__inner {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .orkhon-hero__motif { order: -1; max-width: 30rem; }
        }
        @media (max-width: 480px) {
          .orkhon-hero__ctas .orkhon-btn { flex: 1 1 auto; justify-content: center; }
          .orkhon-hero__title { font-size: clamp(3rem, 1rem + 14vw, 5rem); }
        }
      `}</style>
    </section>
  );
}

/**
 * The motif: a runic inscription tablet (left) dissolves along a chisel axis
 * into an attention-style node graph (right). Ochre = the carved stone;
 * cyan = the living network. Pure SVG, decoratively animated via CSS.
 */
// Neural-net geometry for the hero motif, precomputed once at module load so
// the SVG body stays a flat map (no nested arrow-function ambiguity) and the
// edges between the two layers render deterministically.
const ROWS = [0, 1, 2, 3] as const;

const L1_NODES = ROWS.flatMap((row) => [
  { cx: 180, cy: 40 + row * 45, r: 4, fill: "#2a8a82", glow: false },
  { cx: 235, cy: 30 + row * 50, r: 4.5, fill: "#4fe3d4", glow: true },
  { cx: 290, cy: 55 + row * 35, r: 4, fill: "#7ff0e4", glow: true },
]);

const L1_EDGES = ROWS.flatMap((row) =>
  ROWS.map((col) => ({
    id: `a-${row}-${col}`,
    x1: 180,
    y1: 40 + row * 45,
    x2: 235,
    y2: 30 + col * 50,
    stroke: "#2a8a82",
    opacity: 0.35,
  })),
).concat(
  ROWS.flatMap((row) =>
    ROWS.map((col) => ({
      id: `b-${row}-${col}`,
      x1: 235,
      y1: 30 + row * 50,
      x2: 290,
      y2: 55 + col * 35,
      stroke: "#4fe3d4",
      opacity: 0.25,
    })),
  ),
);

function InscriptionNet() {
  // Göktürk-style rune glyphs (Old Turkic script block) for the tablet.
  const runes = ["𐰆", "𐰀", "𐰓", "𐰣", "𐰘", "𐰸", "𐰞", "𐱅"];

  return (
    <figure className="inscript" aria-label="Inscription stone transforming into a neural network">
      <div className="inscript__tablet" role="img" aria-hidden="true">
        {runes.map((r, i) => (
          <span key={i} className="inscript__rune" style={{ animationDelay: `${i * 0.18}s` }}>
            {r}
          </span>
        ))}
      </div>

      <svg
        className="inscript__svg"
        viewBox="0 0 320 220"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="orkhon-axe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c08a3e" stopOpacity="0.0" />
            <stop offset="45%" stopColor="#c08a3e" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#4fe3d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4fe3d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* transformation axis */}
        <line x1="0" y1="110" x2="320" y2="110" stroke="url(#orkhon-axe)" strokeWidth="1" />
        {/* tick marks along the axis */}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 40 + i * 30;
          return (
            <line
              key={i}
              x1={x}
              y1={i % 2 === 0 ? 104 : 116}
              x2={x}
              y2={i % 2 === 0 ? 110 : 110}
              stroke="#3d3522"
              strokeWidth="1"
            />
          );
        })}

        {/* neural net — two layers of nodes joined by edges (right half) */}
        {L1_NODES.map((n) => (
          <circle
            key={`n-${n.cx}-${n.cy}`}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill={n.fill}
            className={n.glow ? "inscript__node" : undefined}
          />
        ))}
        {L1_EDGES.map((e) => (
          <line
            key={`e-${e.id}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={e.stroke}
            strokeWidth="0.5"
            opacity={e.opacity}
          />
        ))}
      </svg>

      <figcaption className="inscript__caption">
        <span className="inscript__cap-stone">𐰦 yazı taşı</span>
        <RuneArrow />
        <span className="inscript__cap-net">sinir ağı</span>
      </figcaption>

      <style>{`
        .inscript {
          margin: 0;
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: clamp(0.5rem, 1vw, 1.25rem);
          padding: clamp(1rem, 0.5rem + 2vw, 2rem);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          background:
            linear-gradient(160deg, rgba(26, 22, 14, 0.85), rgba(13, 16, 8, 0.85));
          box-shadow: var(--shadow-card);
        }
        .inscript__tablet {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.35rem 0.5rem;
          padding: clamp(0.75rem, 0.5rem + 1vw, 1.25rem);
          border: 1px solid var(--ochre-dim);
          border-radius: var(--radius);
          background: linear-gradient(180deg, rgba(192, 138, 62, 0.06), transparent);
        }
        .inscript__rune {
          font-family: var(--font-serif);
          font-size: clamp(1.1rem, 0.9rem + 1vw, 1.6rem);
          color: var(--ochre);
          text-align: center;
          line-height: 1;
          opacity: 0.35;
          text-shadow: 0 0 8px rgba(192, 138, 62, 0.4);
          animation: inscript-glow 6s ease-in-out infinite;
        }
        .inscript__svg {
          width: 100%;
          height: auto;
          min-height: 120px;
        }
        .inscript__node {
          animation: inscript-pulse 3.4s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .inscript__caption {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .inscript__cap-stone { color: var(--ochre); }
        .inscript__caption svg { color: var(--ink-3); font-size: 0.85rem; }
        .inscript__cap-net { color: var(--cyan); }

        @keyframes inscript-glow {
          0%, 100% { opacity: 0.28; }
          50% { opacity: 0.7; }
        }
        @keyframes inscript-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.18); }
        }
        @media (prefers-reduced-motion: reduce) {
          .inscript__rune, .inscript__node { animation: none; opacity: 0.6; }
        }
      `}</style>
    </figure>
  );
}
