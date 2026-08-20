"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type Tool = "image" | "text";
type CaseType =
  | "sentence"
  | "lower"
  | "upper"
  | "capitalized"
  | "alternating"
  | "title"
  | "inverse";
type ConvertedFile = {
  name: string;
  blob: Blob;
  url: string;
  dimensions: string;
};

const caseOptions: { id: CaseType; shortcut: string; label: string }[] = [
  { id: "sentence", shortcut: "Sc", label: "বাক্যরীতি" },
  { id: "lower", shortcut: "lc", label: "ছোট হাতের অক্ষর" },
  { id: "upper", shortcut: "UC", label: "বড় হাতের অক্ষর" },
  { id: "capitalized", shortcut: "CC", label: "প্রতিটি শব্দ বড় হাতের" },
  { id: "alternating", shortcut: "aC", label: "পরপর অক্ষর বদল" },
  { id: "title", shortcut: "TC", label: "শিরোনাম রীতি" },
  { id: "inverse", shortcut: "iC", label: "উল্টো রীতি" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} বাইট`;
  const kb = bytes / 1024;
  return `${kb.toFixed(bytes < 102400 ? 0 : 1)} কিলোবাইট`;
}

function baseName(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

function transformText(value: string, type: CaseType) {
  if (type === "lower") return value.toLowerCase();
  if (type === "upper") return value.toUpperCase();
  if (type === "capitalized")
    return value
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (type === "alternating") {
    let letterIndex = 0;
    return [...value]
      .map((character) => {
        if (!/[a-z]/i.test(character)) return character;
        const result =
          letterIndex % 2 === 0
            ? character.toLowerCase()
            : character.toUpperCase();
        letterIndex += 1;
        return result;
      })
      .join("");
  }
  if (type === "title") {
    const smallWords = new Set([
      "a",
      "an",
      "and",
      "as",
      "at",
      "but",
      "by",
      "for",
      "in",
      "of",
      "on",
      "or",
      "the",
      "to",
    ]);
    const words = value.toLowerCase().split(/(\s+)/);
    let wordIndex = 0;
    return words
      .map((word) => {
        if (/^\s+$/.test(word) || !word) return word;
        const title = word.charAt(0).toUpperCase() + word.slice(1);
        const result =
          wordIndex > 0 && !smallWords.has(word)
            ? title
            : wordIndex === 0
              ? title
              : word;
        wordIndex += 1;
        return result;
      })
      .join("");
  }
  if (type === "inverse") {
    return [...value]
      .map((character) =>
        character === character.toUpperCase()
          ? character.toLowerCase()
          : character.toUpperCase(),
      )
      .join("");
  }
  return value
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
}

function uint16(value: number) {
  return [value & 255, (value >>> 8) & 255];
}
function uint32(value: number) {
  return [
    value & 255,
    (value >>> 8) & 255,
    (value >>> 16) & 255,
    (value >>> 24) & 255,
  ];
}
function crc32(bytes: Uint8Array) {
  let crc = ~0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return ~crc >>> 0;
}

async function buildZip(files: ConvertedFile[]) {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const filename = encoder.encode(file.name);
    const checksum = crc32(data);
    const flag = 0x0800;
    const local = new Uint8Array([
      0x50,
      0x4b,
      0x03,
      0x04,
      ...uint16(20),
      ...uint16(flag),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(checksum),
      ...uint32(data.length),
      ...uint32(data.length),
      ...uint16(filename.length),
      ...uint16(0),
      ...filename,
      ...data,
    ]);
    const central = new Uint8Array([
      0x50,
      0x4b,
      0x01,
      0x02,
      ...uint16(20),
      ...uint16(20),
      ...uint16(flag),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(checksum),
      ...uint32(data.length),
      ...uint32(data.length),
      ...uint16(filename.length),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(0),
      ...uint32(offset),
      ...filename,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array([
    0x50,
    0x4b,
    0x05,
    0x06,
    ...uint16(0),
    ...uint16(0),
    ...uint16(files.length),
    ...uint16(files.length),
    ...uint32(centralSize),
    ...uint32(offset),
    ...uint16(0),
  ]);
  const parts = [...locals, ...centrals, end];
  const zipBuffer = new ArrayBuffer(
    parts.reduce((sum, part) => sum + part.length, 0),
  );
  const zipBytes = new Uint8Array(zipBuffer);
  let position = 0;
  parts.forEach((part) => {
    zipBytes.set(part, position);
    position += part.length;
  });
  return new Blob([zipBuffer], { type: "application/zip" });
}

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>("image");
  const [quality, setQuality] = useState("target");
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [text, setText] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseType>("sentence");
  const [copyLabel, setCopyLabel] = useState("কপি");
  const inputRef = useRef<HTMLInputElement>(null);

  async function toWebp(canvas: HTMLCanvasElement, value: number) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", value),
    );
    if (!blob) throw new Error("WebP রূপান্তর ব্যর্থ হয়েছে");
    return blob;
  }

  async function smartWebp(canvas: HTMLCanvasElement) {
    let low = 0.35;
    let high = 1;
    let closest = await toWebp(canvas, 1);
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const current = (low + high) / 2;
      const blob = await toWebp(canvas, current);
      if (Math.abs(blob.size - 256000) < Math.abs(closest.size - 256000))
        closest = blob;
      if (blob.size > 300000) high = current;
      else low = current;
    }
    return closest;
  }

  async function convertFiles(fileList: FileList | File[]) {
    const files = [...fileList].filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) return;
    setIsConverting(true);
    convertedFiles.forEach((file) => URL.revokeObjectURL(file.url));
    const nextFiles: ConvertedFile[] = [];
    for (const file of files) {
      try {
        const sourceUrl = URL.createObjectURL(file);
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const loaded = new Image();
          loaded.onload = () => resolve(loaded);
          loaded.onerror = reject;
          loaded.src = sourceUrl;
        });
        URL.revokeObjectURL(sourceUrl);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d")?.drawImage(image, 0, 0);
        const blob =
          quality === "target"
            ? await smartWebp(canvas)
            : await toWebp(canvas, Number(quality));
        nextFiles.push({
          name: `${baseName(file.name)}.webp`,
          blob,
          url: URL.createObjectURL(blob),
          dimensions: `${image.naturalWidth} × ${image.naturalHeight}`,
        });
      } catch {
        // Skip files the browser cannot decode.
      }
    }
    setConvertedFiles(nextFiles);
    setIsConverting(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void convertFiles(event.dataTransfer.files);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void convertFiles(event.target.files);
  }

  async function copyText() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopyLabel("কপি হয়েছে");
    window.setTimeout(() => setCopyLabel("কপি"), 1200);
  }

  function deleteText() {
    setText((current) => current.slice(0, -1));
  }

  async function downloadZip() {
    if (!convertedFiles.length) return;
    const blob = await buildZip(convertedFiles);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "webp-images.zip";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const totalSize = convertedFiles.reduce(
    (sum, file) => sum + file.blob.size,
    0,
  );

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <nav className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">✦</span>
          <span>PixelPreserve</span>
        </a>
        <div className="topbar-status">
          <span className="status-dot" /> ব্রাউজারেই কাজ হয়{" "}
          <span className="status-divider" /> সংস্করণ ১.০
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-kicker">
          <span /> ব্যক্তিগত ব্রাউজার টুল <span />
        </div>
        <h1>
          ছোট ছোট টুল।
          <br />
          <em>সুন্দরভাবে</em> তৈরি।
        </h1>
        <p>
          দ্রুত কাজের জন্য তৈরি সুন্দর browser utility, যেখানে আপনার কোনো ফাইল
          কোথাও upload হয় না।
        </p>
      </section>

      <section className="workspace" aria-label="PixelPreserve টুলসমূহ">
        <div className="workspace-head">
          <div>
            <span className="section-label">আপনার টুলবক্স</span>
            <h2>শুরু করতে একটি tool বেছে নিন</h2>
          </div>
          <span className="workspace-count">০২টি টুল</span>
        </div>
        <div className="tool-tabs" role="tablist" aria-label="Tools">
          <button
            className={`tool-tab ${activeTool === "image" ? "is-active" : ""}`}
            onClick={() => setActiveTool("image")}
            role="tab"
            aria-selected={activeTool === "image"}
            type="button"
          >
            <span className="tab-icon image-icon">↗</span>
            <span>
              <b>ছবি থেকে WebP</b>
              <small>মান ঠিক রেখে সংকুচিত করুন</small>
            </span>
            <span className="tab-arrow">→</span>
          </button>
          <button
            className={`tool-tab ${activeTool === "text" ? "is-active" : ""}`}
            onClick={() => setActiveTool("text")}
            role="tab"
            aria-selected={activeTool === "text"}
            type="button"
          >
            <span className="tab-icon text-icon">Aa</span>
            <span>
              <b>লেখার ধরন</b>
              <small>আপনার লেখার রীতি বদলান</small>
            </span>
            <span className="tab-arrow">→</span>
          </button>
        </div>

        {activeTool === "image" ? (
          <div className="tool-panel" role="tabpanel">
            <label
              className={`drop-zone ${isDragging ? "is-dragging" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              htmlFor="image-input"
            >
              <span className="upload-icon">↑</span>
              <strong>ছবি এখানে ছেড়ে দিন</strong>
              <span>অথবা আপনার device থেকে বেছে নিন</span>
              <button
                className="browse-button"
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                ছবি বেছে নিন <span>↗</span>
              </button>
              <small>
                JPG, PNG, WebP, GIF ও ব্রাউজারে সমর্থিত অন্যান্য ফরম্যাট
              </small>
              <input
                ref={inputRef}
                id="image-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </label>
            <div className="image-settings">
              <div>
                <span className="setting-label">রেজোলিউশন</span>
                <strong>১০০% আসল</strong>
                <small>ছবির width ও height অপরিবর্তিত থাকবে</small>
              </div>
              <label>
                <span className="setting-label">WebP মান</span>
                <select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                >
                  <option value="target">Smart target · ২০০–৩০০ KB</option>
                  <option value="1">সর্বোচ্চ মান</option>
                  <option value=".92">উচ্চ মান</option>
                  <option value=".82">ভারসাম্যপূর্ণ</option>
                </select>
                <small>ফাইল size ও ছবির মানের সেরা ভারসাম্য</small>
              </label>
            </div>
            {(isConverting || convertedFiles.length > 0) && (
              <div className="results">
                <div className="results-head">
                  <div>
                    <span className="section-label">রূপান্তরের তালিকা</span>
                    <h3>
                      {isConverting
                        ? "আপনার ছবি প্রস্তুত করা হচ্ছে…"
                        : `${convertedFiles.length}টি WebP ফাইল প্রস্তুত`}
                    </h3>
                  </div>
                  <button
                    className="download-button"
                    onClick={() => void downloadZip()}
                    disabled={isConverting || !convertedFiles.length}
                  >
                    ZIP ডাউনলোড <span>↓</span>
                  </button>
                </div>
                <div className="file-list">
                  {convertedFiles.map((file) => (
                    <article className="file-row" key={file.url}>
                      <div className="file-preview">
                        <img src={file.url} alt="" />
                      </div>
                      <div>
                        <strong>{file.name}</strong>
                        <small>
                          {file.dimensions} · {formatBytes(file.blob.size)}
                        </small>
                      </div>
                      <a href={file.url} download={file.name}>
                        ডাউনলোড
                      </a>
                    </article>
                  ))}
                </div>
                {convertedFiles.length > 0 && (
                  <div className="results-total">
                    <span>মোট ফাইলের আকার</span>
                    <strong>{formatBytes(totalSize)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="tool-panel text-panel" role="tabpanel">
            <div className="panel-intro">
              <div>
                <span className="section-label">লেখা রূপান্তর</span>
                <h3>প্রতিটি শব্দকে আরও সুন্দর করুন।</h3>
              </div>
              <span className="character-count">{text.length}টি অক্ষর</span>
            </div>
            <textarea
              className="text-editor"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="এখানে আপনার লেখা লিখুন বা paste করুন…"
              spellCheck={false}
            />
            <div className="case-grid">
              {caseOptions.map((option) => (
                <button
                  className={`case-option ${selectedCase === option.id ? "is-active" : ""}`}
                  key={option.id}
                  onClick={() => {
                    setSelectedCase(option.id);
                    setText((current) => transformText(current, option.id));
                  }}
                  type="button"
                >
                  <b>{option.shortcut}</b>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <div className="text-actions">
              <button
                className="action-button primary"
                onClick={() => void copyText()}
                type="button"
              >
                {copyLabel} <span>↗</span>
              </button>
              <button
                className="action-button"
                onClick={deleteText}
                type="button"
              >
                মুছুন <span>⌫</span>
              </button>
              <button
                className="action-button"
                onClick={() => setText("")}
                type="button"
              >
                খালি করুন <span>×</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <footer>
        <span>PIXELPRESERVE / ২০২৬</span>
        <span>
          সব কাজ browser-এর ভেতরেই হয় <i>•</i> আপনার device থেকে কিছুই বাইরে যায়
          না
        </span>
      </footer>
    </main>
  );
}
