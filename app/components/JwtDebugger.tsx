"use client";

import { useMemo, useState } from "react";
import { useToast } from "./Toast";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

function formatUnixTimestamp(timestampSec: number): string {
  try {
    const date = new Date(timestampSec * 1000);
    return isNaN(date.getTime()) ? "Invalid date" : date.toUTCString();
  } catch {
    return "Invalid date";
  }
}

function formatRelativeTime(timestampSec: number): { text: string; isExpired: boolean } {
  const diffMs = timestampSec * 1000 - Date.now();
  const isExpired = diffMs < 0;
  const absDiff = Math.abs(diffMs);
  const diffSec = Math.floor(absDiff / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  let unit = "";
  if (diffDays > 0) unit = `${diffDays}d ${diffHours % 24}h`;
  else if (diffHours > 0) unit = `${diffHours}h ${diffMin % 60}m`;
  else if (diffMin > 0) unit = `${diffMin}m ${diffSec % 60}s`;
  else unit = `${diffSec}s`;

  return {
    text: isExpired ? `Expired (${unit} ago)` : `Active (Expires in ${unit})`,
    isExpired,
  };
}

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiJ1c3JfOWEyODQ3Y2QiLCJuYW1lIjoiQWxleGFuZGVyIE1lcmNlciIsImVtYWlsIjoiZGV2QH" +
  "BpeGVscHJlc2VydmUuZGV2Iiwicm9sZXMiOlsic3VwZXJhZG1pbiIsImRldmVsb3BlciJdLCJpc3MiOiJo" +
  "dHRwczovL2FwaS5waXhlbHByZXNlcnZlLmRldiIsImF1ZCI6WyJhcGkucGl4ZWxwcmVzZXJ2ZS5kZXYiLC" +
  "JjbGllbnQtYXBwIl0sImlhdCI6MTczNzQ1ODQwMCwiZXhwIjoxNzk5OTk5OTk5LCJuYmYiOjE3Mzc0NTg0" +
  "MDAsInRlbmFudF9pZCI6InRlbi1jb3JlLTAxIn0." +
  "eXyZ1234SampleSignatureNotRealVerifyOnlyClientSideABCDEFGHIJK";

export function JwtDebugger() {
  const [token, setToken] = useState("");
  const { success } = useToast();

  const decoded = useMemo(() => {
    const raw = token.trim().replace(/^Bearer\s+/i, "");
    if (!raw) {
      return { status: "empty" as const };
    }

    const parts = raw.split(".");
    if (parts.length !== 3) {
      return {
        status: "invalid" as const,
        error: `Invalid JWT format. Expected 3 dot-separated segments, found ${parts.length}.`,
      };
    }

    try {
      const headerStr = base64UrlDecode(parts[0]);
      const payloadStr = base64UrlDecode(parts[1]);
      const signature = parts[2];

      const headerObj = JSON.parse(headerStr);
      const payloadObj = JSON.parse(payloadStr);

      const exp = typeof payloadObj.exp === "number" ? payloadObj.exp : null;
      const iat = typeof payloadObj.iat === "number" ? payloadObj.iat : null;
      const nbf = typeof payloadObj.nbf === "number" ? payloadObj.nbf : null;

      const expiryStatus = exp ? formatRelativeTime(exp) : null;

      return {
        status: "valid" as const,
        header: headerObj,
        headerRaw: headerStr,
        payload: payloadObj,
        payloadRaw: payloadStr,
        signature,
        exp,
        iat,
        nbf,
        expiryStatus,
        alg: headerObj.alg || "Unknown",
        typ: headerObj.typ || "JWT",
      };
    } catch (err) {
      return {
        status: "invalid" as const,
        error: err instanceof Error ? err.message : "Failed to decode base64 or parse JSON payload.",
      };
    }
  }, [token]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold tracking-tight text-[var(--text-primary)]">
            JWT Debugger &amp; Token Inspector
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Inspect claims, check expiry status, and decode headers without any server communication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setToken(SAMPLE_JWT)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            Load Sample Token
          </button>
          {token && (
            <button
              type="button"
              onClick={() => setToken("")}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-rose-500 transition hover:border-rose-500/40"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Token Input Section */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="jwt-token-input"
            className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            Paste Encoded JWT (or Bearer Token)
          </label>
          {decoded.status === "valid" && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 py-0.5 text-[var(--accent)] font-semibold">
                ALG: {decoded.alg}
              </span>
              {decoded.expiryStatus && (
                <span
                  className={`rounded-md border px-2 py-0.5 font-semibold ${
                    decoded.expiryStatus.isExpired
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {decoded.expiryStatus.text}
                </span>
              )}
            </div>
          )}
        </div>

        <textarea
          id="jwt-token-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
          rows={4}
          className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 font-mono text-xs leading-relaxed text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none"
        />

        {decoded.status === "invalid" && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
            <strong>Error:</strong> {decoded.error}
          </div>
        )}
      </div>

      {/* Decoded Workspace */}
      {decoded.status === "valid" && (
        <div className="space-y-6">
          {/* Claims Quick Summary Grid */}
          {(decoded.exp || decoded.iat || decoded.nbf || decoded.payload.sub || decoded.payload.iss) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {decoded.exp && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                  <div className="font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                    Expires At (exp)
                  </div>
                  <div className="mt-1 font-mono text-xs font-semibold text-[var(--text-primary)]">
                    {formatUnixTimestamp(decoded.exp)}
                  </div>
                  <div
                    className={`mt-1 text-[11px] font-medium ${
                      decoded.expiryStatus?.isExpired ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {decoded.expiryStatus?.text}
                  </div>
                </div>
              )}

              {decoded.iat && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                  <div className="font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                    Issued At (iat)
                  </div>
                  <div className="mt-1 font-mono text-xs font-semibold text-[var(--text-primary)]">
                    {formatUnixTimestamp(decoded.iat)}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    Timestamp: {decoded.iat}
                  </div>
                </div>
              )}

              {decoded.payload.sub && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                  <div className="font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                    Subject (sub)
                  </div>
                  <div className="mt-1 truncate font-mono text-xs font-semibold text-[var(--text-primary)]" title={String(decoded.payload.sub)}>
                    {String(decoded.payload.sub)}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    User / Client ID
                  </div>
                </div>
              )}

              {decoded.payload.iss && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                  <div className="font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                    Issuer (iss)
                  </div>
                  <div className="mt-1 truncate font-mono text-xs font-semibold text-[var(--text-primary)]" title={String(decoded.payload.iss)}>
                    {String(decoded.payload.iss)}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    Auth Authority
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Header and Payload Split View */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Header Box */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-500">
                    Header: Algorithm &amp; Token Type
                  </h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">Metadata and signing method</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(decoded.header, null, 2), "Header JSON")
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                >
                  Copy JSON
                </button>
              </div>

              <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload Box */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                    Payload: Data &amp; Claims
                  </h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">Decoded user attributes &amp; permissions</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(decoded.payload, null, 2), "Payload JSON")
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                >
                  Copy JSON
                </button>
              </div>

              <pre className="max-h-96 overflow-y-auto overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Signature Segment */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-500">
                Signature Segment
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(decoded.signature, "Signature")}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              >
                Copy Signature
              </button>
            </div>
            <div className="break-all rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 font-mono text-xs text-[var(--text-secondary)]">
              {decoded.signature}
            </div>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              🔒 <strong>Client-Side Guarantee:</strong> Your token is never transmitted across the network. All decoding occurs strictly in your browser memory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
