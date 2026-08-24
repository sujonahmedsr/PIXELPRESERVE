"use client";

import { useState } from "react";

// আপনার দেওয়া নির্দিষ্ট সোয়াপ রুল অনুযায়ী আপডেট করা অবজেক্ট
const fiverrRules: Record<string, string> = {
  instagram: "inst-agram",
  whatsapp: "what-sapp",
  telegram: "tele-gram",
  facebook: "face-book",
  linkedin: "link-edin",
  payment: "pa-yment",
  bitcoin: "bit-coin",
  twitter: "twi-tter",
  discord: "dis-cord",
  email: "e-mail",
  signal: "sig-nal",
  paypal: "pay-pal",
  crypto: "cry-pto",
  gmail: "gm-ail",
  phone: "ph-one",
  skype: "sk-ype",
  viber: "vi-ber",
  mail: "ma-il",
  call: "ca-ll",
  zoom: "zo-om",
  bank: "ba-nk",
  pay: "p-ay",
  payoneer: "pay-oneer",
};

const restrictedWordsList = Object.keys(fiverrRules);

function rewriteFiverrMessage(value: string) {
  const pattern = new RegExp(`\\b(${restrictedWordsList.join("|")})\\b`, "gi");

  return value.replace(pattern, (matchedWord) => {
    const lowerWord = matchedWord.toLowerCase();
    const customSwap = fiverrRules[lowerWord];

    if (customSwap) {
      if (
        matchedWord[0] === matchedWord[0].toUpperCase() &&
        matchedWord[0] !== matchedWord[0].toLowerCase()
      ) {
        return customSwap.charAt(0).toUpperCase() + customSwap.slice(1);
      }
      return customSwap;
    }

    return `${matchedWord.slice(0, 2)}-${matchedWord.slice(2)}`;
  });
}

function findFiverrRestrictedWords(value: string) {
  const matches = Array.from(
    new Set(
      value.match(
        new RegExp(`\\b(${restrictedWordsList.join("|")})\\b`, "gi"),
      ) ?? [],
    ),
  );
  if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(value)) matches.push("email address");
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(value)) matches.push("phone number");
  return matches;
}

