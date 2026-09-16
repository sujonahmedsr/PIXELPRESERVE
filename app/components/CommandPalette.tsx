"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TOOLS, type ToolItem } from "../lib/tools";
import { useTheme } from "./ThemeProvider";

type CommandItem = {
  id: string;
  title: string;
  description: string;
  category: "Tools" | "Pages" | "Preferences";
  icon: string;
  shortcut?: string;
  action: () => void;
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = TOOLS.map((tool) => ({
      id: `tool-${tool.slug}`,
      title: tool.name,
      description: tool.shortDescription,
      category: "Tools",
      icon: tool.icon,
      action: () => {
        router.push(`/tools/${tool.slug}`);
        setIsOpen(false);
      },
    }));

    list.push(
      {
        id: "page-ai",
        title: "PixelPreserve AI Assistant",
        description: "Intelligent coding helper, technical tutor, and AI consultation",
        category: "Pages",
        icon: "🤖",
        action: () => {
          router.push("/ai");
          setIsOpen(false);
        },
      },
      {
        id: "page-home",
        title: "Home / All Tools",
        description: "Return to the main developer dashboard",
        category: "Pages",
        icon: "🏠",
        action: () => {
          router.push("/");
          setIsOpen(false);
        },
      },
      {
        id: "pref-theme",
        title: `Switch to ${resolvedTheme === "light" ? "Dark" : "Light"} Mode`,
        description: "Toggle UI appearance between light and dark themes",
        category: "Preferences",
        icon: resolvedTheme === "light" ? "🌙" : "☀️",
        shortcut: "T",
        action: () => {
          toggleTheme();
          setIsOpen(false);
        },
      },
    );

    return list;
  }, [router, resolvedTheme, toggleTheme]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower),
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((idx) => (idx + 1) % Math.max(1, filteredItems.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((idx) =>
          idx === 0 ? Math.max(0, filteredItems.length - 1) : idx - 1,
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    },
    [filteredItems, selectedIndex],
  );

  return (
    <>
      {/* Quick Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] min-[701px]:flex"
        title="Quick search & switch tools (Ctrl+K)"
        aria-label="Open command palette"
      >
        <span>Search</span>
        <kbd className="rounded border border-[var(--border)] bg-[var(--bg-card)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
          Ctrl K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/45 p-4 pt-[12vh] backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
              <span className="text-base text-[var(--text-secondary)]" aria-hidden="true">
                ⌕
              </span>
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
                placeholder="Type a tool name, page or action..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd className="rounded border border-[var(--border)] bg-[var(--bg-card)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                  No tools found matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition duration-150 ${
                          isSelected
                            ? "border-[var(--border-hover)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                            : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-base">
                            {item.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-[var(--text-secondary)]">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <span className="ml-3 shrink-0 rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-[11px] text-[var(--text-secondary)] font-mono">
              <span>↑↓ Navigate · Enter to Select</span>
              <span>100% Client-Side</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
