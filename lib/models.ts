// Orkhon model registry - authoritative source of truth for the site model zoo.

export type ModelKind = "base" | "instruct" | "imported";

export interface Bilingual {
  en: string;
  tr: string;
}

export interface Model {
  id: string;
  codename: string;
  kind: ModelKind;
  params: string;
  metric: string;
  date: string;
  lineage: Bilingual;
  tagline: Bilingual;
  goodFor: Bilingual;
}

export const KIND_LABEL: Record<ModelKind, string> = {
  base: "Base / text continuation",
  instruct: "Instruct / chat-tuned",
  imported: "Imported open base",
};

const UNIFIED_NOTE = {
  en: "Unified assistant line: English, Turkish, and Kokturk/Old Turkic rune-to-Latin transliteration are normal capabilities, not a separate branch.",
  tr: "Birleşik asistan hattı: İngilizce, Türkçe ve Köktürk/Eski Türkçe rune -> Latin transliterasyon normal kabiliyetlerdir; ayrı bir dal değildir.",
} as const;

export const MODELS: Model[] = [
  {
    id: "tangri",
    codename: "Tangri",
    kind: "instruct",
    params: "100M",
    metric: "routed eval 100%",
    date: "2026-06-20",
    lineage: {
      en: "Tangri is the first larger unified Orkhon assistant, tuned from the mixed 100M base after the earlier bilingual and transliteration experiments.",
      tr: "Tangri, önceki iki dilli ve transliterasyon denemelerinden sonra mixed 100M base üzerinden inceltilen ilk daha büyük birleşik Orkhon asistanıdır.",
    },
    tagline: {
      en: "The default specialist - one assistant for EN, TR, and Kokturk transliteration.",
      tr: "Varsayılan uzman - EN, TR ve Köktürk transliterasyonu için tek asistan.",
    },
    goodFor: UNIFIED_NOTE,
  },
  {
    id: "bunghu",
    codename: "Bunghu",
    kind: "instruct",
    params: "57M",
    metric: "backport target",
    date: "2026-06-20",
    lineage: {
      en: "Bunghu is the clean ASCII replacement for the former bilingual branch name, upgraded into the same unified assistant behavior.",
      tr: "Bunghu, eski iki dilli hat adının temiz ASCII karşılığı olarak aynı birleşik asistan davranışına yükseltilir.",
    },
    tagline: {
      en: "Bilingual branch, upgraded into the same specialist assistant.",
      tr: "İki dilli hat, aynı uzman asistana yükseltilmiş.",
    },
    goodFor: UNIFIED_NOTE,
  },
  {
    id: "tegin",
    codename: "Tegin",
    kind: "instruct",
    params: "22M",
    metric: "backport target",
    date: "2026-06-20",
    lineage: {
      en: "Tegin replaces the former story-instruction public name and is tuned away from unwanted story replies into general assistant behavior.",
      tr: "Tegin, eski hikaye-talimat public adının yerini alır ve istenmeyen hikaye cevaplarından genel asistan davranışına doğru inceltilir.",
    },
    tagline: {
      en: "The old story voice, retrained to answer instead of drifting into stories.",
      tr: "Eski hikaye sesi, hikayeye kaymak yerine yanıtlamak için yeniden eğitilir.",
    },
    goodFor: UNIFIED_NOTE,
  },
  {
    id: "tonyuk",
    codename: "Tonyuk",
    kind: "instruct",
    params: "22M",
    metric: "backport target",
    date: "2026-06-20",
    lineage: {
      en: "Tonyuk is the concise clean name for the old story base after unified assistant fine-tuning.",
      tr: "Tonyuk, eski hikaye base'inin birleşik asistan ince ayarından sonraki kısa ve temiz adıdır.",
    },
    tagline: {
      en: "Compact reasoning/story base, converted into a chat assistant.",
      tr: "Kompakt akıl yürütme/hikaye base'i, chat asistanına çevrildi.",
    },
    goodFor: UNIFIED_NOTE,
  },
  {
    id: "istem",
    codename: "Istem",
    kind: "instruct",
    params: "51M",
    metric: "backport target",
    date: "2026-06-20",
    lineage: {
      en: "Istem is the clean name for the former web-text base after it is aligned into the unified assistant line.",
      tr: "Istem, eski web-text base'inin birleşik asistan hattına hizalandıktan sonraki temiz adıdır.",
    },
    tagline: {
      en: "The web-text branch, aligned for assistant answers.",
      tr: "Web-text hattı, asistan yanıtları için hizalanmış.",
    },
    goodFor: UNIFIED_NOTE,
  },
  {
    id: "bumin-mini",
    codename: "Bumin Mini",
    kind: "instruct",
    params: "4M",
    metric: "backport target",
    date: "2026-06-20",
    lineage: {
      en: "Bumin Mini keeps the first tiny proof-of-pipeline model but names it honestly as a compact smoke member.",
      tr: "Bumin Mini, ilk küçük pipeline kanıtı modelini korur ama onu dürüstçe kompakt smoke üye olarak adlandırır.",
    },
    tagline: {
      en: "Tiny smoke assistant for fast local checks.",
      tr: "Hızlı yerel kontroller için mini smoke asistanı.",
    },
    goodFor: UNIFIED_NOTE,
  },
  {
    id: "kashgar",
    codename: "Kashgar",
    kind: "imported",
    params: "135M",
    metric: "weights pending",
    date: "2026-06-20",
    lineage: {
      en: "Kashgar is the imported/open-base slot; it becomes selectable only after local weights are archived and served.",
      tr: "Kashgar, imported/open-base slotudur; yerel ağırlıklar arşivlenip servis edilince seçilebilir olur.",
    },
    tagline: {
      en: "Imported reference slot, not live until weights are archived.",
      tr: "Imported referans slotu; ağırlıklar arşivlenene kadar live değil.",
    },
    goodFor: {
      en: "Reference imported model slot. It is shown for lineage clarity but is not live until a runnable checkpoint exists.",
      tr: "Referans imported model slotu. Soy ağacı netliği için gösterilir, çalışan checkpoint olana kadar live değildir.",
    },
  },
];

/**
 * Models whose trained weights are served by the live Space.
 *
 * Keep this list conservative: a model id here must also exist in
 * spaces/orkhon-demo/app.py and have a published/exported HF repo.
 */
export const LIVE_MODEL_IDS = new Set<string>([
  "tangri",
  "bunghu",
  "tegin",
  "tonyuk",
  "istem",
  "bumin-mini",
]);
