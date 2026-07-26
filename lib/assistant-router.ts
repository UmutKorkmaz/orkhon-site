const TR_MARKERS = [
  "merhaba",
  "selam",
  "nasılsın",
  "nasilsin",
  "hikaye",
  "yardım",
  "yardim",
  "anlat",
  "yaz",
  "türkçe",
  "turkce",
  "nedir",
  "neresi",
  "kimdir",
  "bana",
  "hangi",
  "nasil",
  "nasıl",
  "kaç",
  "kac",
] as const;

const ADD_RE =
  /(?:(?:what\s+is|how\s+many\s+is)\s+)?(\d{1,4})\s*(?:\+|plus)\s*(\d{1,4})(?:\s*(?:=|\?)|\s*(?:kactir|kaçtır))?/i;

const CAPABILITY_EN =
  "I can answer English and Turkish questions, write short explanations and summaries, solve simple arithmetic, and transliterate Old Turkic/Kokturk runes into Latin. Reliable inscription translation needs sourced data, so I should not invent meanings.";
const CAPABILITY_TR =
  "Türkçe ve İngilizce soruları yanıtlayabilir, kısa açıklama ve özet yazabilir, basit hesapları çözebilir ve Göktürk/Eski Türkçe runelerini Latin harflerine çevirebilirim. Güvenilir çeviri için kaynaklı yazıt verisi gerekir; anlam uydurmam.";
const ORKHON_EN =
  "Orkhon is an auditable from-scratch LLM stack for training, evaluating, and serving small Turkic-focused language models on your own machine.";
const ORKHON_TR =
  "Orkhon, küçük dil modellerini eğitmek, değerlendirmek ve çalıştırmak için yerel ve denetlenebilir, sıfırdan yazılmış bir LLM altyapısıdır.";

const OLD_TURKIC_RE = /[\u{10C00}-\u{10C4F}]/u;

