"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { DesignToolPanel } from "./components/DesignToolPanel";
import { SectionHeading } from "./components/SectionHeading";
import { ToolCard } from "./components/ToolCard";

type Tool = "image" | "text" | "json" | "glass" | "palette";
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

function formatJson(value: string) {
  try {
    return { value: JSON.stringify(JSON.parse(value), null, 2), error: "" };
  } catch {
    return { value, error: "JSON-এ একটি syntax error আছে" };
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} বাইট`;
  return `${(bytes / 1024).toFixed(bytes < 102400 ? 0 : 1)} কিলোবাইট`;
}

function baseName(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

function uint16(value: number) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function uint32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
  return bytes;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function createZip(files: ConvertedFile[]) {
  const encoder = new TextEncoder();
  const localFiles: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;
  const date = new Date();
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(data);
    const size = data.length;
    const localHeader = new Uint8Array([
      ...uint32(0x04034b50), ...uint16(20), ...uint16(0x800), ...uint16(0),
      ...uint16(dosTime), ...uint16(dosDate), ...uint32(checksum),
      ...uint32(size), ...uint32(size), ...uint16(name.length), ...uint16(0),
    ]);
    localFiles.push(localHeader, name, data);
    const centralHeader = new Uint8Array([
      ...uint32(0x02014b50), ...uint16(20), ...uint16(20), ...uint16(0x800),
      ...uint16(0), ...uint16(dosTime), ...uint16(dosDate), ...uint32(checksum),
      ...uint32(size), ...uint32(size), ...uint16(name.length), ...uint16(0),
      ...uint16(0), ...uint16(0), ...uint16(0), ...uint32(0), ...uint32(offset),
    ]);
    centralDirectory.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  }

  const centralSize = centralDirectory.reduce((size, part) => size + part.length, 0);
  const end = new Uint8Array([
    ...uint32(0x06054b50), ...uint16(0), ...uint16(0), ...uint16(files.length),
    ...uint16(files.length), ...uint32(centralSize), ...uint32(offset), ...uint16(0),
  ]);
  const parts = [...localFiles, ...centralDirectory, end];
  const archive = new Uint8Array(
    parts.reduce((size, part) => size + part.length, 0),
  );
  let position = 0;
  for (const part of parts) {
    archive.set(part, position);
    position += part.length;
  }
  return new Blob([archive.buffer], {
    type: "application/zip",
  });
}

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>("image");
  const [quality, setQuality] = useState("target");
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [text, setText] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseType>("sentence");
  const [jsonText, setJsonText] = useState(
    '{"store": "PixelPreserve", "private": true}',
  );
  const [jsonError, setJsonError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => files.forEach((file) => URL.revokeObjectURL(file.url)),
    [files],
  );

  async function encode(canvas: HTMLCanvasElement, value: number) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", value),
    );
    if (!blob) throw new Error("WebP রূপান্তর ব্যর্থ হয়েছে");
    return blob;
  }

  async function convert(input: FileList | File[]) {
    const images = [...input].filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;
    setConverting(true);
    files.forEach((file) => URL.revokeObjectURL(file.url));
    const next: ConvertedFile[] = [];
    for (const file of images) {
      try {
        const source = URL.createObjectURL(file);
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const loaded = new Image();
          loaded.onload = () => resolve(loaded);
          loaded.onerror = reject;
          loaded.src = source;
        });
        URL.revokeObjectURL(source);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d")?.drawImage(image, 0, 0);
        const blob = await encode(
          canvas,
          quality === "target" ? 0.82 : Number(quality),
        );
        next.push({
          name: `${baseName(file.name)}.webp`,
          blob,
          url: URL.createObjectURL(blob),
          dimensions: `${image.naturalWidth} × ${image.naturalHeight}`,
        });
      } catch {
        /* Ignore images the browser cannot decode. */
      }
    }
    setFiles(next);
    setConverting(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    void convert(event.dataTransfer.files);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void convert(event.target.files);
  }

  async function copy(value: string) {
    if (value) await navigator.clipboard.writeText(value);
  }

  async function downloadZip() {
    if (!files.length) return;
    const blob = await createZip(files);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pixelpreserve-webp-images.zip";
    link.click();
    URL.revokeObjectURL(url);
  }

  const totalSize = files.reduce((sum, file) => sum + file.blob.size, 0);
  return (
    <main className="relative mx-auto w-[calc(100%-24px)] max-w-7xl px-0 pb-10 min-[701px]:w-[calc(100%-56px)]">
      <section className="mt-4 rounded-2xl border border-[#d5e2da] bg-[#ffffffc7] p-4 shadow-[0_30px_80px_#224c3d12] backdrop-blur-[18px] min-[701px]:rounded-[26px] min-[701px]:p-7.25">
        <div className="mb-5.5 flex items-end justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-2">
          <SectionHeading
            eyebrow="YOUR DAILY STACK"
            title="কাজের জায়গা, এক SCREEN-এ"
            description="Developer workflow-এর ছোট friction গুলো সরিয়ে দিন."
          />
          <span className="font-mono text-base text-[#71807b]">
            ০৫টি টুল / FREE
          </span>
        </div>
        <div
          className="mb-5.5 grid grid-cols-1 gap-2.5 min-[701px]:grid-cols-2 min-[1100px]:grid-cols-5"
          role="tablist"
        >
          <ToolCard
            active={activeTool === "image"}
            icon="↗"
            title="ছবি থেকে WEBP"
            description="Quality রেখে size কমান"
            tag="MEDIA"
            onClick={() => setActiveTool("image")}
          />
          <ToolCard
            active={activeTool === "text"}
            icon="Aa"
            title="CASE TRANSFORM"
            description="Case transform করুন"
            tag="TEXT"
            onClick={() => setActiveTool("text")}
          />
          <ToolCard
            active={activeTool === "json"}
            icon="{}"
            title="JSON FORMATTER"
            description="Pretty print ও validate"
            tag="API"
            onClick={() => setActiveTool("json")}
          />
          <ToolCard
            active={activeTool === "glass"}
            icon="◈"
            title="GLASS & SHADOW"
            description="Generate polished CSS"
            tag="CSS"
            onClick={() => setActiveTool("glass")}
          />
          <ToolCard
            active={activeTool === "palette"}
            icon="●"
            title="PALETTE CHECKER"
            description="Contrast and colour system"
            tag="COLOR"
            onClick={() => setActiveTool("palette")}
          />
        </div>
        {activeTool === "image" ? (
          <div role="tabpanel">
            <label
              className={`flex min-h-62.5 cursor-pointer flex-col items-center justify-center rounded-[15px] border border-dashed border-[#aecfbe] bg-[#f4f9f5] p-8 text-center transition hover:border-[#157c62] hover:bg-[#e9f5ed] ${dragging ? "border-[#157c62] bg-[#e9f5ed]" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              htmlFor="image-input"
            >
              <span className="mb-3.75 grid size-12 place-items-center rounded-[14px] bg-[#157c62] text-[22px] text-white shadow-[0_9px_18px_#157c6230]">
                ↑
              </span>
              <strong className="text-[18px] font-medium">
                ছবি এখানে ছেড়ে দিন
              </strong>
              <span className="mt-2 text-base text-[#71807b]">
                অথবা আপনার device থেকে বেছে নিন
              </span>
              <button
                className="mt-5 rounded-lg bg-[#17201e] px-4 py-2.75 text-base font-medium text-white transition hover:bg-[#157c62]"
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                ছবি বেছে নিন ↗
              </button>
              <input
                ref={inputRef}
                id="image-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleChange}
              />
            </label>
            <div className="mt-3.5 grid grid-cols-1 gap-3.5 rounded-xl border border-[#dce5df] bg-[#f8faf8] p-4 min-[701px]:grid-cols-2">
              <div>
                <span className="font-mono text-base text-[#157c62]">
                  রেজোলিউশন
                </span>
                <strong className="ml-4 text-base font-medium">১০০% আসল</strong>
                <small className="mt-1 block text-base text-[#71807b]">
                  ছবির width ও height অপরিবর্তিত থাকবে
                </small>
              </div>
              <label>
                <span className="font-mono text-base text-[#157c62]">
                  WebP মান
                </span>
                <select
                  className="ml-4 rounded-md border border-[#dce5df] bg-white px-2 py-1.5 text-base"
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                >
                  <option value="target">Smart target</option>
                  <option value="1">সর্বোচ্চ মান</option>
                  <option value=".92">উচ্চ মান</option>
                  <option value=".82">ভারসাম্যপূর্ণ</option>
                </select>
                <small className="mt-1 block text-base text-[#71807b]">
                  ফাইল size ও ছবির মানের সেরা ভারসাম্য
                </small>
              </label>
            </div>
            {(converting || files.length > 0) && (
              <div className="mt-6 border-t border-[#dce5df] pt-6">
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-medium">
                    {converting
                      ? "আপনার ছবি প্রস্তুত করা হচ্ছে…"
                      : `${files.length}টি WebP ফাইল প্রস্তুত`}
                  </h3>
                  <button
                    className="rounded-lg bg-[#157c62] px-3.5 py-2.5 text-base font-medium text-white"
                    onClick={() => void downloadZip()}
                    disabled={converting}
                  >
                    ZIP ডাউনলোড ↓
                  </button>
                </div>
                <div className="mt-4 grid gap-2">
                  {files.map((file) => (
                    <article
                      className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-[9px] border border-[#dce5df] bg-white p-2"
                      key={file.url}
                    >
                      <img
                        className="size-10.5 rounded-[7px] object-cover"
                        src={file.url}
                        alt=""
                      />
                      <div>
                        <strong className="block truncate text-base">
                          {file.name}
                        </strong>
                        <small className="text-base text-[#71807b]">
                          {file.dimensions} · {formatBytes(file.blob.size)}
                        </small>
                      </div>
                      <a href={file.url} download={file.name}>
                        ডাউনলোড
                      </a>
                    </article>
                  ))}
                </div>
                <div className="mt-3 flex justify-between font-mono text-base text-[#71807b]">
                  <span>মোট ফাইলের আকার</span>
                  <strong>{formatBytes(totalSize)}</strong>
                </div>
              </div>
            )}
          </div>
        ) : activeTool === "text" ? (
          <div role="tabpanel">
            <div className="flex justify-between">
              <span className="font-mono text-base text-[#157c62]">
                লেখা রূপান্তর
              </span>
              <span className="font-mono text-base text-[#71807b]">
                {text.length}টি অক্ষর
              </span>
            </div>
            <textarea
              className="mt-4.75 block min-h-52.5 w-full rounded-xl border border-[#dce5df] bg-[#f8faf8] p-4.25 font-mono text-base leading-[1.7] outline-0 focus:border-[#8bc3aa]"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="এখানে আপনার লেখা লিখুন বা paste করুন…"
            />
            <div className="mt-3 grid grid-cols-2 gap-2 min-[701px]:grid-cols-4">
              {caseOptions.map((option) => (
                <button
                  className={`grid gap-1 rounded-[9px] border p-2.5 text-left ${selectedCase === option.id ? "border-[#a8d1ba] bg-[#f0f8f2]" : "border-[#dce5df] bg-white"}`}
                  key={option.id}
                  onClick={() => {
                    setSelectedCase(option.id);
                    setText((current) => transformText(current, option.id));
                  }}
                  type="button"
                >
                  <b className="font-mono text-base text-[#157c62]">
                    {option.shortcut}
                  </b>
                  <span className="text-base">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3.5 flex gap-2">
              <button
                className="rounded-lg bg-[#17201e] px-3.25 py-2.5 text-base text-white"
                onClick={() => void copy(text)}
                type="button"
              >
                কপি ↗
              </button>
              <button
                className="rounded-lg border border-[#dce5df] bg-white px-3.25 py-2.5 text-base"
                onClick={() => setText("")}
                type="button"
              >
                খালি করুন ×
              </button>
            </div>
          </div>
        ) : activeTool === "json" ? (
          <div role="tabpanel">
            <span className="font-mono text-base text-[#157c62]">
              API WORKFLOW
            </span>
            <h3 className="mt-2 text-[30px] font-medium">
              MAKE JSON READABLE.
            </h3>
            <textarea
              className="mt-4.75 block min-h-72.5 w-full rounded-xl border border-[#dce5df] bg-[#f1f6f8] p-4.25 font-mono text-base leading-[1.7] text-[#31566b]"
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                setJsonError("");
              }}
            />
            <p className="mt-2 text-base text-[#b34635]">{jsonError}</p>
            <div className="mt-3.5 flex gap-2">
              <button
                className="rounded-lg bg-[#17201e] px-3.25 py-2.5 text-base text-white"
                onClick={() => {
                  const result = formatJson(jsonText);
                  setJsonText(result.value);
                  setJsonError(result.error);
                }}
                type="button"
              >
                Format JSON ↗
              </button>
              <button
                className="rounded-lg border border-[#dce5df] bg-white px-3.25 py-2.5 text-base"
                onClick={() => void copy(jsonText)}
                type="button"
              >
                কপি
              </button>
            </div>
          </div>
        ) : (
          <DesignToolPanel kind={activeTool} />
        )}
      </section>
    </main>
  );
}
