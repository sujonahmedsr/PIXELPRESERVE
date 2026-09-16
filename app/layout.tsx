import type { Metadata } from "next";
import "./tailwind.css";
import { AppShell } from "./components/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://pixelpreserve.vercel.app"),
  title: {
    default: "PixelPreserve | Privacy-First Developer Suite & Browser Toolkit",
    template: "%s | PixelPreserve",
  },
  description:
    "A fast, privacy-first collection of 12 essential browser utilities for developers and freelancers. JWT Debugger, Backend Crypto Suite, WebP Converter, JSON Formatter, Base64 Tool, Markdown Preview, Fiverr Safety Filter, Task Manager, Time Desk, and AI Assistant.",
  keywords: [
    "PixelPreserve",
    "Privacy-First Developer Tools",
    "JWT Debugger",
    "Backend Crypto Suite",
    "HMAC Webhook Generator",
    "UUID Generator",
    "Unix Epoch Converter",
    "WebP Converter",
    "JSON Formatter",
    "Base64 Encoder",
    "Markdown Preview",
    "Fiverr Message Checker",
    "Task Manager",
    "Time Desk",
    "Developer Utilities",
    "Shofiqul Islam",
  ],
  authors: [{ name: "Shofiqul Islam" }],
  openGraph: {
    title: "PixelPreserve | Privacy-First Developer Suite",
    description:
      "A fast, private suite of 10 essential developer utilities running 100% inside your browser.",
    url: "https://pixelpreserve.vercel.app",
    siteName: "PixelPreserve",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      </head>
      <body className="font-[Inter,system-ui,sans-serif]" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
