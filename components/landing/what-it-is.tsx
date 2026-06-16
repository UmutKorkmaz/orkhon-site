"use client";

// WHAT IT IS — the crisp definition. Three short paragraphs framing Orkhon
// as a from-scratch transformer stack, not a frontier wrapper. Editorial
// drop-cap rhythm, intentional spacing.

import { useLang, type Bilingual } from "@/lib/i18n";
import { SECTIONS } from "@/lib/content";
import { MotionReveal, MotionItem, SectionHeading } from "./motion";
import { Chisel } from "./icons";

const PARAGRAPHS: Bilingual[] = [
  {
    en: "Orkhon is a decoder-only transformer written from scratch in PyTorch — not a wrapper around a frontier API. Every block — grouped-query attention, rotary embeddings, RMSNorm, SwiGLU, the serving-time KV-cache — is hand-coded and auditable. You can read the whole stack top to bottom.",
    tr: "Orkhon, PyTorch ile sıfırdan yazılmış bir decoder-only transformer'dır — ön cepheli bir API'nin sarmalı değil. Her blok — gruplanmış-sorgu dikkat, dönel gömmeler, RMSNorm, SwiGLU, sunum zamanı KV-cache — elle kodlanmış ve denetlenebilirdir. Yığının tamamını baştan sona okuyabilirsiniz.",
  },
  {
    en: "The full pipeline lives in one repo: byte-level BPE tokenization, pretraining, supervised fine-tuning, DPO and GRPO alignment, evaluation, and an OpenAI-compatible serving layer. The same code that carves the weights ships them.",
    tr: "Tam işlem hattı tek bir depoda yaşar: bayt düzeyinde BPE tokenizasyon, ön-eğitim, denetimli ince-ayar, DPO ve GRPO hizalaması, değerlendirme ve OpenAI uyumlu bir sunum katmanı. Ağırlıkları kazıyan kod, onları sunar.",
  },
  {
    en: "It runs on your machine — Apple MPS or NVIDIA CUDA — and it trains on consumer hardware. TinyStories in roughly 43 minutes on an M-series GPU; a 4M smoke model in about a minute. No cluster required to hold the lineage in your hands.",
    tr: "Kendi makinenizde çalışır — Apple MPS veya NVIDIA CUDA — ve tüketici donanımında eğitilir. TinyStories yaklaşık 43 dakikada, M serisi bir GPU'da; 4M'lik bir duman modeli yaklaşık bir dakikada. Soyu ellerinizde tutmak için küme gerekmez.",
  },
];

export function WhatItIs() {
  const { t } = useLang();
  const s = SECTIONS.whatItIs;

  return (
    <section id={s.id} className="orkhon-section orkhon-what">
      <div className="orkhon-container">
        <SectionHeading index="01" heading={s.heading} intro={s.intro} />

        <MotionReveal className="orkhon-what__grid">
          <MotionItem className="orkhon-what__body">
            {PARAGRAPHS.map((p, i) => (
              <p key={i} className="orkhon-what__p" data-first={i === 0 || undefined}>
                {t(p)}
              </p>
            ))}
          </MotionItem>

          <MotionItem as="aside" className="orkhon-what__aside">
            <h3 className="orkhon-what__aside-title">
              <Chisel /> What it is not
            </h3>
            <ul className="orkhon-what__aside-list">
              {NOT_IT.map((item, i) => (
                <li key={i}>{t(item)}</li>
              ))}
            </ul>
          </MotionItem>
        </MotionReveal>
      </div>

      <style>{`
        .orkhon-what__grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: clamp(2rem, 1rem + 3vw, 4rem);
          align-items: start;
        }
        .orkhon-what__body { display: flex; flex-direction: column; gap: 1.4rem; }
        .orkhon-what__p {
          font-family: var(--font-serif);
          font-size: clamp(1.1rem, 1.02rem + 0.4vw, 1.35rem);
          line-height: 1.65;
          color: var(--ink-1);
          max-width: 42rem;
        }
        .orkhon-what__p[data-first]::first-letter {
          font-family: var(--font-serif);
          font-size: 3.4em;
          line-height: 0.8;
          float: left;
          padding: 0.1em 0.14em 0 0;
          color: var(--ochre);
          font-weight: 600;
        }
        .orkhon-what__aside {
          position: sticky;
          top: 5rem;
          padding: clamp(1.25rem, 1rem + 1vw, 1.75rem);
          background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--line);
          border-left: 2px solid var(--rust);
          border-radius: var(--radius-lg);
        }
        .orkhon-what__aside-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--rust);
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .orkhon-what__aside-title svg { font-size: 0.7rem; color: var(--rust); }
        .orkhon-what__aside-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .orkhon-what__aside-list li {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--ink-2);
          padding-left: 1rem;
          position: relative;
        }
        .orkhon-what__aside-list li::before {
          content: "✕";
          position: absolute;
          left: 0;
          top: 0;
          color: var(--ink-3);
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }

        @media (max-width: 860px) {
          .orkhon-what__grid { grid-template-columns: 1fr; }
          .orkhon-what__aside { position: static; }
        }
      `}</style>
    </section>
  );
}

const NOT_IT: Bilingual[] = [
  {
    en: "A thin wrapper over GPT-4 or any frontier API.",
    tr: "GPT-4 veya herhangi bir ön cephe API'si üzerinde ince bir sarmal.",
  },
  {
    en: "An opaque framework you import and pray to.",
    tr: "İçe aktarıp umut bağladığınız opak bir çatı.",
  },
  {
    en: "A cluster-only system that needs GPUs you don't own.",
    tr: "Sahip olmadığınız GPU'lar isteyen, yalnızca küme gerektiren bir sistem.",
  },
  {
    en: "A metaphor bolted onto someone else's weights.",
    tr: "Başkasının ağırlıklarına sonradan eklenmiş bir metafor.",
  },
];
