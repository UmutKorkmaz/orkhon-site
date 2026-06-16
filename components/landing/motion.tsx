"use client";

// Shared Framer-motion primitives + section scaffolding for the Orkhon
// landing. Keeping reveal variants in one place gives every section the same
// choreography and respects prefers-reduced-motion without each component
// re-implementing it.

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { useLang, type Bilingual } from "@/lib/i18n";

/** Standard easing curve, mirrored from globals.css --ease-out-expo. */
const EASE = [0.16, 1, 0.3, 0.3] as const;

/** Container that staggers its <MotionItem> children into view. */
export function MotionReveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "ul" | "ol";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduce) {
    // Motion off: render plain, no transform/opacity animation.
    return <div className={className}>{children}</div>;
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
    >
      {children}
    </Tag>
  );
}

/** A single staggered child. Must live inside <MotionReveal>. */
export function MotionItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "span" | "p" | "h2" | "h3" | "article" | "aside" | "ul";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Tag className={className} variants={ITEM_VARIANTS}>
      {children}
    </Tag>
  );
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

/** A self-animating block for a single hero/CTA element (no stagger). */
export function MotionSolo({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Section shell: kicker index, serif heading, lead paragraph. */
export function SectionHeading({
  index,
  heading,
  intro,
  align = "left",
}: {
  index: string;
  heading: Bilingual;
  intro?: Bilingual;
  align?: "left" | "center";
}) {
  const { t } = useLang();

  return (
    <div
      className="orkhon-section-head"
      data-align={align}
    >
      <MotionReveal>
        <MotionItem className="orkhon-section-head__index">
          <span className="orkhon-section-head__hash">{index}</span>
          <span className="orkhon-section-head__rule" aria-hidden="true" />
        </MotionItem>
        <MotionItem as="h2" className="orkhon-section-head__title">
          {t(heading)}
        </MotionItem>
        {intro ? (
          <MotionItem as="p" className="orkhon-section-head__intro">
            {t(intro)}
          </MotionItem>
        ) : null}
      </MotionReveal>

      <style>{`
        .orkhon-section-head {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 46rem;
          margin-bottom: clamp(2.5rem, 2rem + 2vw, 4rem);
        }
        .orkhon-section-head[data-align="center"] {
          margin-inline: auto;
          text-align: center;
          align-items: center;
        }
        .orkhon-section-head__index {
          display: inline-flex;
          align-items: center;
          gap: 0.9rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--cyan);
          font-weight: 500;
        }
        .orkhon-section-head[data-align="center"] .orkhon-section-head__index {
          justify-content: center;
        }
        .orkhon-section-head__hash { white-space: nowrap; }
        .orkhon-section-head__rule {
          display: inline-block;
          height: 1px;
          width: clamp(2rem, 8vw, 5rem);
          background: linear-gradient(90deg, var(--cyan-dim), transparent);
        }
        .orkhon-section-head__title {
          font-size: clamp(2rem, 1.4rem + 2.6vw, 3.4rem);
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .orkhon-section-head__intro {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.05rem, 1rem + 0.4vw, 1.3rem);
          line-height: 1.5;
          color: var(--ink-1);
          max-width: 44rem;
        }
        .orkhon-section-head[data-align="center"] .orkhon-section-head__intro {
          margin-inline: auto;
        }
      `}</style>
    </div>
  );
}
