// Current KVKK / GDPR privacy notice version + bilingual text for the Orkhon Lab.
//
// This is the canonical source of truth for which policy version users must
// accept before their prompt history is persisted. Bump POLICY_VERSION (and
// update POLICY_TEXT) whenever the privacy notice changes materially; existing
// ConsentRecord rows keep the old version, so getCurrentUser() will correctly
// report hasAccepted=false until the user re-accepts the new version.

export const POLICY_VERSION = "kvkk-gdpr-2026-06";

export const POLICY_TEXT: { en: string[]; tr: string[] } = {
  en: [
    "Orkhon is an AI model lab. When you are signed in, we store your Google account email address, the prompts you send in the Lab, the model replies, the model identifier, and timestamps. This lets us show you your Lab history across sessions.",
    "The legal basis for processing your account email is your consent and our legitimate interest in providing the service you requested. The legal basis for processing your prompts and the model replies is the performance of the service and your consent.",
    "We do not sell your data. Saved Lab runs are linked to your account and are not shared with other users. You can delete any saved run at any time, which permanently removes the run and all of its messages.",
    "Under the EU General Data Protection Regulation (2016/679), including Article 17 (right to erasure), and the Turkish Personal Data Protection Law (KVKK, Law No. 6698), including Article 11 (rights of the data subject), you have the right to access, rectify, erase, port, and object to the processing of your personal data, and to withdraw consent at any time.",
    "To exercise any of these rights, delete your saved runs via the Lab UI, or contact the site operator. Withdrawal of consent does not affect the lawfulness of processing carried out before the withdrawal.",
    "By continuing to use Orkhon while signed in, you acknowledge that you have read this notice and consent to the processing described above for the purpose of providing and improving the Lab service.",
  ],
  tr: [
    "Orkhon bir yapay zeka model laboratuvarıdır. Oturum açtığınızda Google hesap e-posta adresinizi, Lab içinde gönderdiğiniz promptları, model yanıtlarını, model tanımlayıcısını ve zaman damgalarını saklarız. Bu sayede Lab geçmişinizi oturumlar arasında size gösterebiliriz.",
    "Hesap e-postanızın işlenmesinin hukuki dayanağı açık rızanız ve talep ettiğiniz hizmeti sunmamızdan kaynaklı meşru menfaatimizdir. Mesajlarınızın ve model yanıtlarının işlenmesinin hukuki dayanağı hizmetin ifası ve açık rızanızdır.",
    "Verilerinizi satmıyoruz. Kayıtlı Lab denemeleri hesabınızla ilişkilendirilir ve diğer kullanıcılarla paylaşılmaz. Herhangi bir kayıtlı denemeyi istediğiniz zaman silebilirsiniz; bu işlem denemeyi ve tüm mesajlarını kalıcı olarak kaldırır.",
    "Avrupa Genel Veri Koruma Tüzüğü (2016/679, GDPR), dahil olmak üzere 17. Madde (silinme hakkı), ve Türk Kişisel Verilerin Korunması Kanunu (KVKK, 6698 Sayılı Kanun), dahil olmak üzere 11. Madde (ilgili kişinin hakları) kapsamında kişisel verilerinizin işlenmesine erişme, düzeltilme, silinme, aktarılma ve itiraz etme haklarına sahipsiniz ve rızanızı her zaman geri çekebilirsiniz.",
    "Bu haklardan herhangi birini kullanmak için Lab arayüzünden kayıtlı denemelerinizi silebilir veya site işletmecisiyle iletişime geçebilirsiniz. Rızanın geri çekilmesi, geri çekilmeden önceki işlemenin kanuniliğini etkilemez.",
    "Oturum açıkken Orkhon'u kullanmaya devam ederek, bu bildirimi okuduğunuzu ve Lab hizmetinin sunulması ve iyileştirilmesi amacıyla yukarıda açıklanan işlemlere rıza gösterdiğinizi kabul edersiniz.",
  ],
};
