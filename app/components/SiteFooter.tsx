export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-[calc(100%-24px)] max-w-7xl justify-between items-center gap-4 border-t border-[#d5e2da] px-0.75 py-6.5 font-mono text-sm sm:text-base leading-[1.6] tracking-[0.04em] text-[#91a19a] max-[700px]:flex-col max-[700px]:items-start min-[701px]:w-[calc(100%-56px)]">
      <span>PIXELPRESERVE / 2026</span>

      <span className="text-center max-[700px]:text-left">
        সব কাজ browser-এর ভেতরেই হয়
      </span>

      <span>
        DEVELOPED BY{" "}
        <a
          href="https://github.com/sujonahmedsr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#157c62] underline hover:text-[#10664f] transition-colors font-medium"
        >
          SHOFIQUL ISLAM
        </a>
      </span>
    </footer>
  );
}
