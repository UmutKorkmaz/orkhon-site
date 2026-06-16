import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const CANONICAL = "https://orkhon.umutkorkmaz.net/";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL),
  title: {
    default: "Orkhon — Turkic language models, from inscription to inference",
    template: "%s · Orkhon",
  },
  description:
    "Orkhon is a hand-written transformer stack that learns Turkic the way the Göktürk inscriptions learned to keep it — tokenization, training, alignment, evaluation, and serving as one continuous act of inscription.",
  keywords: [
    "Orkhon",
    "Turkic language models",
    "Göktürk",
    "Turkish LLM",
    "transformer",
    "PyTorch",
    "BPE",
    "RoPE",
    "GQA",
    "SwiGLU",
  ],
  authors: [{ name: "Umut Korkmaz" }],
  creator: "Umut Korkmaz",
  alternates: {
    canonical: CANONICAL,
    languages: {
      en: CANONICAL,
      tr: CANONICAL,
    },
  },
  openGraph: {
    type: "website",
    url: CANONICAL,
    siteName: "Orkhon",
    title: "Orkhon — Turkic language models, from inscription to inference",
    description:
      "A hand-written transformer stack that turns raw Turkic text into durable, intelligible speech. From the Orkhon inscriptions to a living language system.",
    locale: "en_US",
    alternateLocale: ["tr_TR"],
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Orkhon — Turkic language models, from inscription to inference",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orkhon — Turkic language models",
    description:
      "From the first written words of a language to a system that writes it. A hand-written Turkic transformer stack.",
    images: ["/og.svg"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="orkhon-body">
        <LanguageProvider>
          <div className="orkhon-shell">
            <SiteNav />
            <main className="orkhon-main">{children}</main>
            <SiteFooter />
          </div>
        </LanguageProvider>
        <style>{`
          .orkhon-body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .orkhon-shell {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            flex: 1;
          }
          .orkhon-main {
            flex: 1;
          }
        `}</style>
      </body>
    </html>
  );
}
