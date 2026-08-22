const linkClass =
  "font-mono text-base tracking-[0.03em] no-underline transition hover:text-[#157c62] max-[700px]:text-[0px]";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-[calc(100%-24px)] max-w-7xl items-center justify-between border-b border-[#d5e2da] py-4.5 min-[701px]:w-[calc(100%-56px)] min-[701px]:py-8">
      <a
        className="group flex items-center gap-3 text-lg font-semibold tracking-[0.02em] text-[#17201e] no-underline"
        href="/"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-[#157c62] text-white shadow-[0_8px_18px_#157c6230] transition group-hover:rotate-6 group-hover:bg-[#10664f]">
          ✦
        </span>
        PIXELPRESERVE
      </a>
      <div className="hidden items-center gap-3 font-mono text-sm tracking-[0.03em] text-[#71807b] min-[701px]:flex">
        <span className="inline-block size-1.5 rounded-full bg-[#35a67d] shadow-[0_0_0_4px_#35a67d1a]" />
        BROWSER ONLY
      </div>
      <nav className="flex items-center gap-6" aria-label="Primary navigation">
        <a className={`${linkClass} text-[#71807b]`} href="/fiverr">
          FIVERR CHECKER ↗
        </a>
        <a className={`${linkClass} text-[#71807b]`} href="/tasks">
          TASK CONTROL ROOM ↗
        </a>
      </nav>
    </header>
  );
}