export function FiverrChecker() {
  const [message, setMessage] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy safe message");
  const restrictedWords = findFiverrRestrictedWords(message);
  const hasInputError = restrictedWords.length > 0;
  const safeRewrite = message.trim() ? rewriteFiverrMessage(message) : "";

  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  async function copyResult() {
    if (!safeRewrite) return;
    await navigator.clipboard.writeText(safeRewrite);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy safe message"), 1200);
  }

  return (
    <div role="tabpanel" className="mx-auto w-full max-w-7xl">
      {/* Top Info Bar */}
      <div className="mb-8 flex flex-col items-start justify-between gap-5 min-[701px]:flex-row min-[701px]:items-center">
        <div className="min-w-0">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#157c62] min-[701px]:text-sm">
            Fiverr / Message Safety
          </span>
          <h1 className="mt-2 max-w-full wrap-break-word text-2xl font-medium leading-[1.12] tracking-[-0.04em] text-[#17201e] min-[701px]:whitespace-nowrap min-[701px]:text-[30px]">
            Fiverr message checker
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-[1.6] text-[#71807b] min-[701px]:text-base">
            Send করার আগে message-এর restricted terms পরিষ্কার করে নিন।
          </p>
        </div>

        <div className="flex w-full flex-wrap items-start gap-2.5 min-[701px]:w-auto min-[701px]:flex-col min-[701px]:items-end">
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[#b9d8c5] bg-[#f0f8f2] px-3.5 py-1.5 font-mono text-xs tracking-[0.08em] text-[#157c62] shadow-sm min-[701px]:inline-flex min-[701px]:text-sm">
              ● LIVE / PRIVATE
            </span>
            <span className="rounded-full border border-[#dce5df] bg-white px-3 py-1.5 font-mono text-xs text-[#71807b] shadow-sm min-[701px]:text-sm">
              {wordCount} words / {message.length} chars
            </span>
          </div>
          <span className="font-mono text-xs tracking-[0.03em] text-[#71807b] min-[701px]:text-sm">
            BROWSER ONLY / PRIVATE
          </span>
        </div>
      </div>

      {/* Main Grid Boxes */}
      <div className="grid items-stretch gap-6 min-[901px]:grid-cols-2">
        {/* Original Message Section */}
        <section
          className={`flex flex-col rounded-2xl border p-5 shadow-[0_10px_30px_#8d4e320d] transition-all duration-200 ${hasInputError ? "border-[#e4a39a] bg-[#fff4f2]" : "border-[#dce5df] bg-[#fffaf4]"}`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span
              className={`font-mono text-sm sm:text-base tracking-widest font-semibold ${hasInputError ? "text-[#b34635]" : "text-[#71807b]"}`}
            >
              ORIGINAL MESSAGE
            </span>
            {message.trim() ? (
              <span
                className={`rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${hasInputError ? "bg-[#f9d9d4] text-[#b34635]" : "bg-[#dff1e6] text-[#157c62]"}`}
              >
                {hasInputError ? "Review needed" : "Looks clear"}
              </span>
            ) : null}
          </div>

          <textarea
            className={`block min-h-90 w-full flex-1 resize-y rounded-xl border bg-white p-4 text-base leading-[1.7] text-[#17201e] outline-0 transition-all ${hasInputError ? "border-[#e4a39a] focus:border-[#b34635] focus:shadow-[0_0_0_3px_#b3463526]" : "border-[#dce5df] focus:border-[#dfb883] focus:shadow-[0_0_0_3px_#dfb88326]"}`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Fiverr buyer-এর message এখানে paste করুন…"
            aria-label="Fiverr message input"
            aria-invalid={hasInputError}
          />

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#dce5df]/60">
            {hasInputError ? (
              <p className="rounded-lg border border-[#e4a39a] bg-white px-3.5 py-2 text-sm text-[#b34635] shadow-sm">
                Restricted word পাওয়া গেছে: {restrictedWords.join(", ")}
              </p>
            ) : (
              <p className="text-sm text-[#71807b]">
                Restricted word-গুলো আপনার নির্দিষ্ট নিয়ম অনুযায়ী পরিবর্তিত হবে।
              </p>
            )}
            <button
              className="w-full sm:w-auto shrink-0 rounded-xl border border-[#dce5df] bg-white px-4 py-2.5 text-sm font-medium text-[#71807b] shadow-[0_2px_8px_#224c3d08] transition hover:-translate-y-0.5 hover:border-[#a8d1ba] hover:text-[#17201e] active:translate-y-0"
              onClick={() => setMessage("")}
              type="button"
            >
              Clear <span className="text-base ml-1">×</span>
            </button>
          </div>
        </section>

        {/* Updated Message Section */}
        <section className="flex min-h-70 flex-col rounded-2xl border border-[#b9d8c5] bg-[#f0f8f2] p-5 shadow-[0_10px_30px_#157c6210] transition-all duration-200">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="font-mono text-sm sm:text-base tracking-widest text-[#157c62] font-semibold">
              UPDATED MESSAGE
            </span>
          </div>

          <div className="flex flex-1 rounded-xl border border-[#b9d8c5] bg-white p-4 shadow-[inset_0_2px_4px_#224c3d05] min-h-55">
            {safeRewrite ? (
              <p className="whitespace-pre-wrap text-base leading-[1.7] text-[#17201e] w-full">
                {safeRewrite}
              </p>
            ) : (
              <div className="m-auto text-center p-6">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e4f3e8] text-xl text-[#157c62] shadow-[0_6px_16px_#157c6218]">
                  ✦
                </span>
                <p className="mt-3 text-sm sm:text-base text-[#71807b]">
                  Input-এ message লিখলে updated message এখানে দেখা যাবে।
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end pt-3 border-t border-[#b9d8c5]/60">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#157c62] bg-[#157c62] px-5 py-2.5 text-sm sm:text-base font-medium text-white shadow-[0_6px_16px_#157c6230] transition hover:-translate-y-0.5 hover:bg-[#10664f] hover:shadow-[0_8px_20px_#157c6240] active:translate-y-0 disabled:cursor-not-allowed disabled:border-[#b9d8c5] disabled:bg-[#b9d8c5] disabled:shadow-none"
              onClick={() => void copyResult()}
              disabled={!safeRewrite}
              type="button"
            >
              <span aria-hidden="true">▣</span> {copyLabel}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
