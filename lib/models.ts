// Orkhon model registry — authoritative source of truth for the model zoo.
// Params/metrics/dates are the embedded facts; prose (lineage/tagline/goodFor)
// is derived from the Göktürk-themed writing each model is named after.

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

/** Human-readable labels for each model kind. */
export const KIND_LABEL: Record<ModelKind, string> = {
  base: "Base / text continuation",
  instruct: "Instruct / chat-tuned",
  imported: "Imported open base",
};

export const MODELS: Model[] = [
  {
    id: "bengu",
    codename: "Bengü",
    kind: "base",
    params: "57M",
    metric: "ppl 47.1",
    date: "2026-06-15",
    lineage: {
      en: "Bengü is an Old Turkic word and name meaning eternal, everlasting, without end — the wish carved into blessings, titles, and the hope that speech outlasts the speaker. On the Orkhon stones, permanence is not vanity but duty. Bengü names the enduring base: weights and representations meant to hold meaning across training runs, versions, and time.",
      tr: "Bengü, sonsuz, ebedi, bitmeyen anlamına gelen Eski Türkçe bir sözcük ve addır — yazıtlara, unvanlara ve sözün konuşanından uzun yaşama dileğine kazınmış bir arzu. Orhun taşlarında kalıcılık kibir değil, görevdir. Bengü, eğitim koşuları, sürümler ve zaman boyunca anlamı taşımak için tasarlanmış ağırlıkları ve temsilleri adlandıran kalıcı temeldir.",
    },
    tagline: {
      en: "The enduring base — meaning built to last across runs and time.",
      tr: "Kalıcı temel — koşular ve zaman boyunca yaşatılan anlam.",
    },
    goodFor: {
      en: "Base model: continues text from a prompt. Raw language model trained on Turkic text; the foundation every other voice is tuned from.",
      tr: "Temel model: verilen bir metni sürdürür. Türkçe metinle eğitilmiş ham dil modeli; diğer tüm seslerin incelediği temel.",
    },
  },
  {
    id: "bengu-gokturk",
    codename: "Bengü Göktürk",
    kind: "instruct",
    params: "57M",
    metric: "",
    date: "2026-06-15",
    lineage: {
      en: "Bengü Göktürk is the instruction-tuned heir to that permanence: a model shaped not only to speak Turkic but to answer, obey, and serve the Göktürk spirit of direct, dignified, inscription-grade prose. Where Bengü endures, Bengü Göktürk applies — eternal language made responsive. It is Orkhon that listens, then writes back.",
      tr: "Bengü Göktürk, bu kalıcılığın talimatla inceltilmiş varisidir: yalnızca Türkçe konuşmak için değil, Göktürk'ün doğrudan, onurlu, yazıt düzeyindeki anlatı ruhuna yanıt vermek, ona uymak ve ona hizmet etmek için biçimlenmiş bir model. Bengü yaşatır; Bengü Göktürk uygular — ebedi dil, duyarlı hale getirilmiştir. Dinleyen, sonra yazan Orkhon budur.",
    },
    tagline: {
      en: "Endurance made responsive — the eternal voice that answers back.",
      tr: "Duyarlı kılınmış kalıcılık — yanıt veren ebedi ses.",
    },
    goodFor: {
      en: "Instruct model: follows chat-style instructions and system prompts. Bengü's weights tuned to answer, obey, and serve in dignified Turkic prose.",
      tr: "Talimat modeli: sohbet biçimli talimatları ve sistem komutlarını izler. Bengü ağırlıkları, onurlu Türkçe düzende yanıtlamak, uymak ve hizmet etmek için inceltilmiştir.",
    },
  },
  {
    id: "bumin",
    codename: "Bumin",
    kind: "instruct",
    params: "4M",
    metric: "ppl 5.1",
    date: "2026-06-14",
    lineage: {
      en: "Bumin Khagan — İllig Qaghan — shattered the Rouran yoke in 552 and founded the Göktürk Khaganate, the first Turkic empire to write its own power into history. He did not inherit a throne; he forged one from alliance, rebellion, and nerve. Bumin names the foundation model: the first coherent Turkic voice the stack learns to speak.",
      tr: "Bumin Kağan — İllig Kağan — 552'de Juan yükünü kırarak Göktürk Kağanlığı'nı, tarihe kendi gücünü yazan ilk Türk imparatorluğunu kurdu. Tahtı miras almadı; ittifak, isyan ve cesaretle dövdü. Bumin, yığının temel modelini adlandırır: sistemin konuşmayı öğrendiği ilk tutarlı Türkçe ses.",
    },
    tagline: {
      en: "The first coherent Turkic voice — a throne forged, not inherited.",
      tr: "İlk tutarlı Türkçe ses — dövülarak kazanılan taç, miras değil.",
    },
    goodFor: {
      en: "Small instruct model (4M): a compact, fast chat-tuned voice. The first coherent Turkic sentence the stack produced — proof the lineage can speak.",
      tr: "Küçük talimat modeli (4M): hızlı, kompakt, sohbet için inceltilmiş bir ses. Yığının ürettiği ilk tutarlı Türkçe cümle — soyun konuşabildiğinin kanıtı.",
    },
  },
  {
    id: "istemi",
    codename: "İstemi",
    kind: "base",
    params: "51M",
    metric: "ppl 46.5",
    date: "2026-06-14",
    lineage: {
      en: "İstemi Yabgu was Bumin's brother and co-ruler of the western wing, pushing Göktürk power across the steppe toward Byzantium, Sogdia, and the furthest horizons of trade and war. Where Bumin anchored the center, İstemi extended the reach. The name marks a frontier-scale model: broader context, wider coverage, the same lineage carried farther west.",
      tr: "İstemi Yabgu, Bumin'in kardeşi ve batı kanadının ortak hükümdarıydı; Göktürk gücünü bozkırdan Bizans'a, Soğdiana'ya, ticaretin ve savaşın en uzak ufuklarına taşıdı. Bumin merkezi sabitledi; İstemi erişimi genişletti. Bu ad, sınır ölçeğinde bir modeli işaret eder: daha geniş bağlam, daha geniş kapsam, aynı soyun batıya daha uzağa taşınması.",
    },
    tagline: {
      en: "Frontier reach — the same lineage carried farther west.",
      tr: "Sınırın erişimi — aynı soyun batıya daha uzağa taşınması.",
    },
    goodFor: {
      en: "Larger base model (51M) for text continuation. Broader context and coverage than Bumin — the frontier-scale raw voice before instruction tuning.",
      tr: "Metin sürdürme için daha büyük temel model (51M). Bumin'den daha geniş bağlam ve kapsam — talimat incelemesinden önce sınır ölçeğindeki ham ses.",
    },
  },
  {
    id: "kashgari",
    codename: "Kaşgarlı",
    kind: "imported",
    params: "135M",
    metric: "",
    date: "2026-06-14",
    lineage: {
      en: "Mahmud al-Kashgari, known in Turkish tradition as Kaşgarlı Mahmud, was an 11th-century scholar who traveled the Turkic world and compiled Diwan Lughat al-Turk — the first systematic dictionary and linguistic atlas of Turkic tongues. He did not merely list words; he mapped dialects, etymologies, and the living geography of speech. Kaşgarlı names the language-knowledge model: define terms, distinguish registers, know what Turkic means in every corner.",
      tr: "Türk geleneğinde Kaşgarlı Mahmud olarak bilinen 11. yüzyıl bilgini Mahmud el-Kaşgari, Türk dünyasını dolaştı ve Divânü Lügati't-Türk'ü — Türk dillerinin ilk sistemli sözlüğünü ve dil atlasını — derledi. Yalnızca sözcük listelemedi; lehçeleri, kökenleri ve konuşmanın yaşayan coğrafyasını haritaladı. Kaşgarlı, terim tanımlayan, üslupları ayıran, Türkçenin her köşede ne anlama geldiğini bilen dil-bilgisi modelini adlandırır.",
    },
    tagline: {
      en: "The atlas of Turkic tongues — dialects, etymologies, registers mapped.",
      tr: "Türk dillerinin atlası — lehçeler, kökenler, üsluplar haritalanmış.",
    },
    goodFor: {
      en: "Imported open base (135M): an external open-weights model re-loaded into Orkhon with exact parity. Knowledge-rich reference voice, not trained in-house.",
      tr: "İçe aktarılmış açık temel (135M): harici açık ağırlıklı bir model, birebir eşlikle Orkhon'a yeniden yüklenmiştir. Ev içinde eğitilmemiş, bilgi dolu bir referans sesi.",
    },
  },
  {
    id: "kultigin",
    codename: "Kül Tigin",
    kind: "instruct",
    params: "22M",
    metric: "",
    date: "2026-06-14",
    lineage: {
      en: "Kül Tigin was a Göktürk prince and general whose death in 731 moved the court to raise the great Orkhon inscription in his name — one of the oldest surviving monuments of Turkic writing. The stones praise his campaigns, loyalty, and the khaganate he served. Kül Tigin names the flagship model: the voice carved to endure, the public face of what Orkhon writes.",
      tr: "Kül Tigin, 731'deki ölümü sarayı harekete geçirerek adına Büyük Orhun Yazıtı'nı — Türk yazısının günümüze ulaşan en eski anıtlarından birini — diktiren Göktürk şehzadesi ve generaliydi. Taşlar onun seferlerini, sadakatini ve hizmet ettiği kağanlığı över. Kül Tigin, kalıcı kılınmış sesi, Orkhon'un kamusal yüzünü adlandıran amiral modeldir.",
    },
    tagline: {
      en: "The flagship — the voice carved to endure, Orkhon's public face.",
      tr: "Amiral model — kalıcı kılınmış ses, Orkhon'un kamusal yüzü.",
    },
    goodFor: {
      en: "Flagship instruct model (22M): chat-tuned, the public-facing voice of Orkhon. Mid-scale, balanced for quality and speed in real conversations.",
      tr: "Amiral talimat modeli (22M): sohbet için inceltilmiş, Orkhon'un kamusal sesi. Orta ölçek, gerçek konuşmalarda kalite ve hız dengesi.",
    },
  },
  {
    id: "tonyukuk",
    codename: "Tonyukuk",
    kind: "base",
    params: "22M",
    metric: "ppl 4.8",
    date: "2026-06-14",
    lineage: {
      en: "Tonyukuk was chancellor, strategist, and vizier to three khagans, the architect who rebuilt the Second Göktürk Khaganate after collapse and left his own Orkhon inscription — a rare statesman's monument in his lifetime. His texts record not battles alone but counsel, timing, and the logic of survival. Tonyukuk names the reasoning model: plan, persuade, restore order from fragments.",
      tr: "Tonyukuk, üç kağana vekil, stratejist ve veziriydi; çöküşten sonra İkinci Göktürk Kağanlığı'nı yeniden inşa eden mimar ve yaşarken kendi Orhun yazıtını bırakan ender bir devlet adamı anıtı. Metinleri yalnızca savaşları değil, nasihatı, zamanlamayı ve ayakta kalmanın mantığını kaydeder. Tonyukuk, planlayan, ikna eden, parçalardan düzeni yeniden kuran akıl yürütme modelini adlandırır.",
    },
    tagline: {
      en: "The strategist — plan, persuade, restore order from fragments.",
      tr: "Stratejist — planla, ikna et, parçalardan düzeni yeniden kur.",
    },
    goodFor: {
      en: "Base model (22M) with the strongest perplexity (ppl 4.8): the sharpest raw Turkic voice. Foundation for the reasoning-tuned line — counsel, timing, survival.",
      tr: "En güçlü perplexity'ye (ppl 4.8) sahip temel model (22M): en keskin ham Türkçe ses. Akıl yürütme için inceltilmiş soyun temeli — nasihat, zamanlama, ayakta kalma.",
    },
  },
];
