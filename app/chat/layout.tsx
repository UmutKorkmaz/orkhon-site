import type { Metadata } from "next";

const TITLE = "Lab — Orkhon";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Redirects to the Orkhon Lab on lab.umutkorkmaz.net.",
  alternates: {
    canonical: "https://lab.umutkorkmaz.net/orkhon/",
  },
  openGraph: {
    title: TITLE,
    description:
      "Open the model-based Orkhon Lab.",
    url: "https://lab.umutkorkmaz.net/orkhon/",
  },
};

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
