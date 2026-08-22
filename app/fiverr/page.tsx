import { FiverrChecker } from "../components/FiverrChecker";

export default function FiverrPage() {
  return (
    <main className="relative mx-auto min-h-screen w-[calc(100%-24px)] max-w-7xl px-0 pb-10 pt-4.5 min-[701px]:w-[calc(100%-56px)] min-[701px]:pt-8">
      <div className="pointer-events-none fixed -top-70 -right-30 z-[-1] size-117.5 rounded-full bg-[#d7eee2] opacity-55 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-82.5 -left-40 z-[-1] size-117.5 rounded-full bg-[#f3d5c3] opacity-55 blur-[100px]" />
      <nav className="flex items-center justify-between border-b border-[#d5e2da] pb-6.5">
        <a
          className="group flex items-center gap-3 text-lg font-semibold tracking-[0.02em]"
          href="/"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[#157c62] text-white shadow-[0_8px_18px_#157c6230] transition group-hover:rotate-6 group-hover:bg-[#10664f]">
            ✦
          </span>{" "}
          PIXELPRESERVE
        </a>
        <div className="flex items-center gap-6">
          <span className="hidden font-mono text-base tracking-[0.03em] text-[#157c62] min-[521px]:inline-flex">
            FIVERR CHECKER
          </span>
          <a
            className="font-mono text-base tracking-[0.03em] text-[#71807b] no-underline transition hover:text-[#157c62]"
            href="/tasks"
          >
            TASK CONTROL ROOM ↗
          </a>
        </div>
      </nav>
      <section className="mt-4 rounded-2xl border border-[#d5e2da] bg-[#ffffffc7] p-4 shadow-[0_30px_80px_#224c3d12] backdrop-blur-[18px] min-[701px]:rounded-[26px] min-[701px]:p-7.25">
        <div className="mb-5.5 flex items-end justify-between gap-5 max-[700px]:items-start max-[700px]:flex-col max-[700px]:gap-2">
          <div>
            <span className="font-mono text-base tracking-[0.12em] text-[#157c62]">
              FIVERR / MESSAGE SAFETY
            </span>
            <h1 className="mt-2 text-[30px] leading-[1.08] font-medium tracking-[-1.8px]">
              Fiverr message checker
            </h1>
            <p className="mt-2.5 max-w-130 text-base leading-[1.6] text-[#71807b]">
              Send করার আগে message-এর restricted terms পরিষ্কার করে নিন।
            </p>
          </div>
          <span className="font-mono text-base tracking-[0.03em] text-[#71807b]">
            BROWSER ONLY / PRIVATE
          </span>
        </div>
        <FiverrChecker />
      </section>
      <footer className="flex justify-between gap-2.5 px-0.75 pt-7 font-mono text-base leading-[1.6] tracking-[0.04em] text-[#91a19a] max-[700px]:flex-col">
        <span>PIXELPRESERVE / ২০২৬</span>
        <span>সব কাজ browser-এর ভেতরেই হয়</span>
      </footer>
    </main>
  );
}
