import { FiverrChecker } from "../components/FiverrChecker";

export default function FiverrPage() {
  return (
    <main className="relative mx-auto min-h-screen w-[calc(100%-24px)] max-w-7xl px-0 pb-10 min-[701px]:w-[calc(100%-56px)]">
      <div className="pointer-events-none fixed -top-70 -right-30 z-[-1] size-117.5 rounded-full bg-[#d7eee2] opacity-55 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-82.5 -left-40 z-[-1] size-117.5 rounded-full bg-[#f3d5c3] opacity-55 blur-[100px]" />
      <section className="mt-4 rounded-2xl border border-[#d5e2da] bg-[#ffffffc7] p-4 shadow-[0_30px_80px_#224c3d12] backdrop-blur-[18px] min-[701px]:rounded-[26px] min-[701px]:p-7.25">
        <FiverrChecker />
      </section>
    </main>
  );
}
