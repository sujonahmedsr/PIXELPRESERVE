"use client";

import { useState } from "react";

type FiverrFinding = {
  label: string;
  detail: string;
  severity: "high" | "medium" | "low";
};

const fiverrRestrictedWords = [
  "advance",
  "bank",
  "bitcoin",
  "call",
  "connect",
  "crypto",
  "discord",
  "email",
  "facebook",
  "gift",
  "gmail",
  "instagram",
  "linkedin",
  "outside",
  "paypal",
  "payoneer",
  "payment",
  "phone",
  "signal",
  "skype",
  "telegram",
  "twitter",
  "viber",
  "whatsapp",
  "zoom",
  "pay",
];

function rewriteFiverrMessage(value: string) {
  return value.replace(
    new RegExp(`\\b(${fiverrRestrictedWords.join("|")})\\b`, "gi"),
    (word) => `${word.slice(0, 2)}-${word.slice(2)}`,
  );
}

function findFiverrRestrictedWords(value: string) {
  const matches = Array.from(
    new Set(
      value.match(
        new RegExp(`\\b(${fiverrRestrictedWords.join("|")})\\b`, "gi"),
      ) ?? [],
    ),
  );
  if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(value)) matches.push("email address");
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(value)) matches.push("phone number");
  return matches;
}

function analyzeFiverrMessage(value: string) {
  const message = value.trim();
  const normalized = message.toLowerCase();
  const restrictedWords = findFiverrRestrictedWords(message);
  const findings: FiverrFinding[] = [];
  const addFinding = (
    label: string,
    detail: string,
    severity: FiverrFinding["severity"],
  ) => findings.push({ label, detail, severity });
  if (
    /(telegram|whatsapp|skype|signal|discord|viber|zoom|call me|connect outside|contact me outside)/i.test(
      normalized,
    ) ||
    /(?:\+?\d[\d\s().-]{7,}\d)/.test(message)
  )
    addFinding(
      "Contact information or external chat app",
      "Keep communication inside Fiverr; do not share phone numbers or external chat apps.",
      "high",
    );
  if (
    /(?:[\w.+-]+\s*@\s*[\w-]+\s*\.\s*[a-z]{2,}|[\w.+-]+\s+(?:at|@)\s+(?:gmail|yahoo|outlook|hotmail)\s+(?:dot|\.)\s*com|g-mail|email me)/i.test(
      normalized,
    )
  )
    addFinding(
      "Email address or evasion",
      "Do not share an email address or disguise one with words such as at or dot.",
      "high",
    );
  if (
    /(pay outside|crypto|bitcoin|payoneer|gift card|bank transfer|direct payment|direct deal|advance payment|paypal|avoid commission)/i.test(
      normalized,
    )
  )
    addFinding(
      "Off-platform payment",
      "Keep payment and orders inside Fiverr; do not request direct deals or advance payment.",
      "high",
    );
  if (
    /(facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|facebook|instagram|linkedin|twitter)/i.test(
      normalized,
    )
  )
    addFinding(
      "Social media profile or link",
      "Do not share social profiles or direct communication channels.",
      "high",
    );
  if (
    /(free sample|free work|test task|unpaid|before order|do it first)/i.test(
      normalized,
    )
  )
    addFinding(
      "Unpaid work request",
      "Ask for an order before doing custom work.",
      "medium",
    );
  if (
    /(urgent|asap|right now|today|immediately|1 hour|one hour)/i.test(
      normalized,
    )
  )
    addFinding(
      "Urgency pressure",
      "Confirm scope and delivery time before agreeing.",
      "medium",
    );
  if (message.length < 80)
    addFinding(
      "Brief is too short",
      "Ask for goals, references, files, budget, and deadline.",
      "low",
    );
  const score = Math.max(
    0,
    100 -
      findings.reduce(
        (total, finding) =>
          total +
          (finding.severity === "high"
            ? 28
            : finding.severity === "medium"
              ? 16
              : 8),
        0,
      ),
  );
  return {
    score,
    findings,
    restrictedWords,
    safeRewrite: rewriteFiverrMessage(message),
  };
}

export function FiverrChecker() {
  const [message, setMessage] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy safe message");
  const restrictedWords = findFiverrRestrictedWords(message);
  const hasInputError = restrictedWords.length > 0;
  const result = message.trim() ? analyzeFiverrMessage(message) : null;

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result.safeRewrite);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy safe message"), 1200);
  }

  return (
    <div role="tabpanel" className="w-full max-w-7xl mx-auto">
      {/* Top Info Bar */}
      <div className="mb-8 flex items-start sm:items-center justify-between gap-5 flex-col sm:flex-row">
        <div>
          <span className="font-mono text-sm tracking-[0.12em] text-[#157c62] uppercase font-semibold">
            Fiverr / Message Safety
          </span>
          <h1 className="mt-2 text-2xl sm:text-[30px] leading-[1.08] font-medium tracking-[-1px] text-[#17201e]">
            Fiverr message checker
          </h1>
          <p className="mt-2 max-w-lg text-sm sm:text-base leading-[1.6] text-[#71807b]">
            Send করার আগে message-এর restricted terms পরিষ্কার করে নিন।
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[#b9d8c5] bg-[#f0f8f2] px-3.5 py-1.5 font-mono text-xs sm:text-sm tracking-[0.08em] text-[#157c62] sm:inline-flex shadow-sm">
              ● LIVE / PRIVATE
            </span>
            <span className="font-mono text-xs sm:text-sm text-[#71807b] bg-white px-3 py-1.5 rounded-full border border-[#dce5df] shadow-sm">
              {message.length} chars
            </span>
          </div>
          <span className="font-mono text-xs sm:text-sm tracking-[0.03em] text-[#71807b]">
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

          {/* Footer info & Clear Button moved below the box */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#dce5df]/60">
            {hasInputError ? (
              <p className="rounded-lg border border-[#e4a39a] bg-white px-3.5 py-2 text-sm text-[#b34635] shadow-sm">
                Restricted word পাওয়া গেছে: {restrictedWords.join(", ")}
              </p>
            ) : (
              <p className="text-sm text-[#71807b]">
                Restricted word-এর দ্বিতীয় অক্ষরের পরে hyphen যোগ হবে।
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
            {result ? (
              <p className="whitespace-pre-wrap text-base leading-[1.7] text-[#17201e] w-full">
                {result.safeRewrite}
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

          {/* Copy Button moved below the box */}
          <div className="mt-4 flex items-center justify-end pt-3 border-t border-[#b9d8c5]/60">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#157c62] bg-[#157c62] px-5 py-2.5 text-sm sm:text-base font-medium text-white shadow-[0_6px_16px_#157c6230] transition hover:-translate-y-0.5 hover:bg-[#10664f] hover:shadow-[0_8px_20px_#157c6240] active:translate-y-0 disabled:cursor-not-allowed disabled:border-[#b9d8c5] disabled:bg-[#b9d8c5] disabled:shadow-none"
              onClick={() => void copyResult()}
              disabled={!result}
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