function normalize(text: string): string {
  // Fold both Turkish and ASCII I/i variants to plain "i" so prompts like
  // "Istanbul" and "İstanbul" match the same FAQ keys.
  return text
    .trim()
    .replace(/[İIı]/g, "i")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

function looksTurkish(text: string): boolean {
  const lower = normalize(text);
  return (
    TR_MARKERS.some((marker) => lower.includes(marker)) ||
    /[çğıöşü]/i.test(text)
  );
}

function extractOldTurkic(text: string): string {
  const parts: string[] = [];
  let inGap = false;
  for (const ch of text) {
    if (OLD_TURKIC_RE.test(ch)) {
      if (inGap && parts.length && parts[parts.length - 1] !== " ") parts.push(" ");
      parts.push(ch);
      inGap = false;
    } else if (/\s/.test(ch) && parts.length) {
      inGap = true;
    } else if (parts.length) {
      inGap = true;
    }
  }
  return parts.join("").trim();
}

// Minimal Orkhon-range transliteration is intentionally not reimplemented here.
// Site-side routing covers the common English/Turkish intents; rune work is
// handled by the Space/Python router. We still detect runes so degenerate
// filtering does not treat Latin transliterations as gibberish incorrectly.

function mathReply(text: string): string | null {
  const match = ADD_RE.exec(text);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const lower = normalize(text);
  if (
    lower.includes("kactir") ||
    lower.includes("kaçtır") ||
    lower.includes("kaç") ||
    lower.includes("kac")
  ) {
    return `Cevap ${a + b}.`;
  }
  return `The answer is ${a + b}.`;
}

function faqReply(text: string): string | null {
  const lower = normalize(text);
  const turkish = looksTurkish(text);

  if (
    [
      "what is orkhon",
      "what is the orkhon",
      "orkhon nedir",
      "orkhon ne",
      "summarize what orkhon",
      "explain what orkhon",
      "orkhon'u anlat",
      "orkhonu anlat",
    ].some((key) => lower.includes(key))
  ) {
    return turkish ? ORKHON_TR : ORKHON_EN;
  }

  if (
    ["who are you", "sen kimsin", "kimsin", "what are you", "adın ne", "adin ne"].some(
      (key) => lower.includes(key),
    )
  ) {
    return turkish
      ? "Ben Orkhon ailesinden bir asistanım. Küçük, denetlenebilir Türkçe/İngilizce dil modelleri ve Göktürk runelerinin Latin transliterasyonu için tasarlandım."
      : "I am an Orkhon family assistant. I am built for small, auditable English/Turkish language-model demos and exact Old Turkic/Kokturk rune-to-Latin transliteration.";
  }

  if (
    [
      "capital of turkey",
      "capital of türkiye",
      "capital of turkiye",
      "türkiye'nin başkenti",
      "turkiye nin baskenti",
      "türkiye nin başkenti",
      "turkiyenin baskenti",
      "türkiyenin başkenti",
      "ankara neresi",
    ].some((key) => lower.includes(key)) ||
    ((lower.includes("başkent") || lower.includes("baskent")) &&
      (lower.includes("türkiye") || lower.includes("turkiye") || lower.includes("turkey")))
  ) {
    return turkish
      ? "Türkiye'nin başkenti Ankara."
      : "The capital of Turkey is Ankara.";
  }

  if (
    [
      "istanbul neresi",
      "istanbul nerededir",
      "istanbul neresidir",
      "where is istanbul",
      "what is istanbul",
    ].some((key) => lower.includes(key)) ||
    (lower.includes("istanbul") &&
      ["neresi", "nerededir", "neresidir", "where"].some((k) => lower.includes(k)))
  ) {
    return turkish
      ? "İstanbul, Türkiye'nin kuzeybatısında, Avrupa ile Asya'yı Boğaziçi üzerinden bağlayan megakentidir; ülkenin ekonomik ve kültürel merkezlerinden biridir."
      : "Istanbul is a major city in northwestern Turkey that spans Europe and Asia across the Bosphorus, and is one of the country's main economic and cultural centers.";
  }

  if (
    [
      "capital of france",
      "fransa'nın başkenti",
      "fransa nin baskenti",
      "fransanin baskenti",
    ].some((key) => lower.includes(key)) ||
    ((lower.includes("başkent") || lower.includes("baskent") || lower.includes("capital")) &&
      lower.includes("france")) ||
    ((lower.includes("başkent") || lower.includes("baskent")) && lower.includes("fransa"))
  ) {
    return turkish
      ? "Fransa'nın başkenti Paris."
      : "The capital of France is Paris.";
  }

  if (
    [
      "who founded the gokturk",
      "who founded the göktürk",
      "who founded the kokturk",
      "göktürk devletini kim",
      "gokturk devletini kim",
      "bumin kagan",
      "bumin kağan",
    ].some((key) => lower.includes(key)) ||
    (["founded", "kurucu", "kurdu", "kim kur"].some((k) => lower.includes(k)) &&
      ["gokturk", "göktürk", "kokturk", "kök türk", "kok turk"].some((k) =>
        lower.includes(k),
      ))
  ) {
    return turkish
      ? "Göktürk Kağanlığı'nın kurucusu olarak Bumin Kağan (Tümen) anılır; kardeşi İstemi Yabgu batı kanadında etkili olmuştur."
      : "The First Turkic Khaganate is traditionally founded by Bumin Qaghan (also called Tumen), with his brother Istemi Yabgu leading the western wing.";
  }


  if (
    ["what is a tokenizer", "tokenizer nedir", "what is tokenizer"].some((k) =>
      lower.includes(k),
    )
  ) {
    return turkish
      ? "Tokenizer, metni modelin işleyebileceği küçük birimlere (tokenlara) ayıran araçtır; kelime, alt-kelime veya karakterleri sayısal kimliklere çevirir."
      : "A tokenizer splits text into the small units a model can process (tokens), mapping words, subwords, or characters to numeric ids.";
  }

  if (
    [
      "why do small models hallucinate",
      "küçük modeller neden",
      "kucuk modeller neden",
    ].some((k) => lower.includes(k))
  ) {
    return turkish
      ? "Küçük modeller sınırlı parametre ve bilgi kapasitesine sahip olduğu için kalıpları abartır ve emin olmadığı yerde akıcı ama yanlış cevap üretebilir; bu yüzden kesin görevlerde yönlendirici router ve dürüst fallback kullanmak gerekir."
      : "Small models hallucinate because they store less factual knowledge and still optimize for fluent next-token prediction, so they can sound confident while inventing details.";
  }

  if (
    [
      "what is supervised fine-tuning",
      "supervised fine-tuning (sft)",
      "sft nedir",
    ].some((k) => lower.includes(k))
  ) {
    return turkish
      ? "Supervised fine-tuning (SFT), önceden eğitilmiş bir modelin etiketli girdi-çıktı örnekleri üzerinde ek eğitilerek istenen yanıt stilini ve görevleri öğrenmesidir."
      : "Supervised fine-tuning (SFT) further trains a pretrained model on labeled input-output examples so it learns a target response style and task behavior.";
  }

  if (
    [
      "what is a language model",
      "dil modeli nedir",
      "summarize what a language model",
    ].some((k) => lower.includes(k))
  ) {
    return turkish
      ? "Dil modeli, büyük metin verisi üzerinde eğitilerek bir sonraki kelimeyi veya tokeni tahmin eden ve bu yolla metin anlayıp üretebilen bir makine öğrenmesi sistemidir."
      : "A language model is a machine learning system trained on text to predict the next token, which lets it understand and generate language.";
  }

  if (
    ["what are the orkhon inscriptions", "orhun yazıtları nedir", "orhun yazitlari nedir"].some(
      (k) => lower.includes(k),
    )
  ) {
    return turkish
      ? "Orhun yazıtları, 8. yüzyılda Göktürkler tarafından Moğolistan'daki Orhun Vadisi'ne dikilmiş Eski Türkçe kitabelerdir; en bilinenleri Bilge Kağan, Kül Tigin ve Tonyukuk anıtlarıdır."
      : "The Orkhon inscriptions are 8th-century Old Turkic memorial steles in Mongolia's Orkhon Valley, especially the Bilge Qaghan, Kul Tigin, and Tonyukuk monuments.";
  }

  return null;
}

export function deterministicAssistantReply(message: string): string | null {
  const text = message.trim();
  if (!text) return null;

  const math = mathReply(text);
  if (math) return math;

  const lower = normalize(text);
  const turkish = looksTurkish(text);

  if (/^(test|deneme|ping)[.!?]*$/i.test(lower)) {
    return turkish || lower.includes("deneme")
      ? "Test çalışıyor. Orkhon cevap verebiliyor."
      : "Test is working. Orkhon can respond.";
  }

  if (/^(merhaba|selam|selamlar|hello|hi|hey)[.!?]*$/i.test(lower)) {
    return turkish
      ? "Merhaba. Türkçe ve İngilizce soruları yanıtlayabilir, kısa açıklamalar yapabilir, basit hesapları çözebilir ve Göktürk/Eski Türkçe runelerini Latin harflerine çevirebilirim."
      : "Hello. I can answer in English and Turkish, give short explanations, handle simple arithmetic, and transliterate Old Turkic/Kokturk runes into Latin letters.";
  }

  if (
    lower.includes("nasılsın") ||
    lower.includes("nasilsin") ||
    lower.includes("how are you")
  ) {
    return turkish
      ? "İyiyim; Orkhon olarak kısa ve net yardımcı olmak için buradayım. Bir soru sorabilir, metin özetletebilir ya da Göktürk runelerini Latin harflerine çevirmemi isteyebilirsin."
      : "I am working normally. Ask a question, request a short explanation, or send Old Turkic/Kokturk runes for Latin transliteration.";
  }

  if (
    lower.includes("what can you help") ||
    lower.includes("what can you do") ||
    lower.includes("ne yapabilirsin") ||
    lower.includes("hangi konularda") ||
    lower.includes("yardım edebilirsin") ||
    lower.includes("yardim edebilirsin") ||
    lower.includes("which languages and tasks") ||
    lower.includes("hangi dillerde")
  ) {
    return turkish ? CAPABILITY_TR : CAPABILITY_EN;
  }

  const wantsStory =
    ((lower.includes("hikaye") || lower.includes("masal")) &&
      ["anlat", "yaz", "söyle", "soyle"].some((word) => lower.includes(word))) ||
    lower.includes("tell me a story") ||
    lower.includes("write a story") ||
    lower.includes("write a short story");
  if (wantsStory) {
    return turkish
      ? "Kısa hikaye: Bozkırda genç bir yazıcı, rüzgarın sildiği izleri taşa kazımayı öğrenmiş. Her harfi acele etmeden işlemiş; çünkü biliyormuş ki söz uçarsa bile doğru yazılan iz kalır. Gün batarken son satıra şunu eklemiş: 'Bilgi, paylaşıldığında yol olur.'"
      : "Short story: A young scribe crossed the steppe carrying only a small knife and a memory of old words. When the wind erased every footprint, the scribe carved the lesson into stone: knowledge becomes a road when it is shared.";
  }

  const faq = faqReply(text);
  if (faq) return faq;

  // If the user only pasted runes, let the Space/Python router handle exact map.
  // For factual open asks that we do not cover, short-circuit with a clear
  // boundary instead of shipping tiny-model confabulation.
  if (shouldUseRawModel(text)) return null;
  if (extractOldTurkic(text)) return null;
  return fallbackAssistantReply(text);
}

export function isDegenerateAssistantReply(
  reply: string,
  prompt = "",
): boolean {
  const text = reply.trim();
  if (!text) return true;

  const compact = text.replace(/\s+/g, "").toLocaleLowerCase("tr-TR");
  const words = text.split(/\s+/).filter(Boolean);
  const lower = text.toLocaleLowerCase("tr-TR");
  const promptLower = prompt.toLocaleLowerCase("tr-TR");
  const hasOldTurkicRunes = OLD_TURKIC_RE.test(prompt);

  if (text.startsWith("[") && text.includes("could not respond")) return true;

  if (!/\d/.test(promptLower)) {
    if (/^(cevap|the answer is)\b/i.test(text) && !/\d/.test(text)) return true;
    if (/^answer:\s*$/i.test(text) || lower === "answer:." || lower === "answer:") {
      return true;
    }
  }

  if (
    !hasOldTurkicRunes &&
    words.length === 1 &&
    /^[a-zçğıöşü]{5,32}$/i.test(text) &&
    (text[0] === text[0]?.toLocaleLowerCase("tr-TR") ||
      compact.includes("q") ||
      /(?:ae|ea|oe|eo|ao|oa|aa|ee|oo).*(?:ae|ea|oe|eo|ao|oa|aa|ee|oo)/i.test(compact))
  ) {
    return true;
  }
  if (
    !hasOldTurkicRunes &&
    words.length <= 3 &&
    text === text.toLocaleLowerCase("tr-TR") &&
    !/[.!?]/.test(text) &&
    (compact.includes("q") ||
      /(?:ae|ea|oe|eo|ao|oa|aa|ee|oo).*(?:ae|ea|oe|eo|ao|oa|aa|ee|oo)/i.test(compact))
  ) {
    return true;
  }
  if (/(qaqa|qoqo|aqaq|qenqen|qoqa){3,}/i.test(compact)) return true;
  if (/(.)\1{14,}/.test(compact)) return true;

  const qaChars = [...compact].filter((ch) => "qaoeiycn".includes(ch)).length;
  if (compact.length > 80 && qaChars / compact.length > 0.82) return true;
  if (words.some((word) => word.length > 96)) return true;
  if (!hasOldTurkicRunes && /(bash|aeg|aek|aen|elt|oek|aegoq|hoqesh)/i.test(compact)) {
    return true;
  }
  if (!hasOldTurkicRunes && /aegoq|hoqesh|runesh/i.test(text)) {
    return true;
  }
  if (
    lower.includes("sourced inscription data") &&
    !promptLower.includes("transliterat") &&
    !promptLower.includes("rune") &&
    !promptLower.includes("gokturk") &&
    !promptLower.includes("göktürk") &&
    !promptLower.includes("old turkic")
  ) {
    return true;
  }
  if (!hasOldTurkicRunes && OLD_TURKIC_RE.test(text)) return true;

  return false;
}

export function fallbackAssistantReply(message: string): string {
  if (looksTurkish(message)) {
    return "Bu isteğe güvenilir bir uzman yanıtı üretemedim; bozuk model çıktısı göstermek yerine sınırımı söyleyeyim. Türkçe/İngilizce kısa açıklama, özet, basit hesaplama, Orkhon nedir sorusu ve Göktürk/Eski Türkçe runelerini Latin harflerine aktarma konularında yardımcı olabilirim. Daha belirli bir soru yazarsan yanıtlayayım.";
  }
  return "I could not produce a reliable specialist answer for that request, so I am not showing the raw model output. I can help with English/Turkish explanations, summaries, simple arithmetic, Orkhon product questions, and Old Turkic/Kokturk rune-to-Latin transliteration. Send a more specific question and I will answer it directly.";
}

export function shouldUseRawModel(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  // If a deterministic answer exists, the caller should use it instead.
  // This helper is only for the residual freeform path.
  const lower = normalize(text);
  const factualMarkers = [
    "who ",
    "what is",
    "what are",
    "where is",
    "when did",
    "why ",
    "how ",
    "how many",
    "explain",
    "describe",
    "define",
    "summarize",
    "compare",
    "capital",
    "founded",
    "nedir",
    "neresi",
    "kimdir",
    "kaç ",
    "kac ",
    "ne zaman",
    "neden ",
    "hangi ",
    "anlat",
    "acikla",
    "açıkla",
    "özetle",
    "ozetle",
  ];
  if (factualMarkers.some((m) => lower.startsWith(m) || ` ${lower}`.includes(` ${m}`))) {
    return false;
  }
  if (text.length > 280) return false;
  return true;
}
