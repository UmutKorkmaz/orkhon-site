import type { Metadata } from "next";

const TITLE = "Chat — Orkhon";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Talk to the Orkhon Turkic language models. From inscription to inference — seven Göktürk-named voices, one serving stack.",
  alternates: {
    canonical: "https://orkhon.umutkorkmaz.net/chat",
  },
  openGraph: {
    title: TITLE,
    description:
      "Talk to the Orkhon Turkic language models. From inscription to inference.",
    url: "https://orkhon.umutkorkmaz.net/chat",
  },
};

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
