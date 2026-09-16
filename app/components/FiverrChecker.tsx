"use client";

import { useState } from "react";
import { useToast } from "./Toast";

// Fiverr safety rule substitutions dictionary
const fiverrRules: Record<string, string> = {
  // --- Existing Words ---
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

  // --- Added Missing Restricted Words ---
  // Contact & Communication Methods
  contact: "con-tact",
  number: "num-ber",
  address: "add-ress",
  site: "si-te",
  website: "web-site",
  meet: "me-et",
  google: "goo-gle",
  anydesk: "any-desk",
  teamviewer: "team-viewer",
  slack: "sla-ck",
  wechat: "we-chat",
  line: "li-ne",
  imo: "i-mo",

  // Payment & Financial Terms
  dollar: "dol-lar",
  money: "mon-ey",
  fee: "f-ee",
  cash: "ca-sh",
  transfer: "trans-fer",
  stripe: "stri-pe",
  wise: "wi-se",
  wire: "wi-re",
  usdt: "us-dt",
  binance: "bin-ance",
  wallet: "wal-let",
  cheque: "che-que",
  card: "ca-rd",

  // Review & Rating Manipulation (Very Strict)
  review: "re-view",
  rating: "rat-ing",
  feedback: "feed-back",
  star: "st-ar",
  five: "fi-ve",

  // Off-platform terms
  outside: "out-side",
  offplatform: "off-platform",
  direct: "di-rect",
  contract: "con-tract",
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
  const { addToast } = useToast();
  const restrictedWords = findFiverrRestrictedWords(message);
  const hasInputError = restrictedWords.length > 0;
  const safeRewrite = message.trim() ? rewriteFiverrMessage(message) : "";

  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  async function copyResult() {
    if (!safeRewrite) return;
    await navigator.clipboard.writeText(safeRewrite);
    addToast({ message: "Safe message copied to clipboard!", type: "success" });
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy safe message"), 1200);
  }

  return (
    <div role="tabpanel" className="mx-auto w-full max-w-7xl">
      {/* Top Info Bar */}
      <div className="mb-8 flex flex-col items-start justify-between gap-5 min-[701px]:flex-row min-[701px]:items-center">
        <div className="min-w-0">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)] min-[701px]:text-sm">
            Fiverr / Message Safety
          </span>
          <h1 className="mt-2 max-w-full wrap-break-word text-2xl font-medium leading-[1.12] tracking-[-0.04em] text-[var(--text-primary)] min-[701px]:whitespace-nowrap min-[701px]:text-[30px]">
            Fiverr message checker
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-[1.6] text-[var(--text-secondary)] min-[701px]:text-base">
            Clean restricted communication and payment terms before sending.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-start gap-2.5 min-[701px]:w-auto min-[701px]:flex-col min-[701px]:items-end">
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-3.5 py-1.5 font-mono text-xs tracking-[0.08em] text-[var(--accent)] min-[701px]:inline-flex min-[701px]:text-sm">
              ● LIVE / PRIVATE
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] min-[701px]:text-sm">
              {wordCount} words / {message.length} chars
            </span>
          </div>
          <span className="font-mono text-xs tracking-[0.03em] text-[var(--text-secondary)] min-[701px]:text-sm">
            BROWSER ONLY / PRIVATE
          </span>
        </div>
      </div>

      {/* Main Grid Boxes */}
      <div className="grid items-stretch gap-6 min-[901px]:grid-cols-2">
        {/* Original Message Section */}
        <section
          className={`flex flex-col rounded-2xl border p-5 transition-colors duration-200 ${hasInputError ? "border-[var(--status-danger)] bg-[var(--status-danger-bg)]" : "border-[var(--border)] bg-[var(--bg-card)]"}`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span
              className={`font-mono text-sm sm:text-base tracking-widest font-semibold ${hasInputError ? "text-[var(--status-danger)]" : "text-[var(--text-secondary)]"}`}
            >
              ORIGINAL MESSAGE
            </span>
            {message.trim() ? (
              <span
                className={`rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${hasInputError ? "border border-[var(--status-danger)]/30 bg-[var(--status-danger-bg)] text-[var(--status-danger)]" : "border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] text-[var(--accent)]"}`}
              >
                {hasInputError ? "Review needed" : "Looks clear"}
              </span>
            ) : null}
          </div>

          <textarea
            className={`block min-h-90 w-full flex-1 resize-y rounded-xl border bg-[var(--bg-surface)] p-4 text-base leading-[1.7] text-[var(--text-primary)] outline-0 transition-colors ${hasInputError ? "border-[var(--status-danger)] focus:border-[var(--status-danger)] focus:ring-2 focus:ring-[var(--status-danger)]/20" : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"}`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Paste client or buyer message here…"
            aria-label="Fiverr message input"
            aria-invalid={hasInputError}
          />

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
            {hasInputError ? (
              <p className="rounded-lg border border-[var(--status-danger)]/40 bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--status-danger)]">
                Restricted word(s) detected: {restrictedWords.join(", ")}
              </p>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Restricted words will be automatically sanitized according to platform safety guidelines.
              </p>
            )}
            <button
              className="w-full sm:w-auto shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] active:translate-y-0"
              onClick={() => setMessage("")}
              type="button"
            >
              Clear <span className="text-base ml-1">×</span>
            </button>
          </div>
        </section>

        {/* Updated Message Section */}
        <section className="flex min-h-70 flex-col rounded-2xl border border-[var(--accent-soft-border)] bg-[var(--accent-soft)]/40 p-5 transition-colors duration-200">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="font-mono text-sm sm:text-base tracking-widest text-[var(--accent)] font-semibold">
              UPDATED MESSAGE
            </span>
          </div>

          <div className="flex flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 min-h-55">
            {safeRewrite ? (
              <p className="whitespace-pre-wrap text-base leading-[1.7] text-[var(--text-primary)] w-full">
                {safeRewrite}
              </p>
            ) : (
              <div className="m-auto text-center p-6">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] text-xl text-[var(--accent)]">
                  ✦
                </span>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)]">
                  Type or paste a message on the left to see the safe rewrite here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end pt-3 border-t border-[var(--border)]">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-5 py-2.5 text-sm sm:text-base font-medium text-white transition hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)]"
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
