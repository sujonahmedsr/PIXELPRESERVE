"use client";

import { usePathname } from "next/navigation";
import { ErrorBoundary } from "./ErrorBoundary";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./Toast";

export function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          {pathname === "/ai" ? (
            children
          ) : (
            <>
              <SiteHeader />
              {children}
              <SiteFooter />
            </>
          )}
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}
