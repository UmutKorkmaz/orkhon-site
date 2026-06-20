"use client";

// CLI — key commands in a styled terminal block. Shows the same tooling that
// built the models also serving them. Three commands surfaced: chat, serve,
// train, plus a couple of supporting ones.

import { useLang, type Bilingual } from "@/lib/i18n";
import { SECTIONS } from "@/lib/content";
import { MotionReveal, MotionItem, SectionHeading } from "./motion";

interface Cmd {
  cmd: string;
  comment: Bilingual;
  primary?: boolean;
}

const COMMANDS: Cmd[] = [
  {
    cmd: "orkhon chat --model tangri",
    comment: {
      en: "drop into an interactive REPL with the unified specialist",
      tr: "birlesik uzman modelle etkilesimli bir REPL'e gec",
    },
    primary: true,
  },
  {
    cmd: "orkhon serve --port 8000",
    comment: {
      en: "start an OpenAI-compatible HTTP server on :8000",
      tr: ":8000 üzerinde OpenAI uyumlu bir HTTP sunucusu başlat",
    },
    primary: true,
  },
  {
    cmd: "orkhon train --config sft_tangri_unified.yaml",
    comment: {
      en: "fine-tune the unified EN/TR/Kokturk assistant recipe",
      tr: "birlesik EN/TR/Kokturk asistan tarifini ince ayarla",
    },
    primary: true,
  },
  {
    cmd: "orkhon eval --split val --metric ppl",
    comment: {
      en: "score a checkpoint on held-out text",
      tr: "bir kontrol noktasını ayrılmış metinde puanla",
    },
  },
  {
    cmd: "orkhon export --format safetensors",
    comment: {
      en: "carve weights into the artifact the server serves",
      tr: "ağırlıkları sunucunun sunacağı yapının içine kazı",
    },
  },
];

export function Cli() {
  const { t } = useLang();
  const s = SECTIONS.cli;

  return (
    <section id={s.id} className="orkhon-section orkhon-cli">
      <div className="orkhon-container">
        <SectionHeading index="06" heading={s.heading} intro={s.intro} />

        <MotionReveal className="orkhon-cli__layout">
          <MotionItem as="div" className="orkhon-cli__terminal">
            <div className="orkhon-cli__bar">
              <span className="orkhon-cli__dot orkhon-cli__dot--r" />
              <span className="orkhon-cli__dot orkhon-cli__dot--y" />
              <span className="orkhon-cli__dot orkhon-cli__dot--g" />
              <span className="orkhon-cli__title">orkhon — zsh</span>
            </div>
            <pre className="orkhon-cli__body">
              <code>
                <span className="orkhon-cli__prompt">$</span> whoami{"\n"}
                umut{"\n\n"}
                {COMMANDS.map((c, i) => (
                  <span key={i} className="orkhon-cli__line" data-primary={c.primary || undefined}>
                    <span className="orkhon-cli__prompt">$</span>{" "}
                    <span className="orkhon-cli__cmd">{c.cmd}</span>
                    {"\n"}
                    <span className="orkhon-cli__comment"># {t(c.comment)}</span>
                    {"\n"}
                    {i < COMMANDS.length - 1 ? "\n" : ""}
                  </span>
                ))}
              </code>
            </pre>
          </MotionItem>

          <MotionItem as="ul" className="orkhon-cli__surfaces">
            {SURFACES.map((sf, i) => (
              <li key={i} className="orkhon-cli__surface">
                <span className="orkhon-cli__surface-glyph" aria-hidden="true">{sf.glyph}</span>
                <div>
                  <strong className="orkhon-cli__surface-name">{t(sf.name)}</strong>
                  <span className="orkhon-cli__surface-desc">{t(sf.desc)}</span>
                </div>
              </li>
            ))}
          </MotionItem>
        </MotionReveal>
      </div>

      <style>{`
        .orkhon-cli__layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: clamp(1.25rem, 0.8rem + 1.5vw, 2.25rem);
          align-items: start;
        }

        .orkhon-cli__terminal {
          background: var(--bg-inset);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-card);
        }
        .orkhon-cli__bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.9rem;
          background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
          border-bottom: 1px solid var(--line);
        }
        .orkhon-cli__dot {
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 50%;
          display: inline-block;
        }
        .orkhon-cli__dot--r { background: #c25a3a; }
        .orkhon-cli__dot--y { background: #c08a3e; }
        .orkhon-cli__dot--g { background: #4fe3d4; }
        .orkhon-cli__title {
          margin-left: 0.6rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--ink-3);
          letter-spacing: 0.04em;
        }

        .orkhon-cli__body {
          margin: 0;
          padding: clamp(1rem, 0.8rem + 1vw, 1.4rem);
          font-family: var(--font-mono);
          font-size: clamp(0.78rem, 0.72rem + 0.2vw, 0.88rem);
          line-height: 1.7;
          color: var(--ink-1);
          overflow-x: auto;
        }
        .orkhon-cli__prompt { color: var(--ochre); user-select: none; }
        .orkhon-cli__cmd { color: var(--cyan); }
        .orkhon-cli__line[data-primary] .orkhon-cli__cmd { color: var(--cyan-bright); font-weight: 500; }
        .orkhon-cli__comment { color: var(--ink-3); }

        .orkhon-cli__surfaces {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .orkhon-cli__surface {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 1rem;
          border-top: 1px solid var(--line);
        }
        .orkhon-cli__surface:first-child { border-top: 0; padding-top: 0; }
        .orkhon-cli__surface-glyph {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--ochre);
          line-height: 1.4;
          flex-shrink: 0;
        }
        .orkhon-cli__surface-name {
          display: block;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--ink-0);
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .orkhon-cli__surface-desc {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--ink-2);
        }

        @media (max-width: 860px) {
          .orkhon-cli__layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

const SURFACES: { glyph: string; name: Bilingual; desc: Bilingual }[] = [
  {
    glyph: "▸",
    name: { en: "One command surface", tr: "Tek komut yüzeyi" },
    desc: {
      en: "Train, tune, evaluate, export, and serve from the same CLI. No glue scripts.",
      tr: "Aynı CLI'dan eğit, incelt, değerlendir, dışa aktar, sun. Tutkal betik yok.",
    },
  },
  {
    glyph: "⌁",
    name: { en: "OpenAI-compatible", tr: "OpenAI uyumlu" },
    desc: {
      en: "The server speaks the /v1/chat/completions contract — point any client at it.",
      tr: "Sunucu /v1/chat/completions sözleşmesini konuşur — herhangi bir istemciyi ona yönlendirin.",
    },
  },
  {
    glyph: "⊙",
    name: { en: "Auditable recipes", tr: "Denetlenebilir tarifler" },
    desc: {
      en: "Every run is a YAML recipe + a checkpoint. Reproduce a model by re-reading the stone.",
      tr: "Her koşu bir YAML tarif + bir kontrol noktasıdır. Bir modeli taşı yeniden okuyarak çoğaltın.",
    },
  },
];
