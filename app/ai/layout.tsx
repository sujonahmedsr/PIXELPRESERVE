import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shofidev-tools.vercel.app";

export const metadata: Metadata = {
  title: "ShofiDev AI Assistant - Coding & Developer Helper",
  description:
    "Free streaming AI assistant by SHOFIDEV_TOOLS (Shofi Dev Tools) powered by Google Gemini. Get instant help with coding, TypeScript debugging, architecture design, regex, and study plans.",
  keywords: [
    "shofi dev tools ai",
    "shofidev ai",
    "developer ai assistant",
    "coding ai",
    "free ai coding assistant",
    "SHOFIDEV_TOOLS",
    "developer tools",
    "gemini coding helper",
  ],
  alternates: {
    canonical: "/ai",
  },
  openGraph: {
    title: "ShofiDev AI Assistant | SHOFIDEV_TOOLS",
    description:
      "Intelligent developer helper for code architecture, debugging, and programming roadmaps. By SHOFIDEV_TOOLS.",
    url: `${siteUrl}/ai`,
    siteName: "SHOFIDEV_TOOLS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShofiDev AI Assistant | SHOFIDEV_TOOLS",
    description:
      "Free streaming AI assistant for developers and students. By SHOFIDEV_TOOLS.",
  },
};

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
