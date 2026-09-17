"use client";

import { useCallback, useRef, useState } from "react";
import { useToast } from "./Toast";

type Mode = "encode" | "decode";

const BASE64_SAMPLES = [
  {
    label: "Plaintext Text",
    type: "encode" as Mode,
    text: "Hello, World! SHOFIDEV_TOOLS Developer Suite makes client-side utilities fast and private.",
  },
  {
    label: "JSON Payload",
    type: "encode" as Mode,
    text: JSON.stringify(
      { userId: 1042, role: "admin", active: true },
      null,
      2,
    ),
  },
  {
    label: "Basic Auth (user:pass)",
    type: "encode" as Mode,
    text: "admin_user:SuperSecretPassword123!",
  },
  {
    label: "Encoded Base64 Sample",
    type: "decode" as Mode,
    text: "UGl4ZWxQcmVzZXJ2ZSBpcyBhIDEwMCUgcHJpdmFjeS1maXJzdCBkZXZlbG9wZXIgdG9vbGtpdCE=",
  },
];

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError } = useToast();

  const processText = useCallback((text: string, operation: Mode) => {
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
        // Clean base64 (remove data URI prefixes if user pasted one)
        let clean = text.trim();
        if (clean.includes("base64,")) {
          clean = clean.split("base64,")[1];
        }
        const decoded = new TextDecoder().decode(
          Uint8Array.from(atob(clean), (char) => char.charCodeAt(0)),
        );
        setOutput(decoded);
        setError("");
      }
    } catch {
      setError(
        operation === "decode"
          ? "Invalid Base64 string — verify that the string contains valid Base64 characters (A-Z, a-z, 0-9, +, /, =)."
          : "Encoding failed — input text contains unsupported characters.",
      );
      setOutput("");
    }
  }, []);

  function handleInputChange(value: string) {
    setInput(value);
    processText(value, mode);
  }

  function handleModeSwitch(newMode: Mode) {
    setMode(newMode);
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
      const result = reader.result;
      if (typeof result === "string") {
        setInput(result);
        setOutput(result);
        setError("");
        success(`${file.name} encoded to Base64 data URI!`);
      }
    };
    reader.onerror = () => {
      toastError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  }

  async function copyOutput() {
    if (output) {
      await navigator.clipboard.writeText(output);
      success("Output copied to clipboard!");
    }
  }

  return (
    <div role="tabpanel" className="space-y-6">
      {/* Header and Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Base64 Encoder &amp; Decoder
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Convert strings and files to/from RFC 4648 Base64 format with UTF-8
            support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition ${
              showGuide
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
            }`}
          >
            {showGuide ? "Hide Guide" : "💡 What is Base64?"}
          </button>

          <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1">
            <button
              className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition ${
                mode === "encode"
                  ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              onClick={() => handleModeSwitch("encode")}
              type="button"
            >
              Encode
            </button>
            <button
              className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition ${
                mode === "decode"
                  ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              onClick={() => handleModeSwitch("decode")}
              type="button"
            >
              Decode
            </button>
          </div>
        </div>
      </div>

      {/* Quick Example Samples */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Quick Samples:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BASE64_SAMPLES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                setMode(sample.type);
                setInput(sample.text);
                processText(sample.text, sample.type);
              }}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            >
              {sample.label} ({sample.type})
            </button>
          ))}
        </div>
      </div>

      {/* Educational Guide & Use Cases */}
      {showGuide && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
              Understanding Base64 Encoding
            </h3>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Close ×
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 font-mono text-xs">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5">
              <div className="font-bold text-[var(--text-primary)]">
                1. Why Encode?
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                Base64 translates binary data into 64 ASCII characters (A-Z,
                a-z, 0-9, +, /). This allows binary files (images, audio, keys)
                to be safely transferred through text-only mediums (JSON,
                emails, HTML).
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5">
              <div className="font-bold text-[var(--text-primary)]">
                2. Data URIs in CSS/HTML
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                You can inline small icons directly into CSS: <br />
                <code className="text-[var(--accent)]">
                  data:image/png;base64,iVBORw0...
                </code>
                <br />
                This eliminates extra HTTP network requests for tiny assets.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5">
              <div className="font-bold text-[var(--text-primary)]">
                3. HTTP Basic Auth
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                APIs often use Base64 for credentials:
                <br />
                <code className="text-[var(--accent)]">
                  Authorization: Basic [base64(user:pass)]
                </code>
                <br />
                Note: Base64 is an encoding, NOT encryption. Never use it alone
                for security!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input and Output Split Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]">
            <span className="font-semibold uppercase tracking-wider">
              {mode === "encode" ? "Plaintext Input" : "Base64 Encoded Input"}
            </span>
            {mode === "encode" && (
              <button
                className="font-semibold text-[var(--accent)] hover:underline"
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                📁 Upload &amp; Encode File
              </button>
            )}
          </div>
          <textarea
            className="min-h-[300px] w-full flex-1 resize-y rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-xs leading-relaxed text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none"
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder={
              mode === "encode"
                ? "Type or paste text to encode to Base64 (or click Upload & Encode File)..."
                : "Paste Base64 string to decode back into plain text..."
            }
          />
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Output Card */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]">
            <span className="font-semibold uppercase tracking-wider">
              {mode === "encode"
                ? "Base64 Encoded Result"
                : "Decoded Plaintext Result"}
            </span>
            {output && <span>{output.length} characters</span>}
          </div>
          <div className="min-h-[300px] w-full flex-1 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
            {error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-500">
                {error}
              </p>
            ) : output ? (
              <pre className="whitespace-pre-wrap break-all font-mono">
                {output}
              </pre>
            ) : (
              <p className="text-[var(--text-secondary)]">
                Output will appear here automatically...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 font-mono text-xs font-semibold text-[var(--accent)] transition hover:opacity-90 disabled:opacity-40"
          onClick={() => void copyOutput()}
          type="button"
          disabled={!output}
        >
          Copy Result
        </button>
        <button
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          onClick={() => {
            setInput("");
            setOutput("");
            setError("");
          }}
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
