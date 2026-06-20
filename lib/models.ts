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
  tr: "Birlesik asistan hatti: Ingilizce, Turkce ve Kokturk/Eski Turkce rune -> Latin transliterasyon normal kabiliyetlerdir; ayri bir dal degildir.",
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
      tr: "Tangri, onceki iki dilli ve transliterasyon denemelerinden sonra mixed 100M base uzerinden inceltilen ilk daha buyuk birlesik Orkhon asistanidir.",
    },
    tagline: {
      en: "The default specialist - one assistant for EN, TR, and Kokturk transliteration.",
      tr: "Varsayilan uzman - EN, TR ve Kokturk transliterasyon icin tek asistan.",
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
      tr: "Bunghu, eski iki dilli hat adinin temiz ASCII karsiligi olarak ayni birlesik asistan davranisina yukseltilir.",
    },
    tagline: {
      en: "Bilingual branch, upgraded into the same specialist assistant.",
      tr: "Iki dilli hat, ayni uzman asistana yukseltilmis.",
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
      tr: "Tegin, eski hikaye-talimat public adinin yerini alir ve istenmeyen hikaye cevaplarindan genel asistan davranisina dogru inceltilir.",
    },
    tagline: {
      en: "The old story voice, retrained to answer instead of drifting into stories.",
      tr: "Eski hikaye sesi, hikayeye kaymak yerine yanitlamak icin yeniden egitilir.",
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
      tr: "Tonyuk, eski hikaye base'inin birlesik asistan ince ayarindan sonraki kisa ve temiz adidir.",
    },
    tagline: {
      en: "Compact reasoning/story base, converted into a chat assistant.",
      tr: "Kompakt akil yurutme/hikaye base'i, chat asistanina cevrildi.",
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
      tr: "Istem, eski web-text base'inin birlesik asistan hattina hizalandiktan sonraki temiz adidir.",
    },
    tagline: {
      en: "The web-text branch, aligned for assistant answers.",
      tr: "Web-text hatti, asistan yanitlari icin hizalanmis.",
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
      tr: "Bumin Mini, ilk kucuk pipeline kaniti modelini korur ama onu durustce kompakt smoke uye olarak adlandirir.",
    },
    tagline: {
      en: "Tiny smoke assistant for fast local checks.",
      tr: "Hizli yerel kontroller icin mini smoke asistani.",
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
      tr: "Kashgar, imported/open-base slotudur; yerel agirliklar arsivlenip servis edilince secilebilir olur.",
    },
    tagline: {
      en: "Imported reference slot, not live until weights are archived.",
      tr: "Imported referans slotu; agirliklar arsivlenene kadar live degil.",
    },
    goodFor: {
      en: "Reference imported model slot. It is shown for lineage clarity but is not live until a runnable checkpoint exists.",
      tr: "Referans imported model slotu. Soy agaci netligi icin gosterilir, calisan checkpoint olana kadar live degildir.",
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
