"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass =
  "text-center font-mono text-[10px] leading-4 tracking-[0.03em] no-underline transition min-[701px]:text-base min-[701px]:leading-normal";

export function SiteHeader() {
  const pathname = usePathname();
  const isTimeDesk = pathname === "/time";

  return (
    <header className="mx-auto flex w-[calc(100%-24px)] max-w-7xl flex-col items-center justify-center border-b border-[#d5e2da] py-4 min-[701px]:w-[calc(100%-56px)] min-[701px]:flex-row min-[701px]:justify-between min-[701px]:py-5 gap-4">
      <Link
        className="group flex items-center gap-3 text-lg font-semibold tracking-[0.02em] text-[#17201e] no-underline"
        href="/"
        aria-label="PixelPreserve home"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-[#157c62] text-white shadow-[0_8px_18px_#157c6230] transition group-hover:rotate-6 group-hover:bg-[#10664f]">
          ✦
        </span>
        PIXELPRESERVE
      </Link>
      <div className="hidden items-center gap-3 font-mono text-sm tracking-[0.03em] text-[#71807b] min-[701px]:flex">
        <span className="inline-block size-1.5 rounded-full bg-[#35a67d] shadow-[0_0_0_4px_#35a67d1a]" />
        BROWSER ONLY
      </div>
      <nav className="grid w-full grid-cols-3 items-center gap-2 min-[701px]:flex min-[701px]:w-auto min-[701px]:gap-6" aria-label="Primary navigation">
        <Link
          className={`${linkClass} ${
            pathname === "/fiverr" ? "text-[#157c62]" : "text-[#71807b]"
          } hover:text-[#157c62]`}
          href="/fiverr"
        >
          FIVERR MESSAGE CHECKER
        </Link>
        <Link
          className={`${linkClass} ${
            pathname === "/tasks" ? "text-[#157c62]" : "text-[#71807b]"
          } hover:text-[#157c62]`}
          href="/tasks"
        >
          TASKS MANAGER
        </Link>
        <Link
          className={`${linkClass} ${
            pathname === "/time" ? "text-[#157c62]" : "text-[#71807b]"
          } hover:text-[#157c62]`}
          href="/time"
        >
          TIME DESK
        </Link>
      </nav>
    </header>
  );
}
