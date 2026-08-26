"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname === "/ai") return <>{children}</>;

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
