"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "./Toast";

const TEMPLATES: { label: string; content: string }[] = [
  {
    label: "README Starter",
    content: `# Project Name 🚀

A modern, fast, and lightweight web utility built with Next.js and TypeScript.

## ✨ Key Features
- **Zero-Latency Preview**: Client-side live rendering with GitHub Flavored Markdown.
- **Offline-Ready**: All data stays private in local browser memory.
- **GFM Compliant**: Full support for tables, task lists, and syntax blocks.

## 📦 Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## 📋 Task Progress
- [x] Complete core parsing engine
- [x] Add GitHub Flavored Markdown (GFM) tables
- [ ] Add dark mode export theme
- [ ] Release production bundle

## 📊 Comparison Matrix
| Feature | PixelPreserve | Standard Tools |
| :--- | :---: | :---: |
| Client-Side Privacy | ✅ 100% | ❌ Cloud Upload |
| Instant Render | ✅ Yes | ⚠️ Periodic Sync |
| Zero Page Reload | ✅ Single-Page | ❌ Refreshes |

> 💡 **Pro Tip**: Use double space at the end of a line for a soft line break.

---
Created with ❤️ by **PixelPreserve Developer Suite**.
`,
  },
  {
    label: "GFM Tables & Tasks",
    content: `# GitHub Flavored Markdown (GFM) Demo

This template demonstrates GitHub Flavored extensions including aligned tables, interactive task lists, and autolinked URLs.

### Aligned Data Table
| ID | Service / Module | Latency | Status | Notes |
| :--- | :--- | :---: | :---: | ---: |
| \`001\` | Authentication Service | 24ms | 🟢 OK | JWT verification passed |
| \`002\` | WebP Image Optimizer | 110ms | 🟢 OK | Canvas processing in-memory |
| \`003\` | Cache Invalidation | 450ms | 🟡 WARN | Rate limit at 90% |

### Interactive Checklist
- [x] Implement JWT Decoder
- [x] Build Web Crypto HMAC Suite
- [x] Add live Salah and forbidden prayer times
- [ ] Test cross-browser WebP conversion

### Inline Code & Badges
Here is a query: \`SELECT * FROM users WHERE status = 'active';\`
`,
  },
  {
    label: "Code & Blockquotes",
    content: `# Code Snippets & Blockquotes

### TypeScript Example
\`\`\`typescript
interface UserProfile {
  id: string;
  username: string;
  roles: ("admin" | "developer")[];
  createdAt: Date;
}

export function verifyUser(profile: UserProfile): boolean {
  return profile.roles.includes("developer");
}
\`\`\`

### Python Example
\`\`\`python
import hashlib

def generate_sha256(text: str) -> str:
    """Generate SHA-256 hash using hashlib"""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

print(generate_sha256("PixelPreserve"))
\`\`\`

### Nested Blockquotes & Alerts
> **Notice**: Security requirements specify that JWT secrets must have at least 256 bits of entropy.
>
> > *Sub-clause*: Avoid hardcoding production tokens in Git commits or client-side assets.
`,
  },
  {
    label: "Full Syntax Cheatsheet",
    content: `# Markdown Syntax Cheatsheet

## Typography
- **Bold text** (\`**bold**\`)
- *Italic text* (\`*italic*\`)
- ***Bold and italic*** (\`***both***\`)
- ~~Strikethrough~~ (\`~~strike~~\`)
- Subscript / Normal text with \`code spans\`

## Headings
# H1 Title (\`# H1\`)
## H2 Subtitle (\`## H2\`)
### H3 Section (\`### H3\`)
#### H4 Subsection (\`#### H4\`)

## Lists
### Unordered List
- Coffee
  - Espresso
  - Cold Brew
- Tea

### Ordered List
1. Initialize repository
2. Install dependencies
3. Launch development server

## Links & Images
- Visit [PixelPreserve](https://pixelpreserve.vercel.app)
- Image syntax: \`![Alt Text](https://example.com/image.png)\`

## Horizontal Rule
---
Divider above separating sections.
`,
  },
];

