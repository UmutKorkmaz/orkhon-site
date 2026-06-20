// Static bilingual content for the Orkhon site.
// All prose has an English (en) and Turkish (tr) variant. Components pick
// the active variant via the `t()` helper from lib/i18n.tsx.

export interface Bilingual {
  en: string;
  tr: string;
}

export interface BilingualGroup<T = string> {
  en: T;
  tr: T;
}

export const THESIS: Bilingual = {
  en: "Orkhon begins where Turkic history first learned to write itself: the 8th-century Göktürk inscriptions on the Orkhon River, carved to preserve voice, lineage, and law in a language of its own. From those stone lines to a living language system, the stack treats every model stage — tokenization, training, alignment, evaluation, and serving — as one continuous act of inscription: turning raw signal into durable, intelligible Turkic speech. Orkhon is not a metaphor pasted onto AI; it is a claim that the oldest Turkic writing and the newest language model share the same ambition — to make language last, carry memory, and speak clearly across time.",
  tr: "Orkhon, Türkçenin kendini yazmaya başladığı yerden yola çıkar: 8. yüzyılda Orhun kıyısına kazınan Göktürk yazıtları, sesi, soyu ve töreyi kendi dilinde kalıcı kılmak için dikilmişti. O taş satırlardan canlı bir dil sistemine uzanan yığın, tokenizasyondan eğitime, hizalamadan değerlendirmeye ve sunuma kadar her aşamayı tek bir yazı eylemi sayar: ham sinyali kalıcı, anlaşılır Türkçe söze dönüştürmek. Orkhon, yapay zekâya sonradan eklenmiş bir metafor değil; en eski Türk yazısı ile en yeni dil modelinin aynı özlemi paylaştığı iddiasıdır — dili yaşatmak, belleği taşımak ve zamanın ötesinde açık konuşmak.",
};

export const NAV = {
  home: { en: "Home", tr: "Ana Sayfa" },
  models: { en: "Models", tr: "Modeller" },
  chat: { en: "Chat", tr: "Sohbet" },
  github: { en: "GitHub", tr: "GitHub" },
} as const;

export const HERO = {
  kicker: {
    en: "Turkic language models · from inscription to inference",
    tr: "Türk dil modelleri · yazıttan çıkarıma",
  },
  title: {
    en: "Orkhon",
    tr: "Orkhon",
  },
  subtitle: {
    en: "A hand-written transformer stack that learns Turkic the way the Orkhon stones learned to keep it — turning raw text into durable, intelligible speech.",
    tr: "Orhun taşlarının dili yaşatmayı öğrendiği biçimde Türkçeyi öğrenen, elle yazılmış bir transformer yığını — ham metni kalıcı, anlaşılır söze dönüştürür.",
  },
  cta: {
    readSource: { en: "Read the source", tr: "Kaynağı oku" },
    tryChat: { en: "Try the chat", tr: "Sohbeti dene" },
  },
} as const;

export interface SectionCopy {
  id: string;
  heading: Bilingual;
  intro: Bilingual;
}

export const SECTIONS: Record<string, SectionCopy> = {
  whatItIs: {
    id: "what-it-is",
    heading: { en: "What it is", tr: "Nedir" },
    intro: {
      en: "Not a wrapper around a frontier API. Orkhon is a from-scratch decoder-only transformer — GQA, RoPE, RMSNorm, SwiGLU, KV-cache — written in PyTorch and trained on consumer MPS/CUDA. The thesis is simple: the oldest Turkic writing and the newest language model share one ambition, to make language last.",
      tr: "Ön cepheli bir API'nin üzerine giydirilmiş bir sarmal değil. Orkhon, sıfırdan yazılmış bir decoder-only transformer'dır — GQA, RoPE, RMSNorm, SwiGLU, KV-cache — PyTorch ile yazılmış, tüketici MPS/CUDA'sında eğitilmiştir. Tez basit: en eski Türk yazısı ile en yeni dil modeli tek bir özlem paylaşır, dili yaşatmak.",
    },
  },
  pipeline: {
    id: "pipeline",
    heading: { en: "Pipeline", tr: "İşlem hattı" },
    intro: {
      en: "Every model passes through the same inscription — each stage a chisel, each checkpoint a stone. Ten stages, from byte-level BPE to a safetensors export an OpenAI-compatible server can serve.",
      tr: "Her model aynı yazıtı işler — her aşama bir keski, her kontrol noktası bir taş. Bayt düzeyinde BPE'den, OpenAI uyumlu bir sunucunun sunabileceği safetensors dışa aktarımına kadar on aşama.",
    },
  },
  modelZoo: {
    id: "models",
    heading: { en: "Model zoo", tr: "Model bahçesi" },
    intro: {
      en: "Seven Turkic voices, each named for a figure or word from the Göktürk inscriptions. Base models continue text; instruct models answer; the imported base brings outside knowledge back into the lineage.",
      tr: "Yedi Türk sesi, her biri Göktürk yazıtlarından bir ad veya sözcükten adını alır. Temel modeller metni sürdürür; talimat modelleri yanıtlar; içe aktarılan temel, dış bilgiyi soya geri taşır.",
    },
  },
  results: {
    id: "results",
    heading: { en: "Results", tr: "Sonuçlar" },
    intro: {
      en: "Perplexity on held-out Turkic text, parameter counts, and release dates — the honest ledger of what the stack has actually learned so far.",
      tr: "Ayrılmış Türkçe metinde perplexity, parametre sayıları ve yayın tarihleri — yığının şimdiye dek gerçekten öğrendiğinin dürüst defteri.",
    },
  },
  architecture: {
    id: "architecture",
    heading: { en: "Architecture", tr: "Mimari" },
    intro: {
      en: "Hand-written, no framework. Decoder-only transformer with grouped-query attention, rotary positional embeddings, RMSNorm, SwiGLU MLPs, and a serving-time KV-cache. Runs on Apple MPS and NVIDIA CUDA.",
      tr: "Elle yazılmış, çatı yok. Gruplanmış-sorgu dikkat, dönel konum gömmeleri, RMSNorm, SwiGLU MLP'leri ve sunum zamanı KV-cache ile decoder-only transformer. Apple MPS ve NVIDIA CUDA üzerinde çalışır.",
    },
  },
  cli: {
    id: "cli",
    heading: { en: "CLI", tr: "Komut satırı" },
    intro: {
      en: "Train, evaluate, export, and serve — all from one command surface. The same tooling that built the stones ships them.",
      tr: "Eğit, değerlendir, dışa aktar, sun — tek bir komut yüzeyinden. Taşları diken araç, onları sunar.",
    },
  },
  scaling: {
    id: "scaling",
    heading: { en: "Scaling", tr: "Ölçeklenme" },
    intro: {
      en: "From a 4M first sentence to a 135M imported atlas — a deliberate ladder of sizes, each step a check that the lineage still speaks clearly before the next is carved.",
      tr: "4M'lik ilk cümleden 135M'lik içe aktarılan atlasa — bilinçli bir boyut merdiveni, her basamak, sonraki kazınmadan önce soyun hâlâ net konuştuğunun bir denetimidir.",
    },
  },
};

