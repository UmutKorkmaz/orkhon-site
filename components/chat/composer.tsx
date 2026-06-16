"use client";

// Composer for the Orkhon chat surface.
//
// Behavior:
//   - Enter           → send
//   - Shift+Enter     → newline
//   - IME composition  → Enter does NOT send (respects composing users)
//   - Disabled while a request is in flight
//   - Auto-grows up to a max height, then scrolls internally
//
// Accessibility:
//   - The textarea owns a visible label (visually-hidden) so screen readers
//     announce purpose, and the send button has a bilingual text label.

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface ComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const PLACEHOLDER: { en: string; tr: string } = {
  en: "Write to Orkhon…  (Enter to send · Shift+Enter for newline)",
  tr: "Orkhon'a yaz…  (Göndermek için Enter · Yeni satır için Shift+Enter)",
};

const SEND_LABEL: { en: string; tr: string } = {
  en: "Send",
  tr: "Gönder",
};

const COMPOSER_LABEL: { en: string; tr: string } = {
  en: "Message",
  tr: "Mesaj",
};

const MAX_HEIGHT = 200;

export function Composer({ onSend, disabled }: ComposerProps) {
  const { t } = useLang();
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const labelId = useId();

  // Auto-grow: reset height then clamp to MAX_HEIGHT.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Return focus + reset height for the next turn.
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.focus();
      }
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      // Respect IME composition (Enter confirms the candidate).
      if (isComposing || e.nativeEvent.isComposing) return;
      if (e.shiftKey) return; // explicit newline
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="orkhon-composer">
      <label htmlFor={labelId} className="orkhon-visually-hidden">
        {t(COMPOSER_LABEL)}
      </label>
      <textarea
        id={labelId}
        ref={textareaRef}
        className="orkhon-composer__field"
        value={value}
        placeholder={t(PLACEHOLDER)}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        rows={1}
        disabled={disabled}
        aria-disabled={disabled}
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
      />
      <button
        type="button"
        className="orkhon-composer__send orkhon-btn orkhon-btn--primary"
        onClick={submit}
        disabled={disabled || value.trim().length === 0}
        aria-label={t(SEND_LABEL)}
      >
        <ArrowUp size={16} aria-hidden="true" />
        <span>{t(SEND_LABEL)}</span>
      </button>
    </div>
  );
}
