"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TOOLS, type ToolItem } from "./lib/tools";

type CategoryFilter = "All" | "Backend" | "Text & Code" | "Media" | "Design & CSS" | "Productivity";

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Backend",
  "Text & Code",
  "Media",
  "Design & CSS",
  "Productivity",
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.shortDescription.toLowerCase().includes(query) ||
        tool.tag.toLowerCase().includes(query) ||
        tool.summary.headline.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main className="relative mx-auto w-[calc(100%-24px)] max-w-7xl px-0 pb-16 min-[701px]:w-[calc(100%-56px)]">
      {/* Hero Section */}
      <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-glass)] p-6 backdrop-blur-[18px] sm:p-10 min-[701px]:rounded-[26px]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-3.5 py-1 font-mono text-xs font-semibold text-[var(--accent)]">
            <span>✦</span>
            <span>100% PRIVATE &amp; CLIENT-SIDE</span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl min-[901px]:text-6xl">
            All Your Developer Tools, <span className="text-[var(--accent)]">in One Place.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            Zero server uploads. Zero tracking. Fast, minimalist, privacy-first utilities built to remove friction from your daily workflow.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--accent)]" />
              {TOOLS.length} Developer Tools
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--accent)]" />
              Runs In-Browser
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--accent)]" />
              Free &amp; Open
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-10 border-t border-[var(--border)] pt-6" id="tools">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Tool categories">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === "All"
                    ? TOOLS.length
                    : TOOLS.filter((t) => t.category === cat).length;
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-medium transition ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                        : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-72">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)]"
                aria-hidden="true"
              >
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
              <span className="text-3xl">🔍</span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                No tools found matching &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Try searching with another keyword or select &ldquo;All&rdquo; categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:border-[var(--border-hover)]"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            filteredTools.map((tool: ToolItem) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface)] no-underline"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl border border-white/20 bg-[var(--accent)] text-xl text-white transition group-hover:rotate-6">
                      {tool.icon}
                    </span>
                    <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] tracking-wider text-[var(--text-secondary)] uppercase">
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                    {tool.name}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs font-mono text-[var(--text-secondary)]">
                  <span>Open Tool</span>
                  <span className="text-base text-[var(--accent)] transition group-hover:translate-x-0.5" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured AI Assistant Banner */}
      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-glass)] p-6 sm:p-8 backdrop-blur-[18px]">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/20 bg-[var(--accent)] text-2xl text-white">
              ✦
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--accent)]">
                  AI SUITE
                </span>
                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  Streaming Responses
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                PixelPreserve AI Assistant
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Ask coding questions, debug issues, explore algorithms, and optimize your designs with real-time streaming AI.
              </p>
            </div>
          </div>
          <Link
            href="/ai"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]"
          >
            Launch Assistant ↗
          </Link>
        </div>
      </section>

      {/* Trust & Architecture Badges */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <span className="text-2xl">🔒</span>
          <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
            100% In-Browser Privacy
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            All conversions and formatting execute directly in your browser using Web APIs. No sensitive files or data ever leave your device.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <span className="text-2xl">⚡</span>
          <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
            Zero Reload Navigation
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Instantaneous client-side transitions powered by Next.js. Switch between tools seamlessly without losing browser context.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <span className="text-2xl">⌨️</span>
          <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
            Command Palette (Ctrl + K)
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Jump to any tool, toggle themes, or search utilities instantly with our keyboard-driven spotlight command menu.
          </p>
        </div>
      </section>
    </main>
  );
}
