// Orkhon landing — single-page composition of the foundation sections.
// The page is a server component; each section is a client component that
// pulls its copy via useLang() from @/lib/i18n and data from @/lib/{models,content}.

import { Hero } from "@/components/landing/hero";
import { WhatItIs } from "@/components/landing/what-it-is";
import { Pipeline } from "@/components/landing/pipeline";
import { ModelZoo } from "@/components/landing/model-zoo";
import { Results } from "@/components/landing/results";
import { Architecture } from "@/components/landing/architecture";
import { Cli } from "@/components/landing/cli";
import { Cta } from "@/components/landing/cta";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Orkhon",
  url: "https://orkhon.umutkorkmaz.net/",
  logo: "https://orkhon.umutkorkmaz.net/logo.png",
  description:
    "A hand-written transformer stack that learns Turkic the way the Göktürk inscriptions learned to keep it — tokenization, training, alignment, evaluation, and serving as one continuous act of inscription.",
  sameAs: ["https://github.com/umutkorkmaz/orkhon"],
};

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Orkhon",
  url: "https://orkhon.umutkorkmaz.net/",
  description:
    "Orkhon is a hand-written Turkic transformer stack. The thesis: the oldest Turkic writing (the 8th-century Göktürk inscriptions on the Orkhon River) and the newest language model share the same ambition — to make language last, carry memory, and speak clearly across time. From inscription to inference.",
  inLanguage: ["en", "tr"],
  publisher: { "@type": "Organization", name: "Orkhon" },
};

export default function Home() {
  return (
    <div className="orkhon-landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
      />
      <Hero />
      <hr className="orkhon-landing__rule" aria-hidden="true" />
      <WhatItIs />
      <Pipeline />
      <hr className="orkhon-landing__rule" aria-hidden="true" />
      <ModelZoo />
      <hr className="orkhon-landing__rule" aria-hidden="true" />
      <Results />
      <Architecture />
      <hr className="orkhon-landing__rule" aria-hidden="true" />
      <Cli />
      <Cta />

      <style>{`
        .orkhon-landing {
          display: flex;
          flex-direction: column;
        }
        .orkhon-landing__rule {
          border: 0;
          height: 1px;
          width: 100%;
          max-width: var(--container);
          margin: 0 auto;
          background: linear-gradient(
            90deg,
            transparent,
            var(--line) 12%,
            var(--line) 88%,
            transparent
          );
        }
      `}</style>
    </div>
  );
}
