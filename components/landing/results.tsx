"use client";

// RESULTS — the honest ledger. Two evidence cards: the TinyStories run
// (fluent English generation, val loss 1.55 / ppl 5.3, ~43 min on MPS)
// and the smoke run (4M model, ~1 min, learns chat format). Real sample
// text is shown in a terminal-style block.

import { useLang, type Bilingual } from "@/lib/i18n";
import { SECTIONS } from "@/lib/content";
import { MotionReveal, MotionItem, SectionHeading } from "./motion";

const TINY_STORY: Bilingual = {
  en: "Once upon a time, there was a little girl named Lily. She loved to play in the garden behind her house. One day she found a small bird that could not fly. Lily picked up the bird and took it home. She gave it water and seeds, and every day the bird grew stronger.",
  tr: "Bir zamanlar, Lily adında küçük bir kız vardı. Evinin arkasındaki bahçede oynamayı severdi. Bir gün uçamayan küçük bir kuş buldu. Lily kuşu aldı ve eve götürdü. Ona su ve tohum verdi ve her geçen gün kuş biraz daha güçlendi.",
};

const SMOKE_SAMPLE: Bilingual = {
  en: "<|system|>\nYou are Orkhon, a helpful assistant.\n<|user|>\nWhat is the Göktürk alphabet?\n<|assistant|>\nThe Göktürk alphabet is the script used to write Old Turkic on the Orkhon inscriptions.",
  tr: "<|system|>\nSen Orkhon'sun, yardımsever bir asistansın.\n<|user|>\nGöktürk alfabesi nedir?\n<|assistant|>\nGöktürk alfabesi, Orhun yazıtlarına Eski Türkçe yazmak için kullanılan yazıdır.",
};