const SYNTAX_GUIDE = [
  {
    element: "Heading 1 to 4",
    syntax: "# H1\n## H2\n### H3\n#### H4",
    description: "Creates hierarchical section headers with automatic font sizing and anchor structure.",
  },
  {
    element: "Bold & Italic",
    syntax: "**bold**\n*italic*\n***bold italic***",
    description: "Emphasizes text using double asterisks for bold and single asterisks for italic.",
  },
  {
    element: "Strikethrough (GFM)",
    syntax: "~~deleted text~~",
    description: "Renders text with a horizontal line through the center to indicate deprecation.",
  },
  {
    element: "Code Block (Syntax)",
    syntax: "```javascript\nconst x = 42;\nconsole.log(x);\n```",
    description: "Fenced code block with optional language tag for styled monospaced rendering.",
  },
  {
    element: "GFM Tables",
    syntax: "| Name | Role |\n| :--- | :---: |\n| Alex | Admin |",
    description: "Creates aligned tabular data grids. Use colons for alignment (:--- left, :---: center, ---: right).",
  },
  {
    element: "Task Checkboxes",
    syntax: "- [x] Completed task\n- [ ] Pending item",
    description: "Renders interactive checklists ideal for project roadmaps, sprints, and deliverable tracking.",
  },
  {
    element: "Blockquotes",
    syntax: "> Informational tip or quotation\n> Second line",
    description: "Displays indented callout blocks with left accent border for notes and warnings.",
  },
  {
    element: "Hyperlinks",
    syntax: "[Link Label](https://example.com)",
    description: "Creates clickable web links that open securely in the browser.",
  },
  {
    element: "Horizontal Divider",
    syntax: "---",
    description: "Draws a subtle divider line to visually break up documentation sections.",
  },
];

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(TEMPLATES[0].content);
  const [showGuide, setShowGuide] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { success, error } = useToast();

  async function copy() {
    if (markdown) {
      await navigator.clipboard.writeText(markdown);
      success("Markdown copied to clipboard!");
    }
  }

  async function copyHtml() {
    try {
      const container = document.getElementById("md-preview-output");
      if (container) {
        await navigator.clipboard.writeText(container.innerHTML);
        success("HTML markup copied to clipboard!");
      }
    } catch {
      error("Could not copy HTML");
    }
  }

  function insertSyntax(prefix: string, suffix: string = "", placeholder: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || placeholder;

    const newText =
      markdown.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      markdown.substring(end);

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  }

  return (
    <div role="tabpanel" className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Markdown Live Previewer
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Real-time GitHub Flavored Markdown (GFM) editor with live preview, syntax guide, and export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition ${
              showGuide
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
            }`}
          >
            {showGuide ? "Hide Syntax Guide" : "📖 Syntax Cheatsheet"}
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-[var(--text-primary)] transition hover:border-[var(--border-hover)]"
          >
            Copy MD
          </button>
          <button
            type="button"
            onClick={() => void copyHtml()}
            className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1.5 font-mono text-xs text-[var(--accent)] transition hover:bg-[var(--accent)]/20"
          >
            Copy HTML
          </button>
          <button
            type="button"
            onClick={() => setMarkdown("")}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-rose-500 transition hover:border-rose-500/40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Starter Templates Selector */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Quick Templates:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => setMarkdown(tmpl.content)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Syntax Reference Guide (Collapsible) */}
      {showGuide && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
                Markdown &amp; GFM Syntax Reference
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Everything supported by this live editor, with code examples and rendering expectations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Close ×
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYNTAX_GUIDE.map((guide, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 font-mono text-xs"
              >
                <div className="font-bold text-[var(--text-primary)]">{guide.element}</div>
                <pre className="my-1.5 overflow-x-auto rounded border border-[var(--border)] bg-[var(--bg-surface)] p-2 text-[11px] text-[var(--accent)]">
                  {guide.syntax}
                </pre>
                <div className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                  {guide.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 font-mono text-xs">
        <button
          type="button"
          onClick={() => insertSyntax("**", "**", "bold text")}
          className="rounded px-2.5 py-1 font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
          title="Bold (**text**)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("*", "*", "italic text")}
          className="rounded px-2.5 py-1 italic text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
          title="Italic (*text*)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("~~", "~~", "strikethrough text")}
          className="rounded px-2.5 py-1 line-through text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
          title="Strikethrough (~~text~~)"
        >
          S
        </button>
        <span className="text-[var(--border)]">|</span>
        <button
          type="button"
          onClick={() => insertSyntax("# ", "", "Heading 1")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("## ", "", "Heading 2")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("### ", "", "Heading 3")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Heading 3"
        >
          H3
        </button>
        <span className="text-[var(--border)]">|</span>
        <button
          type="button"
          onClick={() => insertSyntax("```typescript\n", "\n```", "const message: string = 'Hello';")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Code Block"
        >
          &lt;/&gt; Code
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("> ", "", "Important blockquote notice.")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Blockquote"
        >
          &ldquo; Quote
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("| Header 1 | Header 2 |\n| :--- | :---: |\n| Item 1 | Value 1 |\n")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Table"
        >
          ⊞ Table
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("- [ ] ", "", "New task item")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Task Checkbox"
        >
          ☑ Task
        </button>
        <button
          type="button"
          onClick={() => insertSyntax("[", "](https://example.com)", "Link Text")}
          className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          title="Link"
        >
          🔗 Link
        </button>
      </div>

      {/* Editor & Preview Split Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Box */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]">
            <span className="font-semibold uppercase tracking-wider">Markdown Input</span>
            <span>
              {markdown.length} chars · {markdown.trim() ? markdown.trim().split(/\s+/).length : 0} words
            </span>
          </div>
          <textarea
            ref={textareaRef}
            className="min-h-[480px] w-full flex-1 resize-y rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-xs leading-[1.7] text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            placeholder="Type or paste markdown here, or pick a starter template above..."
          />
        </div>

        {/* Live Rendered Output */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]">
            <span className="font-semibold uppercase tracking-wider">Live HTML Rendered</span>
            <span className="text-[var(--accent)]">● Real-Time GFM Engine</span>
          </div>
          <div
            id="md-preview-output"
            className="chatbot-markdown min-h-[480px] w-full flex-1 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm leading-[1.7] text-[var(--text-primary)]"
          >
            {markdown.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center text-xs text-[var(--text-secondary)]">
                <span className="text-3xl">📝</span>
                <p className="mt-2 font-mono">No markdown content to preview.</p>
                <p className="mt-1 max-w-xs text-[11px]">
                  Type in the editor or click one of the quick templates above to preview live formatting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
