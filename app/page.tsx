"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { SectionHeading } from "./components/SectionHeading";
import { ToolCard } from "./components/ToolCard";

type Tool = "image" | "text" | "json";
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

function formatJson(value: string) {
  try {
    return { value: JSON.stringify(JSON.parse(value), null, 2), error: "" };
  } catch {
    return { value, error: "JSON-এ একটি syntax error আছে" };
  }
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
  const [jsonText, setJsonText] = useState(
    '{"store": "PixelPreserve", "private": true}',
  );
  const [jsonError, setJsonError] = useState("");
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

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value);
    setCopyLabel("কপি হয়েছে");
    window.setTimeout(() => setCopyLabel("কপি"), 1200);
  }

  function prettifyJson() {
    const result = formatJson(jsonText);
    setJsonText(result.value);
    setJsonError(result.error);
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
    <main className="relative mx-auto w-[calc(100%-24px)] max-w-295 overflow-hidden px-0 pt-4.5 pb-10.5 min-[701px]:w-[calc(100%-48px)] min-[701px]:pt-7">
      <div className="pointer-events-none fixed -top-70 -right-30 z-[-1] size-117.5 rounded-full bg-[#d7eee2] opacity-55 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-82.5 -left-40 z-[-1] size-117.5 rounded-full bg-[#f3d5c3] opacity-55 blur-[100px]" />
      <nav className="flex items-center justify-between border-b border-[#dce5df] pb-7">
        <a
          className="inline-flex items-center gap-2.75 text-[17px] font-medium tracking-[-0.6px] text-[#17201e] no-underline"
          href="#top"
        >
          <span className="grid size-7.75 rotate-[-8deg] place-items-center rounded-[9px] bg-[#157c62] text-[15px] text-white">
            ✦
          </span>
          <span>PixelPreserve</span>
        </a>
        <div className="font-mono text-base tracking-[0.03em] text-[#71807b] max-[700px]:text-[0px]">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-[#35a67d] shadow-[0_0_0_4px_#35a67d1a] max-[700px]:mr-0" />{" "}
          ব্রাউজারেই কাজ হয়{" "}
          <span className="mx-2 inline-block h-3 w-px align-middle bg-[#dce5df] max-[700px]:hidden" />{" "}
          সংস্করণ ১.০
        </div>
        <a
          className="font-mono text-base tracking-[0.03em] text-[#71807b] no-underline max-[700px]:text-[0px]"
          href="/tasks"
        >
          TASK CONTROL ROOM ↗
        </a>
      </nav>

      <section
        className="px-0 pt-17 pb-12.5 text-center min-[701px]:pt-24 min-[701px]:pb-18"
        id="top"
      >
        <div className="inline-flex items-center gap-2.5 font-mono text-base tracking-[0.12em] text-[#157c62] max-[420px]:text-[9px]">
          <span className="inline-block h-px w-6.5 bg-[#9ccab5]" /> PRIVATE
          DEVELOPER TOOLKIT{" "}
          <span className="inline-block h-px w-6.5 bg-[#9ccab5]" />
        </div>
        <h1 className="mx-auto my-4.25 max-w-200 text-[40px] leading-[1.08] font-medium tracking-tight">
          আপনার workflow-এর
          <br />
          <em className="font-serif font-medium tracking-[-3px] text-[#df795f]">
            স্মার্ট toolkit.
          </em>
        </h1>
        <p className="mx-auto max-w-127.5 text-base leading-[1.75] text-[#71807b]">
          WebP, JSON এবং text workflow-এর জন্য দ্রুত browser utilities। কোনো
          ফাইল বা data আপনার device ছাড়ে না।
        </p>
        <div className="mt-7.5 flex justify-center gap-7 font-mono text-base uppercase text-[#71807b] max-[700px]:flex-wrap max-[700px]:gap-x-4.5 max-[700px]:gap-y-3">
          <span>
            <b className="mr-1.5 text-base font-medium text-[#17201e]">০৩</b>টি
            utility
          </span>
          <span>
            <b className="mr-1.5 text-base font-medium text-[#17201e]">১০০%</b>{" "}
            client-side
          </span>
          <span>
            <b className="mr-1.5 text-base font-medium text-[#17201e]">০</b>{" "}
            upload
          </span>
        </div>
      </section>

      <section
        className="rounded-2xl border border-[#dce5df] bg-[#ffffffb8] p-4 shadow-[0_28px_70px_#224c3d0d] backdrop-blur-[15px] min-[701px]:rounded-[26px] min-[701px]:p-7.25"
        aria-label="PixelPreserve টুলসমূহ"
      >
        <div className="mb-5.5 flex items-end justify-between gap-5 max-[700px]:items-start max-[700px]:flex-col max-[700px]:gap-2">
          <SectionHeading
            eyebrow="YOUR DAILY STACK"
            title="কাজের জায়গা, এক screen-এ"
            description="Developer workflow-এর ছোট friction গুলো সরিয়ে দিন।"
          />
          <span className="font-mono text-base tracking-[0.03em] text-[#71807b]">
            ০৩টি টুল / FREE
          </span>
        </div>
        <div
          className="mb-5.5 grid grid-cols-1 gap-2.5 min-[701px]:grid-cols-3"
          role="tablist"
          aria-label="Tools"
        >
          <ToolCard
            active={activeTool === "image"}
            icon="↗"
            title="ছবি থেকে WebP"
            description="Quality রেখে size কমান"
            tag="MEDIA"
            onClick={() => setActiveTool("image")}
          />
          <ToolCard
            active={activeTool === "text"}
            icon="Aa"
            title="লেখার ধরন"
            description="Case transform করুন"
            tag="TEXT"
            onClick={() => setActiveTool("text")}
          />
          <ToolCard
            active={activeTool === "json"}
            icon="{}"
            title="JSON Formatter"
            description="Pretty print ও validate"
            tag="API"
            onClick={() => setActiveTool("json")}
          />
        </div>

        {activeTool === "image" ? (
          <div role="tabpanel">
            <label
              className={`flex min-h-62.5 cursor-pointer flex-col items-center justify-center rounded-[15px] border border-dashed border-[#aecfbe] bg-[#f4f9f5] p-5.5 text-center transition duration-200 hover:border-[#157c62] hover:bg-[#e9f5ed] min-[421px]:min-h-69 min-[421px]:p-8 ${isDragging ? "border-[#157c62] bg-[#e9f5ed]" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              htmlFor="image-input"
            >
              <span className="mb-3.75 grid size-12 place-items-center rounded-[14px] bg-[#157c62] text-[22px] text-white shadow-[0_9px_18px_#157c6230]">
                ↑
              </span>
              <strong className="text-[18px] font-medium tracking-[-0.5px]">
                ছবি এখানে ছেড়ে দিন
              </strong>
              <span className="mt-2 text-base text-[#71807b]">
                অথবা আপনার device থেকে বেছে নিন
              </span>
              <button
                className="mt-5 rounded-lg border-0 bg-[#17201e] px-3.75 py-2.75 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#157c62]"
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                ছবি বেছে নিন <span>↗</span>
              </button>
              <small className="mt-4.25 text-base text-[#9aa8a1]">
                JPG, PNG, WebP, GIF ও ব্রাউজারে সমর্থিত অন্যান্য ফরম্যাট
              </small>
              <input
                ref={inputRef}
                id="image-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <div className="mt-3.5 grid grid-cols-1 gap-3.5 rounded-xl border border-[#dce5df] bg-[#f8faf8] p-4 min-[701px]:grid-cols-2 min-[701px]:px-4.5">
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1">
                <span className="font-mono text-base tracking-[0.08em] text-[#157c62]">
                  রেজোলিউশন
                </span>
                <strong className="text-right text-base font-medium">
                  ১০০% আসল
                </strong>
                <small className="col-span-full text-base text-[#71807b]">
                  ছবির width ও height অপরিবর্তিত থাকবে
                </small>
              </div>
              <label className="grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1">
                <span className="font-mono text-base tracking-[0.08em] text-[#157c62]">
                  WebP মান
                </span>
                <select
                  className="max-w-58.75 rounded-md border border-[#dce5df] bg-white px-2 py-1.5 text-base text-[#17201e]"
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                >
                  <option value="target">Smart target · ২০০–৩০০ KB</option>
                  <option value="1">সর্বোচ্চ মান</option>
                  <option value=".92">উচ্চ মান</option>
                  <option value=".82">ভারসাম্যপূর্ণ</option>
                </select>
                <small className="col-span-full text-base text-[#71807b]">
                  ফাইল size ও ছবির মানের সেরা ভারসাম্য
                </small>
              </label>
            </div>
            {(isConverting || convertedFiles.length > 0) && (
              <div className="mt-6 border-t border-[#dce5df] pt-6">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <span className="font-mono text-base tracking-[0.12em] text-[#157c62]">
                      রূপান্তরের তালিকা
                    </span>
                    <h3 className="mt-2 text-[40px] leading-[1.08] font-medium tracking-[-1.8px]">
                      {isConverting
                        ? "আপনার ছবি প্রস্তুত করা হচ্ছে…"
                        : `${convertedFiles.length}টি WebP ফাইল প্রস্তুত`}
                    </h3>
                  </div>
                  <button
                    className="rounded-lg border-0 bg-[#157c62] px-3.25 py-2.5 text-base font-medium text-white transition disabled:cursor-wait disabled:opacity-50"
                    onClick={() => void downloadZip()}
                    disabled={isConverting || !convertedFiles.length}
                  >
                    ZIP ডাউনলোড <span>↓</span>
                  </button>
                </div>
                <div className="mt-4 grid gap-2">
                  {convertedFiles.map((file) => (
                    <article
                      className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-[9px] border border-[#dce5df] bg-white p-2"
                      key={file.url}
                    >
                      <div className="size-10.5 overflow-hidden rounded-[7px] bg-[#edf1ed]">
                        <img
                          className="size-10.5 rounded-[7px] object-cover"
                          src={file.url}
                          alt=""
                        />
                      </div>
                      <div>
                        <strong className="block overflow-hidden text-base font-medium text-ellipsis whitespace-nowrap">
                          {file.name}
                        </strong>
                        <small className="mt-1 block overflow-hidden text-base text-ellipsis whitespace-nowrap text-[#71807b]">
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
                  <div className="mt-3 flex justify-between font-mono text-base tracking-[0.03em] text-[#71807b]">
                    <span>মোট ফাইলের আকার</span>
                    <strong className="font-medium text-[#17201e]">
                      {formatBytes(totalSize)}
                    </strong>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTool === "text" ? (
          <div className="py-2" role="tabpanel">
            <div className="flex items-end justify-between gap-5">
              <div>
                <span className="font-mono text-base tracking-[0.12em] text-[#157c62]">
                  লেখা রূপান্তর
                </span>
                <h3 className="mt-2 text-[40px] leading-[1.08] font-medium tracking-[-1.8px]">
                  প্রতিটি শব্দকে আরও সুন্দর করুন।
                </h3>
              </div>
              <span className="font-mono text-base text-[#71807b]">
                {text.length}টি অক্ষর
              </span>
            </div>
            <textarea
              className="mt-4.75 block min-h-52.5 w-full resize-y rounded-xl border border-[#dce5df] bg-[#f8faf8] p-4.25 font-mono text-base leading-[1.7] text-[#17201e] outline-0 focus:border-[#8bc3aa] focus:bg-white focus:shadow-[0_0_0_3px_#8bc3aa1c]"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="এখানে আপনার লেখা লিখুন বা paste করুন…"
              spellCheck={false}
            />
            <div className="mt-3 grid grid-cols-2 gap-2 min-[701px]:grid-cols-4">
              {caseOptions.map((option) => (
                <button
                  className={`grid gap-1 rounded-[9px] border p-2.5 text-left transition ${selectedCase === option.id ? "border-[#a8d1ba] bg-[#f0f8f2] text-[#17201e]" : "border-[#dce5df] bg-white text-[#71807b]"}`}
                  key={option.id}
                  onClick={() => {
                    setSelectedCase(option.id);
                    setText((current) => transformText(current, option.id));
                  }}
                  type="button"
                >
                  <b className="font-mono text-base font-medium text-[#157c62]">
                    {option.shortcut}
                  </b>
                  <span className="text-base font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3.5 flex gap-2">
              <button
                className="rounded-lg border border-[#17201e] bg-[#17201e] px-3.25 py-2.5 text-base font-medium text-white transition hover:border-[#157c62] hover:bg-[#157c62]"
                onClick={() => void copyText()}
                type="button"
              >
                {copyLabel} <span>↗</span>
              </button>
              <button
                className="rounded-lg border border-[#dce5df] bg-white px-3.25 py-2.5 text-base font-medium text-[#71807b] transition hover:border-[#a8d1ba] hover:text-[#17201e]"
                onClick={deleteText}
                type="button"
              >
                মুছুন <span>⌫</span>
              </button>
              <button
                className="rounded-lg border border-[#dce5df] bg-white px-3.25 py-2.5 text-base font-medium text-[#71807b] transition hover:border-[#a8d1ba] hover:text-[#17201e]"
                onClick={() => setText("")}
                type="button"
              >
                খালি করুন <span>×</span>
              </button>
            </div>
          </div>
        ) : (
          <div role="tabpanel">
            <div className="flex items-end justify-between gap-5">
              <div>
                <span className="font-mono text-base tracking-[0.12em] text-[#157c62]">
                  API WORKFLOW
                </span>
                <h3 className="mt-2 text-[40px] leading-[1.08] font-medium tracking-[-1.8px]">
                  JSON-কে readable করুন।
                </h3>
              </div>
              <span className="font-mono text-base text-[#71807b]">
                {jsonText.length} chars
              </span>
            </div>
            <textarea
              className="mt-4.75 block min-h-72.5 w-full resize-y rounded-xl border border-[#dce5df] bg-[#f1f6f8] p-4.25 font-mono text-base leading-[1.7] text-[#31566b] outline-0 focus:border-[#8bc3aa] focus:bg-white focus:shadow-[0_0_0_3px_#8bc3aa1c]"
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                setJsonError("");
              }}
              spellCheck={false}
              aria-label="JSON input"
            />
            {jsonError ? (
              <p className="mt-2.5 text-base text-[#b34635]">{jsonError}</p>
            ) : null}
            <div className="mt-3.5 flex gap-2">
              <button
                className="rounded-lg border border-[#17201e] bg-[#17201e] px-3.25 py-2.5 text-base font-medium text-white transition hover:border-[#157c62] hover:bg-[#157c62]"
                onClick={prettifyJson}
                type="button"
              >
                Format JSON <span>↗</span>
              </button>
              <button
                className="rounded-lg border border-[#dce5df] bg-white px-3.25 py-2.5 text-base font-medium text-[#71807b] transition hover:border-[#a8d1ba] hover:text-[#17201e]"
                onClick={() => void copyValue(jsonText)}
                type="button"
              >
                {copyLabel} <span>⌘</span>
              </button>
              <button
                className="rounded-lg border border-[#dce5df] bg-white px-3.25 py-2.5 text-base font-medium text-[#71807b] transition hover:border-[#a8d1ba] hover:text-[#17201e]"
                onClick={() => {
                  setJsonText("");
                  setJsonError("");
                }}
                type="button"
              >
                Clear <span>×</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <footer className="flex justify-between gap-2.5 px-0.75 pt-7 font-mono text-base leading-[1.6] tracking-[0.04em] text-[#91a19a] max-[700px]:flex-col">
        <span>PIXELPRESERVE / ২০২৬</span>
        <span>
          সব কাজ browser-এর ভেতরেই হয়{" "}
          <i className="mx-2 text-[#df795f] not-italic">•</i> আপনার device থেকে
          কিছুই বাইরে যায় না
        </span>
      </footer>
    </main>
  );
}
