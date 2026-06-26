"use client";

import { useState } from "react";
import { Beaker, CheckCircle2, ClipboardPenLine, Workflow } from "lucide-react";
import { getModelLabProfile } from "@/lib/model-labs";
import { KIND_LABEL, LIVE_MODEL_IDS, MODELS } from "@/lib/models";
import { useLang } from "@/lib/i18n";

interface ModelLabPanelProps {
  modelId: string;
  onUsePrompt: (text: string) => void;
}

const COPY = {
  title: { en: "Model lab", tr: "Model laboratuvarı" },
  focus: { en: "Best fit", tr: "En uygun kullanım" },
  workflow: { en: "How to use it", tr: "Nasıl kullanılır" },
  checks: { en: "Check before trusting", tr: "Güvenmeden önce kontrol et" },
  prompts: { en: "Prepared runs", tr: "Hazır denemeler" },
  load: { en: "Load prompt", tr: "Promptu yükle" },
  loaded: { en: "Prompt loaded into the composer.", tr: "Prompt yazma alanına yüklendi." },
  live: { en: "Live backend", tr: "Canlı backend" },
  soon: { en: "Not live yet", tr: "Henüz canlı değil" },
} as const;

export function ModelLabPanel({ modelId, onUsePrompt }: ModelLabPanelProps) {
  const { t } = useLang();
  const [loadedPrompt, setLoadedPrompt] = useState("");
  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const lab = getModelLabProfile(model.id);
  const live = LIVE_MODEL_IDS.has(model.id);

  return (
    <aside className="orkhon-lab-panel" aria-label={t(COPY.title)}>
      <div className="orkhon-lab-panel__hero">
        <div>
          <span className="orkhon-kicker orkhon-lab-panel__kicker">
            {t(COPY.title)}
          </span>
          <h2 className="orkhon-lab-panel__title">{model.codename}</h2>
          <p className="orkhon-lab-panel__meta">
            {model.params} · {model.metric} · {KIND_LABEL[model.kind]}
          </p>
        </div>
        <span
          className="orkhon-lab-panel__status"
          data-live={live ? "true" : "false"}
        >
          {live ? t(COPY.live) : t(COPY.soon)}
        </span>
      </div>

      <div className="orkhon-lab-panel__grid">
        <section className="orkhon-lab-card orkhon-lab-card--focus">
          <div className="orkhon-lab-card__head">
            <Beaker size={16} aria-hidden="true" />
            <h3>{t(COPY.focus)}</h3>
          </div>
          <p>{t(lab.focus)}</p>
        </section>

        <section className="orkhon-lab-card">
          <div className="orkhon-lab-card__head">
            <Workflow size={16} aria-hidden="true" />
            <h3>{t(COPY.workflow)}</h3>
          </div>
          <ol className="orkhon-lab-list">
            {lab.workflow.map((step) => (
              <li key={step.en}>{t(step)}</li>
            ))}
          </ol>
        </section>

        <section className="orkhon-lab-card">
          <div className="orkhon-lab-card__head">
            <CheckCircle2 size={16} aria-hidden="true" />
            <h3>{t(COPY.checks)}</h3>
          </div>
          <ul className="orkhon-lab-list">
            {lab.checks.map((check) => (
              <li key={check.en}>{t(check)}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="orkhon-lab-runs">
        <div className="orkhon-lab-card__head">
          <ClipboardPenLine size={16} aria-hidden="true" />
          <h3>{t(COPY.prompts)}</h3>
        </div>
        <div className="orkhon-lab-runs__grid">
          {lab.prompts.map((prompt) => {
            const body = t(prompt.body);
            return (
              <article className="orkhon-lab-run" key={prompt.id}>
                <h4>{t(prompt.title)}</h4>
                <p>{body}</p>
                <button
                  type="button"
                  className="orkhon-lab-run__button"
                  onClick={() => {
                    onUsePrompt(body);
                    setLoadedPrompt(t(prompt.title));
                  }}
                  disabled={!live}
                >
                  {t(COPY.load)}
                </button>
              </article>
            );
          })}
        </div>
        <p className="orkhon-lab-runs__note" role="status" aria-live="polite">
          {loadedPrompt ? `${t(COPY.loaded)} ${loadedPrompt}` : ""}
        </p>
      </section>

      <ModelLabPanelStyles />
    </aside>
  );
}

function ModelLabPanelStyles() {
  return (
    <style>{`
      .orkhon-lab-panel {
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        background:
          radial-gradient(90% 100% at 15% 0%, rgba(79, 227, 212, 0.07), transparent 62%),
          radial-gradient(80% 90% at 95% 10%, rgba(192, 138, 62, 0.08), transparent 60%),
          linear-gradient(180deg, var(--bg-1), var(--bg-0));
        box-shadow: var(--shadow-card);
        padding: clamp(1rem, 0.8rem + 1vw, 1.6rem);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .orkhon-lab-panel__hero {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
      }
      .orkhon-lab-panel__kicker { color: var(--cyan); }
      .orkhon-lab-panel__title {
        margin-top: 0.25rem;
        font-size: clamp(1.8rem, 1.4rem + 1.8vw, 2.7rem);
        color: var(--ink-0);
        line-height: 1;
      }
      .orkhon-lab-panel__meta {
        margin-top: 0.45rem;
        color: var(--ink-2);
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.04em;
      }
      .orkhon-lab-panel__status {
        flex: none;
        border: 1px solid var(--line-strong);
        border-radius: var(--radius);
        padding: 0.3rem 0.55rem;
        font-family: var(--font-mono);
        font-size: 0.64rem;
        letter-spacing: 0.13em;
        text-transform: uppercase;
        color: var(--ink-2);
      }
      .orkhon-lab-panel__status[data-live="true"] {
        color: var(--cyan);
        border-color: var(--cyan-dim);
        background: rgba(79, 227, 212, 0.05);
      }
      .orkhon-lab-panel__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.8rem;
      }
      .orkhon-lab-card,
      .orkhon-lab-runs {
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        background: rgba(12, 10, 8, 0.42);
        padding: 0.95rem;
      }
      .orkhon-lab-card--focus { grid-column: 1 / -1; }
      .orkhon-lab-card__head {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--ochre);
        margin-bottom: 0.6rem;
      }
      .orkhon-lab-card__head h3 {
        margin: 0;
        color: var(--ink-0);
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .orkhon-lab-card p,
      .orkhon-lab-run p {
        margin: 0;
        color: var(--ink-2);
        font-size: 0.88rem;
        line-height: 1.55;
      }
      .orkhon-lab-list {
        margin: 0;
        padding-left: 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        color: var(--ink-2);
        font-size: 0.86rem;
        line-height: 1.5;
      }
      .orkhon-lab-runs {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .orkhon-lab-runs__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
      }
      .orkhon-lab-run {
        min-width: 0;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--bg-inset);
        padding: 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }
      .orkhon-lab-run h4 {
        margin: 0;
        font-family: var(--font-serif);
        color: var(--ink-0);
        font-size: 1rem;
      }
      .orkhon-lab-run__button {
        margin-top: auto;
        align-self: flex-start;
        border: 1px solid var(--cyan-dim);
        background: rgba(79, 227, 212, 0.07);
        color: var(--cyan);
        border-radius: var(--radius);
        padding: 0.42rem 0.7rem;
        font-family: var(--font-mono);
        font-size: 0.68rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        transition: border-color var(--duration-fast) ease, background var(--duration-fast) ease, color var(--duration-fast) ease;
      }
      .orkhon-lab-run__button:hover:not(:disabled) {
        border-color: var(--cyan);
        background: rgba(79, 227, 212, 0.12);
        color: var(--cyan-bright);
      }
      .orkhon-lab-run__button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .orkhon-lab-runs__note {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
      @media (max-width: 940px) {
        .orkhon-lab-panel__grid,
        .orkhon-lab-runs__grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 560px) {
        .orkhon-lab-panel__hero {
          flex-direction: column;
        }
        .orkhon-lab-panel__status {
          align-self: flex-start;
        }
      }
    `}</style>
  );
}
