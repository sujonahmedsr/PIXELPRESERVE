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
    <div role="tabpanel">
      <div className="flex items-end justify-between gap-5 max-[700px]:items-start max-[700px]:flex-col max-[700px]:gap-2">
        <div>
          <span className="font-mono text-base tracking-[0.12em] text-[#157c62]">
            SELLER SAFETY / LOCAL SCAN
          </span>
          <h3 className="mt-2 text-[30px] leading-[1.08] font-medium tracking-[-1.2px]">
            Message পাঠান, red flag ধরুন.
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[#b9d8c5] bg-[#f0f8f2] px-3 py-1.5 font-mono text-sm tracking-[0.08em] text-[#157c62] min-[521px]:inline-flex">
            ● LIVE / PRIVATE
          </span>
          <span className="font-mono text-base text-[#71807b]">
            {message.length} chars
          </span>
        </div>
      </div>
      <div className="mt-4.75 grid items-stretch gap-3.5 min-[901px]:grid-cols-2">
        <section
          className={`flex flex-col rounded-xl border p-4 shadow-[0_16px_34px_#8d4e3210] ${hasInputError ? "border-[#e4a39a] bg-[#fff4f2]" : "border-[#dce5df] bg-[#fffaf4]"}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className={`font-mono text-base tracking-widest ${hasInputError ? "text-[#b34635]" : "text-[#71807b]"}`}
            >
              ORIGINAL MESSAGE
            </span>
            {message.trim() ? (
              <span
                className={`rounded-full px-2.5 py-1 text-sm font-medium ${hasInputError ? "bg-[#f9d9d4] text-[#b34635]" : "bg-[#dff1e6] text-[#157c62]"}`}
              >
                {hasInputError ? "Review needed" : "Looks clear"}
              </span>
            ) : null}
          </div>
          <textarea
            className={`mt-3 block min-h-52.5 w-full flex-1 resize-y rounded-lg border bg-white p-4 text-base leading-[1.7] text-[#17201e] outline-0 ${hasInputError ? "border-[#e4a39a] focus:border-[#b34635] focus:shadow-[0_0_0_3px_#b3463526]" : "border-[#dce5df] focus:border-[#dfb883] focus:shadow-[0_0_0_3px_#dfb88326]"}`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Fiverr buyer-এর message এখানে paste করুন…"
            aria-label="Fiverr message input"
            aria-invalid={hasInputError}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            {hasInputError ? (
              <p className="rounded-lg border border-[#e4a39a] bg-[#fffaf4] px-3 py-2 text-base text-[#b34635]">
                Restricted word পাওয়া গেছে: {restrictedWords.join(", ")}
              </p>
            ) : (
              <p className="text-base text-[#71807b]">
                Full message-এর restricted word-এর দ্বিতীয় অক্ষরের পরে hyphen
                যোগ হবে।
              </p>
            )}
            <button
              className="shrink-0 rounded-lg border border-[#dce5df] bg-white px-3 py-2 text-base font-medium text-[#71807b] shadow-[0_4px_10px_#224c3d0a] transition hover:-translate-y-0.5 hover:border-[#a8d1ba] hover:text-[#17201e] focus-visible:ring-2 focus-visible:ring-[#157c62] focus-visible:ring-offset-2"
              onClick={() => setMessage("")}
              type="button"
            >
              Clear <span>×</span>
            </button>
          </div>
        </section>
        <section className="flex min-h-62.5 flex-col rounded-xl border border-[#b9d8c5] bg-[#f0f8f2] p-4 shadow-[0_16px_34px_#157c6214]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-base tracking-widest text-[#157c62]">
              UPDATED MESSAGE
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#157c62] bg-[#157c62] px-3.5 py-2.5 text-base font-medium text-white shadow-[0_7px_16px_#157c6238] transition hover:-translate-y-0.5 hover:bg-[#10664f] hover:shadow-[0_10px_20px_#157c6245] focus-visible:ring-2 focus-visible:ring-[#157c62] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#b9d8c5] disabled:bg-[#b9d8c5] disabled:shadow-none"
              onClick={() => void copyResult()}
              disabled={!result}
              type="button"
            >
              <span aria-hidden="true">▣</span> {copyLabel}
            </button>
          </div>
          <div className="mt-3 flex flex-1 rounded-lg border border-[#b9d8c5] bg-white p-4 shadow-[inset_0_1px_3px_#224c3d0a]">
            {result ? (
              <p className="whitespace-pre-wrap text-base leading-[1.7] text-[#17201e]">
                {result.safeRewrite}
              </p>
            ) : (
              <div className="m-auto text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#e4f3e8] text-xl text-[#157c62] shadow-[0_8px_16px_#157c6218]">
                  ✦
                </span>
                <p className="mt-3 text-base text-[#71807b]">
                  Input-এ message লিখলে updated message এখানে দেখা যাবে।
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
