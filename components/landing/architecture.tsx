"use client";

// ARCHITECTURE — five hand-written blocks of the transformer, each as a
// short explainer card. Bento-ish grid with one feature tile.

import { useLang, type Bilingual } from "@/lib/i18n";
import { SECTIONS } from "@/lib/content";
import { MotionReveal, MotionItem, SectionHeading } from "./motion";

interface Block {
  glyph: string;
  name: string;
  full: Bilingual;
  blurb: Bilingual;
}

const BLOCKS: Block[] = [
  {
    glyph: "GQA",
    name: "Grouped-Query Attention",
    full: {
      en: "Queries share key/value heads",
      tr: "Sorgularca paylaşılan anahtar/değer başları",
    },
    blurb: {
      en: "Multiple query heads attend over a smaller set of shared key/value heads — most of the attention quality at a fraction of the KV memory. The reason the cache fits on a laptop.",
      tr: "Birden çok sorgu başı, daha küçük bir ortak anahtar/değer başı kümesi üzerinde dikkat uygular — dikkat kalitesinin çoğunu, KV belleğinin küçük bir kısmıyla. Önbelleğin bir dizüstüne sığmasının nedeni.",
    },
  },
  {
    glyph: "RoPE",
    name: "Rotary Positional Embeddings",
    full: {
      en: "Positions encoded as rotations",
      tr: "Konumlar dönüş olarak kodlanır",
    },
    blurb: {
      en: "Position is injected by rotating query/key pairs in complex space — no learned position table, and relative distances generalize cleanly to longer contexts than training saw.",
      tr: "Konum, sorgu/anahtar çiftlerini karmaşık uzayda döndürerek enjekte edilir — öğrenilmiş konum tablosu yoktur ve göreli uzaklıklar eğitimin gördüğünden daha uzun bağlamlara temiz genellenir.",
    },
  },
  {
    glyph: "RMSNorm",
    name: "Root-Mean-Square Normalization",
    full: {
      en: "Scale-only, mean-subtracted-free norm",
      tr: "Yalnızca ölçekli, ortalama çıkarmasız norm",
    },
    blurb: {
      en: "LayerNorm without the mean subtraction — cheaper, faster, and empirically as stable. Pre-norm placement keeps the residual highway clean through deep stacks.",
      tr: "Ortalama çıkarması olmayan LayerNorm — daha ucuz, daha hızlı ve deneysel olarak en az onun kadar kararlı. Ön-norm yerleşimi, artık otoyolunu derin yığınlarda temiz tutar.",
    },
  },
  {
    glyph: "SwiGLU",
    name: "SwiGLU MLP",
    full: {
      en: "Gated, Swish-activated feed-forward",
      tr: "Kapılı, Swish etkinleştirmeli ileri-besleme",
    },
    blurb: {
      en: "The feed-forward block gates its up-projection with a Swish-activated path — a gated linear unit that outperforms plain ReLU/GELU MLPs at the same parameter budget.",
      tr: "İleri-besleme bloğu, yukarı projeksiyonunu Swish etkinleştirmeli bir yolla kapılar — aynı parametre bütçesinde düz ReLU/GELU MLP'lerini geride bırakan kapılı bir doğrusal birim.",
    },
  },
  {
    glyph: "KV",
    name: "KV-Cache",
    full: {
      en: "Past keys/values kept for incremental decode",
      tr: "Artımlı çözümleme için eski anahtar/değer saklanır",
    },
    blurb: {
      en: "At serve time, computed keys and values are cached so each new token only attends to history instead of recomputing it. Turns quadratic generation into linear, token-by-token.",
      tr: "Sunum sırasında, hesaplanan anahtarlar ve değerler önbelleğe alınır; böylece her yeni token yalnızca geçmişe bakar, onu yeniden hesaplamaz. Karesel üretimi doğrusala, token token çevirir.",
    },
  },
];

export function Architecture() {
  const { t } = useLang();
  const s = SECTIONS.architecture;

  return (
    <section id={s.id} className="orkhon-section orkhon-arch">
      <div className="orkhon-container">
        <SectionHeading index="05" heading={s.heading} intro={s.intro} />

        <MotionReveal className="orkhon-arch__grid">
          {BLOCKS.map((b, i) => (
            <MotionItem as="article" key={b.glyph} className="orkhon-arch__card" data-feature={i === 0 || undefined}>
              <div className="orkhon-arch__glyph-row">
                <span className="orkhon-arch__glyph">{b.glyph}</span>
                <span className="orkhon-arch__num">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="orkhon-arch__name">{b.name}</h3>
              <p className="orkhon-arch__full">{t(b.full)}</p>
              <p className="orkhon-arch__blurb">{t(b.blurb)}</p>
            </MotionItem>
          ))}
        </MotionReveal>
      </div>

      <style>{`
        .orkhon-arch__grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: clamp(0.85rem, 0.5rem + 1vw, 1.25rem);
        }
        .orkhon-arch__card {
          grid-column: span 2;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          padding: clamp(1.1rem, 0.9rem + 0.8vw, 1.5rem);
          background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          transition: border-color var(--duration-normal) var(--ease-out-expo),
                      transform var(--duration-normal) var(--ease-out-expo);
        }
        .orkhon-arch__card[data-feature] {
          grid-column: span 4;
          grid-row: span 1;
          background:
            radial-gradient(120% 100% at 0% 0%, rgba(79, 227, 212, 0.07), transparent 55%),
            linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border-color: var(--cyan-dim);
        }
        .orkhon-arch__card:hover {
          border-color: var(--line-strong);
          transform: translateY(-2px);
        }

        .orkhon-arch__glyph-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .orkhon-arch__glyph {
          font-family: var(--font-mono);
          font-size: clamp(1.3rem, 1.1rem + 0.6vw, 1.8rem);
          font-weight: 600;
          color: var(--ochre);
          letter-spacing: 0.02em;
        }
        .orkhon-arch__card[data-feature] .orkhon-arch__glyph { color: var(--cyan); }
        .orkhon-arch__num {
          font-family: var(--font-mono);
          font-size: 0.66rem;
          color: var(--ink-3);
          letter-spacing: 0.1em;
        }

        .orkhon-arch__name {
          font-size: clamp(1.05rem, 0.95rem + 0.4vw, 1.25rem);
          font-weight: 600;
          color: var(--ink-0);
          line-height: 1.2;
        }
        .orkhon-arch__full {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          color: var(--cyan-dim);
        }
        .orkhon-arch__card[data-feature] .orkhon-arch__full { color: var(--cyan); }
        .orkhon-arch__blurb {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          line-height: 1.55;
          color: var(--ink-2);
        }

        /* row 1: GQA(feature, 4) + RoPE(2). row 2: RMSNorm, SwiGLU, KV (2 each). */
        @media (max-width: 900px) {
          .orkhon-arch__grid { grid-template-columns: repeat(2, 1fr); }
          .orkhon-arch__card { grid-column: span 1; }
          .orkhon-arch__card[data-feature] { grid-column: span 2; }
        }
        @media (max-width: 480px) {
          .orkhon-arch__grid { grid-template-columns: 1fr; }
          .orkhon-arch__card,
          .orkhon-arch__card[data-feature] { grid-column: span 1; }
        }
      `}</style>
    </section>
  );
}
