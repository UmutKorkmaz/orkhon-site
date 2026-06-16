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

export default function Home() {
  return (
    <div className="orkhon-landing">
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
