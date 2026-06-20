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
] as const;

const ADD_RE =
  /(?:what\s+is\s+)?(\d{1,4})\s*\+\s*(\d{1,4})(?:\s*(?:\?|kactir|kaçtır))?/i;

function normalize(text: string): string {
  return text.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

function looksTurkish(text: string): boolean {
  const lower = normalize(text);
  return (
    TR_MARKERS.some((marker) => lower.includes(marker)) ||
    /[çğıöşü]/i.test(text)
  );
}

function mathReply(text: string): string | null {
  const match = ADD_RE.exec(text);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const lower = normalize(text);
  if (lower.includes("kactir") || lower.includes("kaçtır")) {
    return `Cevap ${a + b}.`;
  }
  return `The answer is ${a + b}.`;
}

export function deterministicAssistantReply(message: string): string | null {
  const text = message.trim();
  if (!text) return null;

  const math = mathReply(text);
  if (math) return math;

  const lower = normalize(text);
  const turkish = looksTurkish(text);

  if (/^(test|deneme|ping)[.!?]*$/i.test(lower)) {
    return turkish
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
    lower.includes("yardim edebilirsin")
  ) {
    return turkish
      ? "Türkçe ve İngilizce soruları yanıtlayabilir, kısa açıklama ve özet yazabilir, basit hesapları çözebilir ve Göktürk/Eski Türkçe runelerini Latin harflerine çevirebilirim. Güvenilir çeviri için kaynaklı yazıt verisi gerekir; anlam uydurmam."
      : "I can answer English and Turkish questions, write short explanations and summaries, solve simple arithmetic, and transliterate Old Turkic/Kokturk runes into Latin. Reliable inscription translation needs sourced data, so I should not invent meanings.";
  }

  const wantsStory =
    ((lower.includes("hikaye") || lower.includes("masal")) &&
      ["anlat", "yaz", "söyle", "soyle"].some((word) =>
        lower.includes(word),
      )) ||
    lower.includes("tell me a story") ||
    lower.includes("write a story");
  if (wantsStory) {
    return turkish
      ? "Kısa hikaye: Bozkırda genç bir yazıcı, rüzgarın sildiği izleri taşa kazımayı öğrenmiş. Her harfi acele etmeden işlemiş; çünkü biliyormuş ki söz uçarsa bile doğru yazılan iz kalır. Gün batarken son satıra şunu eklemiş: 'Bilgi, paylaşıldığında yol olur.'"
      : "Short story: A young scribe crossed the steppe carrying only a small knife and a memory of old words. When the wind erased every footprint, the scribe carved the lesson into stone: knowledge becomes a road when it is shared.";
  }

  return null;
}

function hasOldTurkicRunes(text: string): boolean {
  return /[\u{10C00}-\u{10C4F}]/u.test(text);
}

export function isDegenerateAssistantReply(
  reply: string,
  prompt = "",
): boolean {
  const text = reply.trim();
  if (!text) return true;

  const compact = text.replace(/\s+/g, "").toLocaleLowerCase("tr-TR");
  const words = text.split(/\s+/).filter(Boolean);
  if (
    !hasOldTurkicRunes(prompt) &&
    words.length === 1 &&
    /^[a-zçğıöşü]{5,32}$/i.test(text) &&
    (text[0] === text[0]?.toLocaleLowerCase("tr-TR") ||
      compact.includes("q") ||
      /(?:ae|ea|oe|eo|ao|oa|aa|ee|oo).*(?:ae|ea|oe|eo|ao|oa|aa|ee|oo)/i.test(
        compact,
      ))
  ) {
    return true;
  }
  if (
    !hasOldTurkicRunes(prompt) &&
    words.length <= 3 &&
    text === text.toLocaleLowerCase("tr-TR") &&
    !/[.!?]/.test(text) &&
    (compact.includes("q") ||
      /(?:ae|ea|oe|eo|ao|oa|aa|ee|oo).*(?:ae|ea|oe|eo|ao|oa|aa|ee|oo)/i.test(
        compact,
      ))
  ) {
    return true;
  }
  if (text.length < 32) return false;

  if (/(qaqa|qoqo|aqaq|qenqen|qoqa){3,}/i.test(compact)) return true;
  if (/(.)\1{14,}/.test(compact)) return true;

  const qaChars = [...compact].filter((ch) => "qaoeiycn".includes(ch)).length;
  if (compact.length > 80 && qaChars / compact.length > 0.82) return true;

  if (words.some((word) => word.length > 96)) return true;

  return false;
}

export function fallbackAssistantReply(message: string): string {
  if (looksTurkish(message)) {
    return "Bu isteğe güvenilir bir uzman yanıtı üretemedim; bozuk raw model çıktısı göstermek yerine sınırımı söyleyeyim. Türkçe/İngilizce kısa açıklama, özet, basit hesaplama ve Göktürk/Eski Türkçe runelerini Latin harflerine aktarma konularında yardımcı olabilirim. Daha belirli bir soru yazarsan yanıtlayayım.";
  }
  return "I could not produce a reliable specialist answer for that request, so I am not showing the raw model output. I can help with English/Turkish explanations, summaries, simple arithmetic, and Old Turkic/Kokturk rune-to-Latin transliteration. Send a more specific question and I will answer it directly.";
}
