import type { Metadata } from "next";
import "./tailwind.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

export const metadata: Metadata = {
  metadataBase: new URL("https://pixelpreserve.vercel.app"),
  title: {
    default: "PIXELPRESERVE | ব্যক্তিগত ব্রাউজার টুল",
    template: "%s | PIXELPRESERVE",
  },
  description:
    "দ্রুত ও ব্যক্তিগত ব্রাউজার টুলের প্রিমিয়াম সংগ্রহ। ডেভেলপার ও ফ্রিল্যান্সারদের জন্য কাজের টুলকিট।",
  keywords: [
    "PixelPreserve",
    "ব্যক্তিগত ব্রাউজার টুল",
    "Fiverr Message Checker",
    "Task Manager",
    "Developer Tools",
    "Shofiqul Islam",
  ],
  authors: [{ name: "Shofiqul Islam" }],
  openGraph: {
    title: "PIXELPRESERVE | ব্যক্তিগত ব্রাউজার টুল",
    description: "দ্রুত ও ব্যক্তিগত ব্রাউজার টুলের প্রিমিয়াম সংগ্রহ।",
    url: "https://pixelpreserve.vercel.app",
    siteName: "PixelPreserve",
    locale: "bn_BD",
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
    <html lang="bn" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
