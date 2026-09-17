import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shofidev-tools.vercel.app";

export const metadata: Metadata = {
  title: "Bangladesh Prayer Times (নামাজের সময়সূচি) & Salah Schedule",
  description:
    "Accurate Islamic prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha), Tahajjud, Sahri/Iftar, and 3 prohibited salah intervals for Dhaka, Chittagong, Sylhet, and all Bangladesh divisions calibrated with Islamic Foundation Bangladesh. By SHOFIDEV_TOOLS.",
  keywords: [
    "bangladesh prayer times",
    "namajer somoy suchi",
    "dhaka prayer times",
    "prohibited prayer times",
    "islamic foundation bangladesh",
    "salat schedule bangladesh",
    "shofi dev tools",
    "SHOFIDEV_TOOLS",
    "shofidev",
  ],
  alternates: {
    canonical: "/prayer",
  },
  openGraph: {
    title: "Bangladesh Prayer Times & Salah Schedule | SHOFIDEV_TOOLS",
    description:
      "100% accurate Islamic prayer times and prohibited salah warnings for all Bangladesh divisions. By SHOFIDEV_TOOLS.",
    url: `${siteUrl}/prayer`,
    siteName: "SHOFIDEV_TOOLS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangladesh Prayer Times & Salah Schedule | SHOFIDEV_TOOLS",
    description:
      "Live Islamic prayer times and countdowns for all 8 Bangladesh divisions. Built by SHOFIDEV_TOOLS.",
  },
};

export default function PrayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