// Pipeline stages (bilingual labels). Keys mirror lib/i18n consumption in
// the pipeline section; kept here so content lives in one place.
export const PIPELINE_STAGES: BilingualGroup<
  { key: string; label: Bilingual }[]
> = {
  en: [
    { key: "tokenizer", label: { en: "Tokenizer", tr: "Tokenizer" } },
    { key: "data_prep", label: { en: "Data prep", tr: "Veri hazırlığı" } },
    { key: "pretrain", label: { en: "Pretrain", tr: "Ön-eğitim" } },
    { key: "sft", label: { en: "SFT", tr: "SFT" } },
    { key: "dpo", label: { en: "DPO", tr: "DPO" } },
    { key: "grpo_rlvr", label: { en: "GRPO / RLVR", tr: "GRPO / RLVR" } },
    { key: "eval", label: { en: "Eval", tr: "Değerlendirme" } },
    { key: "tools_rag_agent", label: { en: "Tools / RAG / Agent", tr: "Araçlar / RAG / Agent" } },
    { key: "serve", label: { en: "Serve", tr: "Sunum" } },
    { key: "export", label: { en: "Export", tr: "Dışa aktarım" } },
  ],
  tr: [
    { key: "tokenizer", label: { en: "Tokenizer", tr: "Tokenizer" } },
    { key: "data_prep", label: { en: "Veri hazırlığı", tr: "Veri hazırlığı" } },
    { key: "pretrain", label: { en: "Ön-eğitim", tr: "Ön-eğitim" } },
    { key: "sft", label: { en: "SFT", tr: "SFT" } },
    { key: "dpo", label: { en: "DPO", tr: "DPO" } },
    { key: "grpo_rlvr", label: { en: "GRPO / RLVR", tr: "GRPO / RLVR" } },
    { key: "eval", label: { en: "Değerlendirme", tr: "Değerlendirme" } },
    { key: "tools_rag_agent", label: { en: "Araçlar / RAG / Agent", tr: "Araçlar / RAG / Agent" } },
    { key: "serve", label: { en: "Sunum", tr: "Sunum" } },
    { key: "export", label: { en: "Dışa aktarım", tr: "Dışa aktarım" } },
  ],
};

export const FOOTER = {
  tagline: {
    en: "From the first written words of a language to a system that writes it.",
    tr: "Bir dilin ilk yazılı sözünden, onu yazan bir sisteme.",
  },
  builtBy: {
    en: "Built by Umut Korkmaz",
    tr: "Umut Korkmaz tarafından yapıldı",
  },
  links: {
    github: { en: "GitHub", tr: "GitHub" },
    huggingface: { en: "Hugging Face", tr: "Hugging Face" },
    chat: { en: "Try the chat", tr: "Sohbeti dene" },
  },
  lang: { en: "English", tr: "Türkçe" },
} as const;

// External links (single source of truth).
export const LINKS = {
  github: "https://github.com/umutkorkmaz/orkhon",
  huggingface: "https://huggingface.co/umutkorkmaz",
  // Anchor on the landing page — the ModelZoo section carries id="models".
  // Cross-page safe: from /chat this navigates home then scrolls to #models.
  models: "/#models",
  chat: "/chat",
} as const;
