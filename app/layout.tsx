import type { Metadata } from "next";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "PIXELPRESERVE | ব্যক্তিগত ব্রাউজার টুল",
  description: "দ্রুত ও ব্যক্তিগত ব্রাউজার টুলের প্রিমিয়াম সংগ্রহ।",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
