"use client";

import { useState } from "react";
import { useToast } from "./Toast";

function formatJson(value: string) {
  try {
    return { value: JSON.stringify(JSON.parse(value), null, 2), error: "" };
  } catch {
    return {
      value,
      error: "Invalid JSON syntax: please check commas, quotes, and brackets.",
    };
  }
}

function minifyJson(value: string) {
  try {
    return { value: JSON.stringify(JSON.parse(value)), error: "" };
  } catch {
    return {
      value,
      error: "Invalid JSON syntax: please check commas, quotes, and brackets.",
    };
  }
}

export function JsonFormatter() {
  const [jsonText, setJsonText] = useState(
    '{"store": "SHOFIDEV_TOOLS", "private": true}',
  );
  const [jsonError, setJsonError] = useState("");
  const { addToast } = useToast();

  async function copy(value: string) {
    if (value) {
      await navigator.clipboard.writeText(value);
      addToast("JSON copied to clipboard", "success");
    }
  }

  return (
    <div role="tabpanel">
      <span className="font-mono text-base text-[var(--accent)]">
        API WORKFLOW
      </span>
      <h3 className="mt-2 text-[30px] font-medium text-[var(--text-primary)]">
        MAKE JSON READABLE.
      </h3>
      <textarea
        className="mt-4.75 block min-h-72.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4.25 font-mono text-base leading-[1.7] text-[var(--text-primary)] outline-0 focus:border-[var(--accent)]/60"
        value={jsonText}
        onChange={(event) => {
          setJsonText(event.target.value);
          setJsonError("");
        }}
      />
      <p className="mt-2 text-base text-[#b34635]">{jsonError}</p>
      <div className="mt-3.5 flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-[var(--bg-button)] bg-[var(--bg-button)] px-3.25 py-2.5 text-base text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent)]"
          onClick={() => {
            const result = formatJson(jsonText);
            setJsonText(result.value);
            setJsonError(result.error);
            if (!result.error) addToast("JSON formatted", "success");
          }}
          type="button"
        >
          Format JSON ↗
        </button>
        <button
          className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-3.25 py-2.5 text-base text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/15"
          onClick={() => {
            const result = minifyJson(jsonText);
            setJsonText(result.value);
            setJsonError(result.error);
            if (!result.error) addToast("JSON minified", "success");
          }}
          type="button"
        >
          Minify ⇣
        </button>
        <button
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.25 py-2.5 text-base text-[var(--text-primary)] transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
          onClick={() => void copy(jsonText)}
          type="button"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
