import type { Metadata } from "next";

const TITLE = "Lab — Orkhon";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Select an Orkhon family model, load prepared model-specific experiments, and run them against the live Turkic language model backend.",
  alternates: {
    canonical: "https://orkhon.umutkorkmaz.net/lab",
  },
  openGraph: {
    title: TITLE,
    description:
      "A model-based lab for the Orkhon Turkic language models.",
    url: "https://orkhon.umutkorkmaz.net/lab",
  },
};

export default function LabLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
