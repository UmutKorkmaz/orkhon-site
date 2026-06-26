"use client";

// Model selector for the Orkhon chat surface.
//
// The user explicitly asked that the selector *explain* what each model is —
// not just list names. So each row carries:
//   - codename (serif)
//   - kind badge (base / instruct / imported) with its semantic color
//   - params + the model's eval metric
//   - a one-line "what kind of model is this" sentence, derived purely
//     from the kind (so every model is legible even to a first-time reader)
//   - the lineage tagline pulled from the model registry
//
// Kind meanings (canonical, surfaced to the user):
//   base      → continues your text (raw continuation)
//   instruct  → follows instructions / assistant replies
//   imported  → an open base re-loaded into the lineage with exact parity

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  MODELS,
  KIND_LABEL,
  LIVE_MODEL_IDS,
  type Model,
  type ModelKind,
} from "@/lib/models";
import { useLang } from "@/lib/i18n";

/** One-line "what kind of model is this", bilingual, by kind. */
const KIND_EXPLANATION: Record<ModelKind, { en: string; tr: string }> = {
  base: {
    en: "Continues your text — a raw language model. Give it a sentence, it finishes the thought.",
    tr: "Metninizi sürdürür — ham bir dil modeli. Bir cümle verin, düşünceyi tamamlasın.",
  },
  instruct: {
    en: "Follows instructions. Ask a question or give a task; it answers back.",
    tr: "Talimatları izler. Bir soru sorun veya görev verin; yanıtlasın.",
  },
  imported: {
    en: "An open-weights base re-loaded into Orkhon with exact parity — outside knowledge, same lineage.",
    tr: "Birebir eşlikle Orkhon'a yeniden yüklenmiş açık ağırlıklı bir temel — dış bilgi, aynı soy.",
  },
};

/** Live-vs-upcoming badge copy. Only `LIVE_MODEL_IDS` voices have served weights. */
const STATUS = {
  live: { en: "Live", tr: "Canlı" },
  soon: { en: "Coming soon", tr: "Yakında" },
} as const;

interface ModelSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerId = useId();
  const listboxId = useId();

  const selected: Model =
    MODELS.find((m) => m.id === value) ?? MODELS[0];

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Reset focus when opening.
  useEffect(() => {
    if (open) {
      const idx = MODELS.findIndex((m) => m.id === selected.id);
      setFocusIndex(idx >= 0 ? idx : 0);
    }
  }, [open, selected.id]);

  function choose(model: Model) {
    // Only models whose weights are actually served can be selected; the rest
    // are showcased in the zoo but not yet online.
    if (!LIVE_MODEL_IDS.has(model.id)) return;
    onChange(model.id);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onOptionKeyDown(e: React.KeyboardEvent, model: Model) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(model);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => Math.min(i + 1, MODELS.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Tab") {
      // Allow tab navigation between options without closing.
      e.preventDefault();
      setFocusIndex((i) =>
        e.shiftKey ? Math.max(i - 1, 0) : Math.min(i + 1, MODELS.length - 1),
      );
    }
  }

  return (
    <div className="orkhon-ms" ref={rootRef}>
      <button
        type="button"
        id={triggerId}
        className="orkhon-ms__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="orkhon-ms__trigger-left">
          <span className="orkhon-ms__codename">{selected.codename}</span>
          <KindBadge kind={selected.kind} />
        </span>
        <span className="orkhon-ms__trigger-right">
          <span className="orkhon-ms__params">{selected.params}</span>
          <ChevronDown
            className="orkhon-ms__chev"
            aria-hidden="true"
            data-open={open ? "true" : "false"}
            size={16}
          />
        </span>
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          aria-activedescendant={`${listboxId}-opt-${focusIndex}`}
          className="orkhon-ms__list"
        >
          {MODELS.map((model, idx) => {
            const isSelected = model.id === selected.id;
            const isFocused = idx === focusIndex;
            const live = LIVE_MODEL_IDS.has(model.id);
            return (
              <li
                key={model.id}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={!live}
                data-selected={isSelected ? "true" : "false"}
                data-focused={isFocused ? "true" : "false"}
                data-disabled={!live ? "true" : "false"}
                className="orkhon-ms__option"
                style={
                  live ? undefined : { opacity: 0.5, cursor: "not-allowed" }
                }
                tabIndex={-1}
                onClick={() => choose(model)}
                onMouseEnter={() => setFocusIndex(idx)}
                onKeyDown={(e) => onOptionKeyDown(e, model)}
              >
                <div className="orkhon-ms__option-head">
                  <span className="orkhon-ms__option-codename">
                    {model.codename}
                  </span>
                  <KindBadge kind={model.kind} />
                  <span
                    className="orkhon-ms__status"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "var(--radius)",
                      border: "1px solid",
                      borderColor: live
                        ? "var(--cyan-dim)"
                        : "var(--line-strong)",
                      color: live ? "var(--cyan)" : "var(--ink-3)",
                    }}
                  >
                    {live ? t(STATUS.live) : t(STATUS.soon)}
                  </span>
                  <span className="orkhon-ms__option-meta">
                    {model.params}
                    {model.metric ? ` · ${model.metric}` : ""}
                  </span>
                  {isSelected && (
                    <Check
                      className="orkhon-ms__check"
                      size={15}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <p className="orkhon-ms__kind-explain">
                  {t(KIND_EXPLANATION[model.kind])}
                </p>

                <p className="orkhon-ms__tagline">{t(model.tagline)}</p>

                <p className="orkhon-ms__kind-label">
                  {KIND_LABEL[model.kind]}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function KindBadge({ kind }: { kind: ModelKind }) {
  const label = KIND_LABEL[kind];
  const short = label.split(" ")[0].toLowerCase();
  return (
    <span
      className={`orkhon-badge orkhon-badge--${short}`}
      data-kind={kind}
      aria-label={label}
    >
      {label}
    </span>
  );
}
