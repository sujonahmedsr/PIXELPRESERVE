"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "shofidev-tools-theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemPreference(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemPreference() : theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = (localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("pixelpreserve-theme")) as Theme | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setThemeState(stored);
      }
    } catch {
      // localStorage not available
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage not available
    }
  }, [theme, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolvedTheme(getSystemPreference());
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const resolved = resolveTheme(current);
      return resolved === "light" ? "dark" : "light";
    });
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}
