import type { Bilingual } from "@/lib/models";

export interface ModelLabPrompt {
  id: string;
  title: Bilingual;
  body: Bilingual;
}

export interface ModelLabProfile {
  modelId: string;
  focus: Bilingual;
  workflow: Bilingual[];
  checks: Bilingual[];
  prompts: ModelLabPrompt[];
}

const COMMON_CHECKS: Bilingual[] = [
  {
    en: "Ask for both a direct answer and the reasoning path so you can inspect drift.",
    tr: "Hem doğrudan yanıtı hem de akıl yürütme yolunu iste; sapmayı görebilirsin.",
  },
  {
    en: "If the answer becomes story-like, retry with a stricter format requirement.",
    tr: "Yanıt hikayeye kayarsa daha sıkı bir çıktı biçimiyle yeniden dene.",
  },
];

export const MODEL_LABS: Record<string, ModelLabProfile> = {
  tangri: {
    modelId: "tangri",
    focus: {
      en: "Default unified assistant for Turkish, English, and Kokturk transliteration tasks.",
      tr: "Türkçe, İngilizce ve Köktürk transliterasyon görevleri için varsayılan birleşik asistan.",
    },
    workflow: [
      {
        en: "Use it first when you need the most capable public Orkhon answer.",
        tr: "En güçlü public Orkhon yanıtını istediğinde önce bunu kullan.",
      },
      {
        en: "Mix explanation, translation, and transliteration in a single prompt.",
        tr: "Açıklama, çeviri ve transliterasyonu tek promptta karıştırabilirsin.",
      },
    ],
    checks: [
      ...COMMON_CHECKS,
      {
        en: "For transliteration, include the source script and ask for Latin output in a table.",
        tr: "Transliterasyon için kaynak yazıyı ekle ve Latin çıktıyı tablo halinde iste.",
      },
    ],
    prompts: [
      {
        id: "tangri-transliterate",
        title: { en: "Rune transliteration lab", tr: "Runik transliterasyon laboratuvarı" },
        body: {
          en: "Transliterate this Old Turkic sample into Latin, then explain each token in modern Turkish: 𐱅𐰭𐰼𐰃 𐰋𐰃𐰠𐰏𐰀",
          tr: "Bu Eski Türkçe örneği Latin harflerine translitere et, sonra her tokenı günümüz Türkçesiyle açıkla: 𐱅𐰭𐰼𐰃 𐰋𐰃𐰠𐰏𐰀",
        },
      },
      {
        id: "tangri-compare",
        title: { en: "Modern vs inscription", tr: "Modern dil ve yazıt karşılaştırması" },
        body: {
          en: "Compare this modern Turkish sentence with how an Old Turkic inscription-style phrasing might differ. Keep it concise and label assumptions: Dil belleği taşır.",
          tr: "Bu modern Türkçe cümleyi Eski Türkçe yazıt üslubuyla nasıl farklılaşabileceği açısından karşılaştır. Kısa tut ve varsayımları etiketle: Dil belleği taşır.",
        },
      },
      {
        id: "tangri-teach",
        title: { en: "Teach the pipeline", tr: "İşlem hattını öğret" },
        body: {
          en: "Explain the Orkhon model pipeline to a technical founder in 6 bullets: tokenizer, pretrain, SFT, DPO, eval, serving.",
          tr: "Orkhon model hattını teknik bir kurucuya 6 maddede açıkla: tokenizer, pretrain, SFT, DPO, eval, serving.",
        },
      },
    ],
  },
  bunghu: {
    modelId: "bunghu",
    focus: {
      en: "Bilingual assistant branch for Turkish-English switching and compact explanations.",
      tr: "Türkçe-İngilizce geçiş ve kompakt açıklamalar için iki dilli asistan hattı.",
    },
    workflow: [
      {
        en: "Give it bilingual source text and ask for paired output.",
        tr: "İki dilli kaynak metin ver ve eşlenmiş çıktı iste.",
      },
      {
        en: "Keep tasks short when you want reliable format adherence.",
        tr: "Biçime bağlılık istiyorsan görevleri kısa tut.",
      },
    ],
    checks: [
      ...COMMON_CHECKS,
      {
        en: "Ask it to mark language switches explicitly when evaluating bilingual behavior.",
        tr: "İki dilli davranışı değerlendirirken dil geçişlerini açıkça işaretlemesini iste.",
      },
    ],
    prompts: [
      {
        id: "bunghu-paired",
        title: { en: "Paired EN/TR answer", tr: "Eşlenmiş EN/TR yanıt" },
        body: {
          en: "Answer in two columns, English and Turkish. Topic: why a byte-level tokenizer helps a Turkic language model.",
          tr: "İki sütunda yanıtla: İngilizce ve Türkçe. Konu: byte-level tokenizer neden bir Türk dili modeli için yararlıdır.",
        },
      },
      {
        id: "bunghu-summary",
        title: { en: "Bilingual summary", tr: "İki dilli özet" },
        body: {
          en: "Summarize this in English, then rewrite it in natural Turkish: Orkhon treats training and serving as one continuous act of inscription.",
          tr: "Bunu önce İngilizce özetle, sonra doğal Türkçeyle yeniden yaz: Orkhon treats training and serving as one continuous act of inscription.",
        },
      },
      {
        id: "bunghu-glossary",
        title: { en: "Mini glossary", tr: "Mini sözlük" },
        body: {
          en: "Create a 6-row glossary for these terms in English and Turkish: RoPE, GQA, KV-cache, SFT, DPO, eval.",
          tr: "Şu terimler için İngilizce ve Türkçe 6 satırlık sözlük oluştur: RoPE, GQA, KV-cache, SFT, DPO, eval.",
        },
      },
    ],
  },
  tegin: {
    modelId: "tegin",
    focus: {
      en: "Compact story-instruction branch retrained toward direct assistant answers.",
      tr: "Doğrudan asistan yanıtlarına çekilmiş kompakt hikaye-talimat hattı.",
    },
    workflow: [
      {
        en: "Use it for short, bounded style checks and instruction-following probes.",
        tr: "Kısa, sınırları net stil ve talimat izleme testlerinde kullan.",
      },
      {
        en: "Prefer numbered formats so the model has an obvious structure to follow.",
        tr: "Modelin izleyeceği açık yapı için numaralı formatları tercih et.",
      },
    ],
    checks: [
      ...COMMON_CHECKS,
      {
        en: "Check whether it answers directly instead of continuing into a fictional scene.",
        tr: "Kurgusal sahneye kaymak yerine doğrudan yanıt verip vermediğini kontrol et.",
      },
    ],
    prompts: [
      {
        id: "tegin-direct",
        title: { en: "Directness test", tr: "Doğrudanlık testi" },
        body: {
          en: "Answer directly in exactly 5 bullets. Question: what makes Orkhon different from an API wrapper?",
          tr: "Tam olarak 5 maddeyle doğrudan yanıtla. Soru: Orkhon'u API sarmalından farklı yapan nedir?",
        },
      },
      {
        id: "tegin-style",
        title: { en: "Style control", tr: "Stil kontrolü" },
        body: {
          en: "Rewrite this in a technical, non-story style: The stones remembered the voice and the model learned to answer.",
          tr: "Bunu teknik, hikaye olmayan bir üslupla yeniden yaz: Taşlar sesi hatırladı ve model yanıtlamayı öğrendi.",
        },
      },
      {
        id: "tegin-rubric",
        title: { en: "Rubric answer", tr: "Rubrik yanıtı" },
        body: {
          en: "Score the sentence below for clarity, grounding, and usefulness. Return a 3-row table. Sentence: Orkhon is a living inscription stack.",
          tr: "Aşağıdaki cümleyi açıklık, dayanak ve fayda açısından puanla. 3 satırlık tablo döndür. Cümle: Orkhon yaşayan bir yazıt yığınıdır.",
        },
      },
    ],
  },
  tonyuk: {
    modelId: "tonyuk",
    focus: {
      en: "Compact reasoning branch for small explanation and planning tasks.",
      tr: "Küçük açıklama ve planlama işleri için kompakt akıl yürütme hattı.",
    },
    workflow: [
      {
        en: "Ask for a short plan, then ask it to critique the plan.",
        tr: "Kısa plan iste, sonra planı eleştirmesini iste.",
      },
      {
        en: "Keep examples small so the compact model can preserve the full context.",
        tr: "Kompakt modelin bağlamı koruması için örnekleri küçük tut.",
      },
    ],
    checks: [
      ...COMMON_CHECKS,
      {
        en: "Look for missing assumptions in reasoning-heavy answers.",
        tr: "Akıl yürütme yoğun cevaplarda eksik varsayımları ara.",
      },
    ],
    prompts: [
      {
        id: "tonyuk-plan",
        title: { en: "Three-step plan", tr: "Üç adımlı plan" },
        body: {
          en: "Make a 3-step plan to evaluate a tiny Turkic language model. Include one metric, one qualitative test, and one failure mode.",
          tr: "Küçük bir Türk dili modelini değerlendirmek için 3 adımlı plan yap. Bir metrik, bir nitel test ve bir hata biçimi ekle.",
        },
      },
      {
        id: "tonyuk-critique",
        title: { en: "Critique a claim", tr: "Bir iddiayı eleştir" },
        body: {
          en: "Critique this claim in 4 bullets and label each bullet as evidence, risk, or next test: A 22M model is enough for public Orkhon demos.",
          tr: "Bu iddiayı 4 maddede eleştir ve her maddeyi kanıt, risk veya sonraki test olarak etiketle: 22M model public Orkhon demoları için yeterlidir.",
        },
      },
      {
        id: "tonyuk-trace",
        title: { en: "Reasoning trace", tr: "Akıl yürütme izi" },
        body: {
          en: "Think through whether a model selector should expose upcoming models. Give a concise recommendation and one caveat.",
          tr: "Model seçicinin yakındaki modelleri gösterip göstermemesi gerektiğini düşün. Kısa bir öneri ve bir çekince ver.",
        },
      },
    ],
  },
  istem: {
    modelId: "istem",
    focus: {
      en: "Web-text branch aligned for extraction, rewriting, and structured summaries.",
      tr: "Çıkarma, yeniden yazma ve yapılandırılmış özetler için hizalanmış web-text hattı.",
    },
    workflow: [
      {
        en: "Paste a short source and ask for extraction into a schema.",
        tr: "Kısa bir kaynak yapıştır ve şemaya çıkarım iste.",
      },
      {
        en: "Use it when the task looks like digesting documentation or release notes.",
        tr: "Görev doküman veya sürüm notu sindirmeye benziyorsa bunu kullan.",
      },
    ],
    checks: [
      ...COMMON_CHECKS,
      {
        en: "Confirm extracted facts are copied from the source and not inferred.",
        tr: "Çıkarılan bilgilerin kaynaktan alındığını, uydurulmadığını doğrula.",
      },
    ],
    prompts: [
      {
        id: "istem-extract",
        title: { en: "Extract release notes", tr: "Sürüm notu çıkar" },
        body: {
          en: "Extract this into JSON with keys model, size, capability, risk: Tangri is a 100M unified assistant for EN, TR, and Kokturk transliteration. It may still drift on long prompts.",
          tr: "Bunu model, size, capability, risk anahtarlarıyla JSON'a çıkar: Tangri is a 100M unified assistant for EN, TR, and Kokturk transliteration. It may still drift on long prompts.",
        },
      },
      {
        id: "istem-doc",
        title: { en: "Docs digest", tr: "Doküman özeti" },
        body: {
          en: "Turn this paragraph into a short docs note with title, summary, and usage: Orkhon exposes model selection so visitors can test each live family member directly.",
          tr: "Bu paragrafı başlık, özet ve kullanım alanı içeren kısa doküman notuna çevir: Orkhon exposes model selection so visitors can test each live family member directly.",
        },
      },
      {
        id: "istem-table",
        title: { en: "Structured table", tr: "Yapılandırılmış tablo" },
        body: {
          en: "Create a markdown table comparing tokenizer, SFT, DPO, eval, and serving. Columns: stage, purpose, artifact.",
          tr: "Tokenizer, SFT, DPO, eval ve serving aşamalarını karşılaştıran markdown tablo oluştur. Sütunlar: stage, purpose, artifact.",
        },
      },
    ],
  },
  "bumin-mini": {
    modelId: "bumin-mini",
    focus: {
      en: "Tiny smoke assistant for fast checks that the serving path and chat format work.",
      tr: "Sunum yolu ve sohbet formatının çalıştığını hızlı kontrol eden mini smoke asistanı.",
    },
    workflow: [
      {
        en: "Use it for very short prompts before trying larger models.",
        tr: "Daha büyük modellere geçmeden önce çok kısa promptlarla kullan.",
      },
      {
        en: "Treat it as a pipeline probe, not a quality benchmark.",
        tr: "Bunu kalite ölçütü değil, pipeline sondası olarak gör.",
      },
    ],
    checks: [
      {
        en: "Confirm the backend returns a non-empty assistant message.",
        tr: "Backend'in boş olmayan bir asistan mesajı döndürdüğünü doğrula.",
      },
      {
        en: "Check whether the response follows a simple one-line constraint.",
        tr: "Yanıtın basit tek satır kısıtına uyup uymadığını kontrol et.",
      },
    ],
    prompts: [
      {
        id: "bumin-mini-smoke",
        title: { en: "One-line smoke", tr: "Tek satır smoke testi" },
        body: {
          en: "Reply in one sentence: what is Orkhon?",
          tr: "Tek cümleyle yanıtla: Orkhon nedir?",
        },
      },
      {
        id: "bumin-mini-format",
        title: { en: "Format probe", tr: "Format sondası" },
        body: {
          en: "Return exactly three words that describe the Orkhon project.",
          tr: "Orkhon projesini anlatan tam olarak üç kelime döndür.",
        },
      },
      {
        id: "bumin-mini-bilingual",
        title: { en: "Tiny bilingual check", tr: "Mini iki dilli kontrol" },
        body: {
          en: "Say hello in English and Turkish, one line each.",
          tr: "İngilizce ve Türkçe merhaba de, her dil için bir satır.",
        },
      },
    ],
  },
  kashgar: {
    modelId: "kashgar",
    focus: {
      en: "Imported reference slot. It is visible for lineage clarity but not selectable until weights are served.",
      tr: "İçe aktarılan referans slotu. Soy ağacı netliği için görünür; ağırlıklar sunulmadan seçilemez.",
    },
    workflow: [
      {
        en: "Use the visible notes to understand the planned open-base comparison.",
        tr: "Planlanan açık temel karşılaştırmayı anlamak için görünür notları kullan.",
      },
      {
        en: "Select a live model for actual requests.",
        tr: "Gerçek istekler için canlı bir model seç.",
      },
    ],
    checks: [
      {
        en: "Do not treat Kashgar as live until the model selector enables it.",
        tr: "Model seçici etkinleştirmeden Kashgar'ı canlı kabul etme.",
      },
    ],
    prompts: [
      {
        id: "kashgar-compare",
        title: { en: "Comparison prompt", tr: "Karşılaştırma promptu" },
        body: {
          en: "When Kashgar is live, compare its answer with Tangri on this task: explain why imported open bases are useful reference points.",
          tr: "Kashgar canlı olduğunda bu görevde yanıtını Tangri ile karşılaştır: imported open base'ler neden yararlı referans noktalarıdır?",
        },
      },
    ],
  },
};

export function getModelLabProfile(modelId: string): ModelLabProfile {
  return MODEL_LABS[modelId] ?? MODEL_LABS.tangri;
}