export function Results() {
  const { t } = useLang();
  const s = SECTIONS.results;

  return (
    <section id={s.id} className="orkhon-section orkhon-results">
      <div className="orkhon-container">
        <SectionHeading index="04" heading={s.heading} intro={s.intro} />

        <MotionReveal className="orkhon-results__grid">
          {/* TinyStories — the headline result */}
          <MotionItem as="article" className="orkhon-results__card orkhon-results__card--lead">
            <header className="orkhon-results__card-head">
              <span className="orkhon-results__tag orkhon-results__tag--lead">
                {t({ en: "TinyStories · English fluency", tr: "TinyStories · İngilizce akıcılık" })}
              </span>
              <span className="orkhon-results__runtime">
                {t({ en: "~43 min · Apple MPS", tr: "~43 dk · Apple MPS" })}
              </span>
            </header>

            <div className="orkhon-results__metrics">
              <Metric label={t({ en: "Val loss", tr: "Val kayıp" })} value="1.55" />
              <Metric label={t({ en: "Perplexity", tr: "Perplexity" })} value="5.3" />
              <Metric label={t({ en: "Language", tr: "Dil" })} value="EN" />
            </div>

            <div className="orkhon-results__sample" data-kind="story">
              <span className="orkhon-results__sample-label">
                {t({ en: "Generated sample", tr: "Üretilen örnek" })}
              </span>
              <p className="orkhon-results__sample-text">{t(TINY_STORY)}</p>
            </div>

            <p className="orkhon-results__note">
              {t({
                en: "A from-scratch transformer producing coherent, grammatical English narrative after a 43-minute training run on consumer MPS — proof the stack learns to write, not just to count tokens.",
                tr: "Sıfırdan yazılmış bir transformer'ın, tüketici MPS'sinde 43 dakikalık bir eğitim koşusunun ardından tutarlı, dilbilgisine uygun İngilizce anlatı üretmesi — yığının yalnızca token saymayı değil, yazmayı öğrendiğinin kanıtı.",
              })}
            </p>
          </MotionItem>

          {/* Smoke run — the fast sanity check */}
          <MotionItem as="article" className="orkhon-results__card">
            <header className="orkhon-results__card-head">
              <span className="orkhon-results__tag">
                {t({ en: "Smoke run · 4M model", tr: "Duman koşusu · 4M model" })}
              </span>
              <span className="orkhon-results__runtime">
                {t({ en: "~1 min", tr: "~1 dk" })}
              </span>
            </header>

            <div className="orkhon-results__metrics orkhon-results__metrics--two">
              <Metric label={t({ en: "Params", tr: "Parametre" })} value="4M" />
              <Metric label={t({ en: "Task", tr: "Görev" })} value="chat fmt" />
            </div>

            <div className="orkhon-results__terminal" aria-label="Smoke run sample">
              <div className="orkhon-results__terminal-bar">
                <span className="orkhon-results__terminal-dot" />
                <span className="orkhon-results__terminal-title">orkhon › bumin · smoke</span>
              </div>
              <pre className="orkhon-results__terminal-body">
                <code>{t(SMOKE_SAMPLE)}</code>
              </pre>
            </div>

            <p className="orkhon-results__note">
              {t({
                en: "A four-million-parameter smoke model learns the chat template in about a minute — the fastest proof the pipeline, tokenizer, and SFT loop are wired end to end.",
                tr: "Dört milyon parametreli bir duman modeli, sohbet şablonunu yaklaşık bir dakikada öğrenir — işlem hattının, tokenizer'ın ve STO döngüsünün uçtan uca bağlı olduğunun en hızlı kanıtı.",
              })}
            </p>
          </MotionItem>
        </MotionReveal>
      </div>

      <style>{`
        .orkhon-results__grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: clamp(1.25rem, 0.8rem + 1.5vw, 2rem);
          align-items: start;
        }

        .orkhon-results__card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: clamp(1.5rem, 1rem + 1.5vw, 2rem);
          background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
        }
        .orkhon-results__card--lead {
          border-color: var(--line-strong);
          box-shadow: var(--shadow-glow), var(--shadow-card);
        }

        .orkhon-results__card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .orkhon-results__tag {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-2);
          padding: 0.3rem 0.6rem;
          border: 1px solid var(--line-strong);
          border-radius: var(--radius);
        }
        .orkhon-results__tag--lead {
          color: var(--cyan);
          border-color: var(--cyan-dim);
        }
        .orkhon-results__runtime {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--ochre);
          letter-spacing: 0.04em;
        }

        .orkhon-results__metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .orkhon-results__metrics--two { grid-template-columns: repeat(2, 1fr); }

        .orkhon-results__sample {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 1rem;
          background: var(--bg-inset);
          border: 1px solid var(--line);
          border-left: 2px solid var(--cyan-dim);
          border-radius: var(--radius);
        }
        .orkhon-results__sample-label {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cyan-dim);
        }
        .orkhon-results__sample-text {
          font-family: var(--font-serif);
          font-size: 1rem;
          line-height: 1.65;
          color: var(--ink-0);
        }

        .orkhon-results__terminal {
          background: var(--bg-inset);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .orkhon-results__terminal-bar {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid var(--line);
          background: var(--bg-1);
        }
        .orkhon-results__terminal-dot {
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 50%;
          background: var(--ochre);
        }
        .orkhon-results__terminal-title {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--ink-2);
          letter-spacing: 0.04em;
        }
        .orkhon-results__terminal-body {
          margin: 0;
          padding: 0.9rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          line-height: 1.6;
          color: var(--ink-1);
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .orkhon-results__note {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--ink-2);
        }

        @media (max-width: 860px) {
          .orkhon-results__grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 420px) {
          .orkhon-results__metrics { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="orkhon-results__metric">
      <span className="orkhon-results__metric-value">{value}</span>
      <span className="orkhon-results__metric-label">{label}</span>
      <style>{`
        .orkhon-results__metric {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding: 0.6rem 0.75rem;
          background: var(--bg-inset);
          border: 1px solid var(--line);
          border-radius: var(--radius);
        }
        .orkhon-results__metric-value {
          font-family: var(--font-mono);
          font-size: clamp(1.1rem, 1rem + 0.4vw, 1.4rem);
          font-weight: 500;
          color: var(--cyan);
          line-height: 1;
        }
        .orkhon-results__metric-label {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-3);
        }
      `}</style>
    </div>
  );
}
