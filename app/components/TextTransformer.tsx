"use client";

import { useState } from "react";
import { useToast } from "./Toast";

type CaseType =
  | "sentence"
  | "lower"
  | "upper"
  | "capitalized"
  | "alternating"
  | "title"
  | "inverse";

const caseOptions: { id: CaseType; shortcut: string; label: string }[] = [
  { id: "sentence", shortcut: "Sc", label: "Sentence case" },
  { id: "lower", shortcut: "lc", label: "lowercase" },
  { id: "upper", shortcut: "UC", label: "UPPERCASE" },
  { id: "capitalized", shortcut: "CC", label: "Capitalized Case" },
  { id: "alternating", shortcut: "aC", label: "aLtErNaTiNg cAsE" },
  { id: "title", shortcut: "TC", label: "Title Case" },
  { id: "inverse", shortcut: "iC", label: "Inverse case" },
];

function transformText(value: string, type: CaseType) {
  if (type === "lower") return value.toLowerCase();
  if (type === "upper") return value.toUpperCase();
  if (type === "inverse")
    return [...value]
      .map((character) =>
        character === character.toUpperCase()
          ? character.toLowerCase()
          : character.toUpperCase(),
      )
      .join("");
  const lower = value.toLowerCase();
  if (type === "alternating") {
    let index = 0;
    return [...value]
      .map((character) =>
        /[a-z]/i.test(character)
          ? index++ % 2
            ? character.toUpperCase()
            : character.toLowerCase()
          : character,
      )
      .join("");
  }
  return lower.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TextTransformer() {
  const [text, setText] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseType>("sentence");
  const { addToast } = useToast();

  async function copy(value: string) {
    if (value) {
      await navigator.clipboard.writeText(value);
      addToast("Text copied to clipboard", "success");
    }
  }

  return (
    <div role="tabpanel">
      <div className="flex justify-between">
        <span className="font-mono text-base text-[var(--accent)]">
          CASE CONVERSION
        </span>
        <span className="font-mono text-base text-[var(--text-secondary)]">
          {text.length} character(s)
        </span>
      </div>
      <textarea
        className="mt-4.75 block min-h-52.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4.25 font-mono text-base leading-[1.7] text-[var(--text-primary)] outline-0 focus:border-[var(--accent)]/60"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type or paste your text here…"
      />
      <div className="mt-3 grid grid-cols-2 gap-2 min-[701px]:grid-cols-4">
        {caseOptions.map((option) => (
          <button
            className={`grid gap-1 rounded-[9px] border p-2.5 text-left transition ${selectedCase === option.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)]"}`}
            key={option.id}
            onClick={() => {
              setSelectedCase(option.id);
              setText((current) => transformText(current, option.id));
            }}
            type="button"
          >
            <b className="font-mono text-base text-[var(--accent)]">
              {option.shortcut}
            </b>
            <span className="text-base text-[var(--text-primary)]">{option.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-3.5 flex gap-2">
        <button
          className="rounded-lg border border-[var(--bg-button)] bg-[var(--bg-button)] px-3.25 py-2.5 text-base text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent)]"
          onClick={() => void copy(text)}
          type="button"
        >
          Copy ↗
        </button>
        <button
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.25 py-2.5 text-base text-[var(--text-primary)] transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
          onClick={() => setText("")}
          type="button"
        >
          Clear ×
        </button>
      </div>
    </div>
  );
}
