"use client";

import { useCallback, useRef, useState } from "react";
import { useToast } from "./Toast";

type Mode = "encode" | "decode";

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const processText = useCallback(
    (text: string, operation: Mode) => {
      if (!text.trim()) {
        setOutput("");
        setError("");
        return;
      }
      try {
        if (operation === "encode") {
          const encoded = btoa(
            new TextEncoder()
              .encode(text)
              .reduce((data, byte) => data + String.fromCharCode(byte), ""),
          );
          setOutput(encoded);
          setError("");
        } else {
          const decoded = new TextDecoder().decode(
            Uint8Array.from(atob(text), (char) => char.charCodeAt(0)),
          );
          setOutput(decoded);
          setError("");
        }
      } catch {
        setError(
          operation === "decode"
            ? "Invalid Base64 string — could not decode"
            : "Encoding failed",
        );
        setOutput("");
      }
    },
    [],
  );

  function handleInputChange(value: string) {
    setInput(value);
    processText(value, mode);
  }

  function handleModeSwitch(newMode: Mode) {
    setMode(newMode);
    // Swap input/output when switching modes
    if (output && !error) {
      setInput(output);
      processText(output, newMode);
    } else {
      processText(input, newMode);
    }
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove data URL prefix to get pure base64
        const base64 = reader.result.split(",")[1] || reader.result;
        setInput(`[File: ${file.name}]`);
        setOutput(base64);
        setError("");
        setMode("encode");
        addToast(`${file.name} encoded to Base64`, "success");
      }
    };
    reader.readAsDataURL(file);
  }

  async function copyOutput() {
    if (output) {
      await navigator.clipboard.writeText(output);
      addToast("Output copied to clipboard", "success");
    }
  }

  return (
    <div role="tabpanel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-base text-[var(--accent)]">
            DATA ENCODING
          </span>
          <h3 className="mt-2 text-[30px] font-medium text-[var(--text-primary)]">
            BASE64 TOOL
          </h3>
        </div>
        <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "encode" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            onClick={() => handleModeSwitch("encode")}
            type="button"
          >
            Encode
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "decode" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            onClick={() => handleModeSwitch("decode")}
            type="button"
          >
            Decode
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 min-[901px]:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {mode === "encode" ? "PLAIN TEXT" : "BASE64 INPUT"}
            </span>
            {mode === "encode" && (
              <button
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                📁 From file
              </button>
            )}
          </div>
          <textarea
            className="block min-h-52.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-sm leading-[1.7] text-[var(--text-primary)] outline-0 focus:border-[var(--accent)]/60"
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder={
              mode === "encode"
                ? "Type or paste text to encode to Base64…"
                : "Paste Base64 string to decode…"
            }
          />
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFile}
          />
        </div>
        <div>
          <span className="block mb-2 text-sm font-medium text-[var(--text-secondary)]">
            {mode === "encode" ? "BASE64 OUTPUT" : "DECODED TEXT"}
          </span>
          <div className="min-h-52.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            {error ? (
              <p className="text-sm text-[#b34635]">{error}</p>
            ) : output ? (
              <pre className="whitespace-pre-wrap break-all font-mono text-sm leading-[1.7] text-[var(--text-primary)]">
                {output}
              </pre>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Output will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-[var(--bg-button)] bg-[var(--bg-button)] px-3.25 py-2.5 text-base text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent)]"
          onClick={() => void copyOutput()}
          type="button"
          disabled={!output}
        >
          Copy ↗
        </button>
        <button
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.25 py-2.5 text-base text-[var(--text-primary)] transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
          onClick={() => {
            setInput("");
            setOutput("");
            setError("");
          }}
          type="button"
        >
          Clear ×
        </button>
      </div>
    </div>
  );
}
