import type { Metadata } from "next";
import "./tailwind.css";
import { AppShell } from "./components/AppShell";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shofidev-tools.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "SHOFIDEV_TOOLS | All-in-One Developer Tools & Browser Utilities by Shofiqul Islam",
    template: "%s | SHOFIDEV_TOOLS - Developer Tools",
  },
  description:
    "SHOFIDEV_TOOLS (Shofi Dev Tools) is a fast, privacy-first developer tools suite created by Shofiqul Islam. 12+ free online developer utilities: WebP Converter, JWT Debugger, Backend Crypto Suite, JSON Formatter, Base64 Encoder, Markdown Preview, Task Manager, Bangladesh Prayer Times, and ShofiDev AI Assistant. 100% client-side and browser-based.",
  keywords: [
    "shofi dev tools",
    "SHOFIDEV_TOOLS",
    "shofidev tools",
    "shofi developer tools",
    "developer tools",
    "free developer tools",
    "online developer tools",
    "web developer tools",
    "browser developer tools",
    "dev tools",
    "dev tools online",
    "privacy developer tools",
    "shofiqul islam",
    "shofidev",
    "WebP Converter",
    "JWT Debugger",
    "Backend Crypto Suite",
    "HMAC Webhook Generator",
    "UUID Generator",
    "Unix Epoch Converter",
    "JSON Formatter",
    "Base64 Encoder",
    "Markdown Preview",
    "Fiverr Message Checker",
    "Bangladesh Prayer Times",
    "Task Manager",
    "Time Desk",
    "Client-Side Developer Utilities",
  ],
  authors: [{ name: "Shofiqul Islam", url: "https://github.com/sujonahmedsr" }],
  creator: "Shofiqul Islam",
  publisher: "SHOFIDEV_TOOLS",
  applicationName: "SHOFIDEV_TOOLS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SHOFIDEV_TOOLS | All-in-One Developer Tools Suite",
    description:
      "A fast, private suite of 12+ essential developer utilities running 100% inside your browser. Built by Shofiqul Islam.",
    url: siteUrl,
    siteName: "SHOFIDEV_TOOLS",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHOFIDEV_TOOLS | Free Developer Tools & Utilities",
    description:
      "Privacy-first in-browser developer suite. Zero server uploads. Created by Shofiqul Islam.",
    creator: "@sujonahmedsr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "hbRZi01SdWq2f6mFmWEgEo7XWvDgH-Uzgt_N1Kba0tk",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SHOFIDEV_TOOLS",
  alternateName: [
    "Shofi Dev Tools",
    "ShofiDev Tools",
    "SHOFIDEV_TOOLS",
    "Shofi Developer Tools",
    "Developer Tools by Shofi",
  ],
  url: siteUrl,
  description:
    "Free, fast, privacy-first all-in-one developer tools suite running client-side.",
  publisher: {
    "@type": "Person",
    name: "Shofiqul Islam",
    alternateName: "shofidev",
    url: "https://github.com/sujonahmedsr",
  },
};

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SHOFIDEV_TOOLS Developer Suite",
  alternateName: "Shofi Dev Tools",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Shofiqul Islam",
    url: "https://github.com/sujonahmedsr",
  },
  description:
    "Collection of 12+ free client-side developer utilities: WebP Converter, JWT Debugger, Backend Crypto Suite, JSON Formatter, Base64 Tool, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
        />
      </head>
      <body
        className="font-[Inter,system-ui,sans-serif]"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
