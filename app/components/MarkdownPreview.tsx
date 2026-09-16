"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "./Toast";

const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview

Write your **markdown** here and see it rendered in *real-time*.

## Features
- Live preview
- GitHub Flavored Markdown (GFM)
- Tables, code blocks, and more

| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Links   | ✅     |
| Tables  | ✅     |

\`\`\`javascript
const greeting = "Hello, PixelPreserve!";
console.log(greeting);
\`\`\`

> Tip: Real-time client-side markdown sandbox for documentation and README drafting.`;

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const { addToast } = useToast();

  async function copy() {
    if (markdown) {
      await navigator.clipboard.writeText(markdown);
      addToast("Markdown copied to clipboard", "success");
    }
  }

  async function copyHtml() {
    try {
      const container = document.getElementById("md-preview-output");
      if (container) {
        await navigator.clipboard.writeText(container.innerHTML);
        addToast("HTML copied to clipboard", "success");
      }
    } catch {
      addToast("Could not copy HTML", "error");
    }
  }

  return (
    <div role="tabpanel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-base text-[var(--accent)]">
            DOCUMENTATION
          </span>
          <h3 className="mt-2 text-[30px] font-medium text-[var(--text-primary)]">
            MARKDOWN PREVIEW
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-[var(--bg-button)] bg-[var(--bg-button)] px-3.25 py-2.5 text-sm text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent)]"
            onClick={() => void copy()}
            type="button"
          >
            Copy MD
          </button>
          <button
            className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-3.25 py-2.5 text-sm text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/15"
            onClick={() => void copyHtml()}
            type="button"
          >
            Copy HTML
          </button>
          <button
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.25 py-2.5 text-sm text-[var(--text-primary)] transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
            onClick={() => setMarkdown("")}
            type="button"
          >
            Clear ×
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 min-[901px]:grid-cols-2">
        <div>
          <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            MARKDOWN INPUT
          </span>
          <textarea
            className="block min-h-96 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-sm leading-[1.7] text-[var(--text-primary)] outline-0 focus:border-[var(--accent)]/60"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            placeholder="Type or paste your markdown here..."
          />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            LIVE PREVIEW
          </span>
          <div
            id="md-preview-output"
            className="chatbot-markdown min-h-96 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm leading-[1.7] text-[var(--text-primary)]"
          >
            {markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            ) : (
              <p className="text-[var(--text-secondary)]">
                Rendered preview will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
