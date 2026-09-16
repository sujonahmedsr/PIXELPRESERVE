"use client";

import { useEffect, useState } from "react";
import { useToast } from "./Toast";

// Lightweight RFC 1321 compliant MD5 implementation
function md5(str: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRol(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;

    for (let i = 0; i < x.length; i += 16) {
      const olda = a;
      const oldb = b;
      const oldc = c;
      const oldd = d;

      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }

  function rstr2binl(input: string): number[] {
    const output: number[] = [];
    for (let i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
    }
    return output;
  }

  function binl2hex(binarray: number[]): string {
    const hexTab = "0123456789abcdef";
    let str = "";
    for (let i = 0; i < binarray.length * 4; i++) {
      str +=
        hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0x0f) +
        hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0x0f);
    }
    return str;
  }

  // UTF-8 encode
  const utf8 = unescape(encodeURIComponent(str));
  return binl2hex(binlMD5(rstr2binl(utf8), utf8.length * 8));
}

type TabType = "hash" | "uuid" | "timestamp";

export function CryptoToolkit() {
  const [activeTab, setActiveTab] = useState<TabType>("hash");
  const { success } = useToast();

  // Hash & HMAC State
  const [hashInput, setHashInput] = useState("Hello, PixelPreserve!");
  const [algorithm, setAlgorithm] = useState<"SHA-256" | "SHA-512" | "SHA-384" | "SHA-1" | "MD5">("SHA-256");
  const [hmacSecret, setHmacSecret] = useState("");
  const [hexResult, setHexResult] = useState("");
  const [base64Result, setBase64Result] = useState("");
  const [isHashing, setIsHashing] = useState(false);

  // UUID & Token State
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uppercaseUuid, setUppercaseUuid] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [tokenByteLength, setTokenByteLength] = useState<number>(32);
  const [generatedToken, setGeneratedToken] = useState<string>("");

  // Timestamp Converter State
  const [currentEpoch, setCurrentEpoch] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [isLiveClock, setIsLiveClock] = useState(true);
  const [timestampInput, setTimestampInput] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().slice(0, 16));

  // Live ticking epoch clock
  useEffect(() => {
    if (!isLiveClock) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveClock]);

  // Compute Hashes and HMAC
  useEffect(() => {
    let isCancelled = false;

    async function calculateHash() {
      if (!hashInput) {
        setHexResult("");
        setBase64Result("");
        return;
      }

      setIsHashing(true);
      try {
        if (algorithm === "MD5") {
          const result = md5(hashInput);
          if (!isCancelled) {
            setHexResult(result);
            // Convert hex to base64
            const raw = result.match(/\w{2}/g)?.map((a) => String.fromCharCode(parseInt(a, 16))).join("") || "";
            setBase64Result(btoa(raw));
          }
        } else {
          const encoder = new TextEncoder();
          const data = encoder.encode(hashInput);

          let buffer: ArrayBuffer;

          if (hmacSecret.trim()) {
            // HMAC
            const keyData = encoder.encode(hmacSecret);
            const key = await window.crypto.subtle.importKey(
              "raw",
              keyData,
              { name: "HMAC", hash: { name: algorithm } },
              false,
              ["sign"]
            );
            buffer = await window.crypto.subtle.sign("HMAC", key, data);
          } else {
            // Standard Digest
            buffer = await window.crypto.subtle.digest(algorithm, data);
          }

          if (!isCancelled) {
            const bytes = new Uint8Array(buffer);
            // Hex string
            const hex = Array.from(bytes)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
            setHexResult(hex);

            // Base64
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            setBase64Result(btoa(binary));
          }
        }
      } catch {
        if (!isCancelled) {
          setHexResult("Calculation error");
          setBase64Result("");
        }
      } finally {
        if (!isCancelled) setIsHashing(false);
      }
    }

    calculateHash();
    return () => {
      isCancelled = true;
    };
  }, [hashInput, algorithm, hmacSecret]);

  // Generate UUIDs
  function generateNewUuids() {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let id = crypto.randomUUID();
      if (removeHyphens) id = id.replace(/-/g, "");
      if (uppercaseUuid) id = id.toUpperCase();
      list.push(id);
    }
    setGeneratedUuids(list);
  }

  // Generate Secure Random Secret Token
  function generateSecretToken() {
    const array = new Uint8Array(tokenByteLength);
    crypto.getRandomValues(array);
    const hex = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setGeneratedToken(hex);
  }

  // Initial UUID / token creation on mount
  useEffect(() => {
    generateNewUuids();
    generateSecretToken();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied!`);
  };

  // Convert input timestamp to various date strings
  const parsedTimestampInfo = (() => {
    const num = Number(timestampInput.trim());
    if (isNaN(num) || num <= 0) return null;
    const isMilliseconds = num > 10000000000;
    const date = new Date(isMilliseconds ? num : num * 1000);
    if (isNaN(date.getTime())) return null;

    const diffMs = date.getTime() - Date.now();
    const isPast = diffMs < 0;
    const absDiff = Math.abs(diffMs);
    const diffSec = Math.floor(absDiff / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = "";
    if (diffDays > 0) relative = `${diffDays} days`;
    else if (diffHours > 0) relative = `${diffHours} hours`;
    else if (diffMin > 0) relative = `${diffMin} minutes`;
    else relative = `${diffSec} seconds`;

    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      relative: isPast ? `${relative} ago` : `in ${relative}`,
      isMilliseconds,
    };
  })();

  // Convert custom date input to timestamps
  const parsedDateInfo = (() => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return {
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    };
  })();

  return (
    <div className="space-y-6">
      {/* Header & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Backend Crypto &amp; Token Suite
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Essential cryptographic hashes, HMAC signatures, UUID generator, and Unix epoch converter.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("hash")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition ${
              activeTab === "hash"
                ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Hash &amp; HMAC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("uuid")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition ${
              activeTab === "uuid"
                ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            UUID &amp; Keys
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timestamp")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition ${
              activeTab === "timestamp"
                ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Unix Timestamp
          </button>
        </div>
      </div>

      {/* TAB 1: HASH & HMAC */}
      {activeTab === "hash" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Controls and Input */}
              <div className="space-y-4 lg:col-span-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="hash-algorithm-select"
                      className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Algorithm
                    </label>
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">Web Crypto API</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["SHA-256", "SHA-512", "SHA-384", "SHA-1", "MD5"] as const).map((alg) => (
                      <button
                        key={alg}
                        type="button"
                        onClick={() => setAlgorithm(alg)}
                        className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition ${
                          algorithm === alg
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {alg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="hash-input-text"
                    className="mb-1.5 block font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Payload / Plaintext
                  </label>
                  <textarea
                    id="hash-input-text"
                    rows={4}
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter string to hash..."
                    className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 font-mono text-xs text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                {algorithm !== "MD5" && (
                  <div>
                    <label
                      htmlFor="hmac-secret-input"
                      className="mb-1.5 flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      <span>HMAC Secret Key (Optional)</span>
                      <span className="text-[10px] font-normal lowercase text-[var(--text-secondary)]">
                        leave blank for standard hash
                      </span>
                    </label>
                    <input
                      id="hmac-secret-input"
                      type="text"
                      value={hmacSecret}
                      onChange={(e) => setHmacSecret(e.target.value)}
                      placeholder="e.g. whsec_908f2a1b... for webhook verification"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Outputs */}
              <div className="space-y-4 lg:col-span-6">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {hmacSecret ? `HMAC-${algorithm} (Hex)` : `${algorithm} Digest (Hex)`}
                    </span>
                    <button
                      type="button"
                      disabled={!hexResult}
                      onClick={() => copyToClipboard(hexResult, "Hex Hash")}
                      className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] disabled:opacity-40"
                    >
                      Copy Hex
                    </button>
                  </div>
                  <div className="break-all rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
                    {isHashing ? "Computing..." : hexResult || "No output"}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Base64 Encoded Hash
                    </span>
                    <button
                      type="button"
                      disabled={!base64Result}
                      onClick={() => copyToClipboard(base64Result, "Base64 Hash")}
                      className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] disabled:opacity-40"
                    >
                      Copy Base64
                    </button>
                  </div>
                  <div className="break-all rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 font-mono text-xs leading-relaxed text-[var(--accent)]">
                    {isHashing ? "Computing..." : base64Result || "No output"}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-xs text-[var(--text-secondary)]">
                  💡 <strong>Backend Use Case:</strong> Compute checksums, password hashes, and verify signatures for webhooks from Stripe, GitHub, Shopify, and Slack using client-side HMAC.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UUID & TOKEN GENERATOR */}
      {activeTab === "uuid" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* UUID Generator */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
                    UUID v4 Generator
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Cryptographically strong v4 random identifiers
                  </p>
                </div>

                <button
                  type="button"
                  onClick={generateNewUuids}
                  className="rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--accent)] transition hover:opacity-90"
                >
                  Generate New
                </button>
              </div>

              {/* Options */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)]">
                  <span>Count:</span>
                  {[1, 5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setUuidCount(num);
                        const list: string[] = [];
                        for (let i = 0; i < num; i++) {
                          let id = crypto.randomUUID();
                          if (removeHyphens) id = id.replace(/-/g, "");
                          if (uppercaseUuid) id = id.toUpperCase();
                          list.push(id);
                        }
                        setGeneratedUuids(list);
                      }}
                      className={`rounded px-2 py-0.5 font-semibold ${
                        uuidCount === num
                          ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={uppercaseUuid}
                    onChange={(e) => {
                      setUppercaseUuid(e.target.checked);
                      setGeneratedUuids((prev) =>
                        prev.map((id) => (e.target.checked ? id.toUpperCase() : id.toLowerCase()))
                      );
                    }}
                    className="accent-[var(--accent)]"
                  />
                  Uppercase
                </label>

                <label className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={removeHyphens}
                    onChange={(e) => {
                      setRemoveHyphens(e.target.checked);
                      generateNewUuids();
                    }}
                    className="accent-[var(--accent)]"
                  />
                  No Hyphens
                </label>
              </div>

              {/* UUID List */}
              <div className="space-y-2">
                {generatedUuids.map((uuid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-xs"
                  >
                    <span className="truncate text-[var(--text-primary)]">{uuid}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(uuid, "UUID")}
                      className="ml-2 shrink-0 text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      title="Copy"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>

              {generatedUuids.length > 1 && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedUuids.join("\n"), "All UUIDs")}
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-2 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                >
                  Copy All ({generatedUuids.length} UUIDs)
                </button>
              )}
            </div>

            {/* Secret API Key Generator */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-500">
                    Random Secret &amp; API Key
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Entropy generated with window.crypto.getRandomValues
                  </p>
                </div>

                <button
                  type="button"
                  onClick={generateSecretToken}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-amber-500 transition hover:bg-amber-500/20"
                >
                  Generate Key
                </button>
              </div>

              {/* Entropy selector */}
              <div className="mb-4 flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
                <span>Entropy:</span>
                {[16, 32, 64].map((bytes) => (
                  <button
                    key={bytes}
                    type="button"
                    onClick={() => {
                      setTokenByteLength(bytes);
                      const array = new Uint8Array(bytes);
                      crypto.getRandomValues(array);
                      const hex = Array.from(array)
                        .map((b) => b.toString(16).padStart(2, "0"))
                        .join("");
                      setGeneratedToken(hex);
                    }}
                    className={`rounded px-2.5 py-1 font-semibold ${
                      tokenByteLength === bytes
                        ? "border border-amber-500/40 bg-amber-500/10 text-amber-500"
                        : "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {bytes * 8}-bit ({bytes} bytes)
                  </button>
                ))}
              </div>

              <div className="break-all rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
                {generatedToken}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedToken, "Secret Key")}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-2 font-mono text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                >
                  Copy Hex Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const bearer = `Bearer ${generatedToken}`;
                    copyToClipboard(bearer, "Bearer Token");
                  }}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-2 font-mono text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                >
                  Copy as Bearer Token
                </button>
              </div>

              <p className="mt-4 text-xs text-[var(--text-secondary)]">
                Ideal for <code>JWT_SECRET</code>, database encryption keys, session cookies, and webhook signing secrets in your <code>.env</code> file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNIX TIMESTAMP CONVERTER */}
      {activeTab === "timestamp" && (
        <div className="space-y-6">
          {/* Current Live Epoch Banner */}
          <div className="flex flex-wrap items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Current Unix Epoch (Seconds)
                </span>
              </div>
              <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-[var(--accent)]">
                {currentEpoch}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Milliseconds: {currentEpoch * 1000}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLiveClock(!isLiveClock)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              >
                {isLiveClock ? "Pause Clock" : "Resume Live"}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(currentEpoch.toString(), "Current Epoch")}
                className="rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--accent)] transition hover:opacity-90"
              >
                Copy Epoch
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Timestamp to Date */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <h3 className="mb-2 font-mono text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
                Timestamp &rarr; Human Date
              </h3>

              <div className="mb-3">
                <label
                  htmlFor="timestamp-to-date-input"
                  className="mb-1 block font-mono text-xs text-[var(--text-secondary)]"
                >
                  Enter Unix Timestamp (Seconds or Milliseconds)
                </label>
                <div className="flex gap-2">
                  <input
                    id="timestamp-to-date-input"
                    type="text"
                    value={timestampInput}
                    onChange={(e) => setTimestampInput(e.target.value)}
                    placeholder="e.g. 1737458400"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTimestampInput(Math.floor(Date.now() / 1000).toString())}
                    className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                  >
                    Now
                  </button>
                </div>
              </div>

              {parsedTimestampInfo ? (
                <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 font-mono text-xs">
                  <div>
                    <span className="text-[var(--text-secondary)]">Format Detected:</span>{" "}
                    <strong className="text-[var(--text-primary)]">
                      {parsedTimestampInfo.isMilliseconds ? "Milliseconds (13 digits)" : "Seconds (10 digits)"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">ISO 8601:</span>{" "}
                    <strong className="text-[var(--accent)]">{parsedTimestampInfo.iso}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">UTC String:</span>{" "}
                    <strong className="text-[var(--text-primary)]">{parsedTimestampInfo.utc}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Local Time:</span>{" "}
                    <strong className="text-[var(--text-primary)]">{parsedTimestampInfo.local}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Relative:</span>{" "}
                    <strong className="text-emerald-500">{parsedTimestampInfo.relative}</strong>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-xs text-[var(--text-secondary)]">
                  Enter a valid numeric epoch timestamp above.
                </div>
              )}
            </div>

            {/* Date to Timestamp */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <h3 className="mb-2 font-mono text-sm font-bold uppercase tracking-wider text-amber-500">
                Human Date &rarr; Timestamp
              </h3>

              <div className="mb-3">
                <label
                  htmlFor="date-to-timestamp-input"
                  className="mb-1 block font-mono text-xs text-[var(--text-secondary)]"
                >
                  Select Date &amp; Time
                </label>
                <div className="flex gap-2">
                  <input
                    id="date-to-timestamp-input"
                    type="datetime-local"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setDateInput(new Date().toISOString().slice(0, 16))}
                    className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                  >
                    Now
                  </button>
                </div>
              </div>

              {parsedDateInfo ? (
                <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[var(--text-secondary)]">Unix Seconds (10-digit):</div>
                      <div className="text-sm font-bold text-[var(--accent)]">{parsedDateInfo.seconds}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(parsedDateInfo.seconds.toString(), "Seconds Timestamp")}
                      className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="border-t border-[var(--border)] pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-[var(--text-secondary)]">Unix Milliseconds (13-digit):</div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{parsedDateInfo.milliseconds}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(parsedDateInfo.milliseconds.toString(), "Milliseconds Timestamp")}
                      className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-xs text-[var(--text-secondary)]">
                  Pick a date and time above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
