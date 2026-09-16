"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { CommandPalette } from "./CommandPalette";

const navLinks = [
  { href: "/#tools", label: "ALL TOOLS" },
  { href: "/prayer", label: "PRAYER TIMES" },
  { href: "/ai", label: "AI ASSISTANT" },
];

const linkClass =
  "text-center font-mono text-sm leading-normal tracking-[0.03em] no-underline transition";

export function SiteHeader() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative mx-auto flex w-[calc(100%-24px)] max-w-7xl flex-col items-center justify-center border-b border-[var(--border)] py-4 min-[701px]:w-[calc(100%-56px)] min-[701px]:flex-row min-[701px]:justify-between min-[701px]:py-5 gap-4">
      <div className="flex w-full items-center justify-between min-[701px]:w-auto">
        <Link
          className="group flex items-center gap-3 text-lg font-semibold tracking-[0.02em] text-[var(--text-primary)] no-underline"
          href="/"
          aria-label="PixelPreserve home"
        >
          <span className="grid size-9 place-items-center rounded-xl border border-white/20 bg-[var(--accent)] text-white transition group-hover:rotate-6 group-hover:bg-[var(--accent-hover)]">
            ✦
          </span>
          PIXELPRESERVE
        </Link>

        <div className="flex items-center gap-2 min-[701px]:hidden">
          {/* Dark mode toggle (mobile) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-base transition hover:border-[var(--border-hover)]"
            aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
          >
            {resolvedTheme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-lg transition hover:border-[var(--border-hover)]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Desktop: browser-only badge */}
      <div className="hidden items-center gap-3 font-mono text-sm tracking-[0.03em] text-[var(--text-secondary)] min-[701px]:flex">
        <span className="inline-block size-1.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--accent)]/30" />
        BROWSER ONLY
      </div>

      {/* Desktop nav */}
      <nav
        className="hidden items-center gap-6 min-[701px]:flex"
        aria-label="Primary navigation"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            className={`${linkClass} ${
              pathname === link.href
                ? "text-[var(--accent)] font-semibold"
                : "text-[var(--text-secondary)]"
            } hover:text-[var(--accent)]`}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}

        {/* Quick Command Launcher */}
        <CommandPalette />

        {/* Dark mode toggle (desktop) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-base transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
          aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
        >
          {resolvedTheme === "light" ? "🌙" : "☀️"}
        </button>
      </nav>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 min-[701px]:hidden"
          aria-label="Mobile navigation"
        >
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={`rounded-lg px-4 py-3 font-mono text-sm tracking-[0.03em] no-underline transition ${
                  pathname === link.href
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                }`}
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
