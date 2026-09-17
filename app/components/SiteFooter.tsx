export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-[calc(100%-24px)] max-w-7xl justify-between items-center gap-4 border-t border-[var(--border)] px-0.75 py-6.5 font-mono text-sm sm:text-base leading-[1.6] tracking-[0.04em] text-[var(--text-secondary)] max-[700px]:flex-col max-[700px]:items-start min-[701px]:w-[calc(100%-56px)]">
      <span>SHOFIDEV_TOOLS / 2026</span>

      <span className="text-center max-[700px]:text-left text-xs sm:text-sm">
        100% Client-Side / Processed Privately in Your Browser
      </span>

      <span>
        DEVELOPED BY{" "}
        <a
          href="https://github.com/sujonahmedsr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline hover:text-[var(--accent-hover)] transition-colors font-medium"
        >
          SHOFIQUL ISLAM
        </a>
      </span>
    </footer>
  );
}
