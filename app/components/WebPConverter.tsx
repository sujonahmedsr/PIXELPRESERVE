"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { createZip } from "../lib/zip";
import { useToast } from "./Toast";

type ConvertedFile = {
  name: string;
  blob: Blob;
  url: string;
  dimensions: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 102400 ? 0 : 1)} KB`;
}

function baseName(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

export function WebPConverter() {
  const [quality, setQuality] = useState("target");
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(
    () => () => files.forEach((file) => URL.revokeObjectURL(file.url)),
    [files],
  );

  const encode = useCallback(
    async (canvas: HTMLCanvasElement, value: number) => {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", value),
      );
      if (!blob) throw new Error("WebP conversion failed");
      return blob;
    },
    [],
  );

  const convert = useCallback(
    async (input: FileList | File[]) => {
      const images = [...input].filter((file) => file.type.startsWith("image/"));
      if (!images.length) return;
      setConverting(true);
      setProgress({ current: 0, total: images.length });
      files.forEach((file) => URL.revokeObjectURL(file.url));
      const next: ConvertedFile[] = [];
      for (let i = 0; i < images.length; i++) {
        setProgress({ current: i + 1, total: images.length });
        try {
          const source = URL.createObjectURL(images[i]);
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
            name: `${baseName(images[i].name)}.webp`,
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
      if (next.length) {
        addToast(`${next.length} image(s) successfully converted to WebP`, "success");
      }
    },
    [encode, files, quality, addToast],
  );

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    void convert(event.dataTransfer.files);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void convert(event.target.files);
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
    addToast("ZIP download started", "success");
  }

  const totalSize = files.reduce((sum, file) => sum + file.blob.size, 0);

  return (
    <div role="tabpanel">
      <label
        className={`flex min-h-62.5 cursor-pointer flex-col items-center justify-center rounded-[15px] border border-dashed border-[var(--border)] bg-[var(--bg-tool)] p-8 text-center transition hover:border-[var(--accent)] hover:bg-[var(--bg-tool-hover)] ${dragging ? "border-[var(--accent)] bg-[var(--bg-tool-hover)]" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        htmlFor="image-input"
      >
        <span className="mb-3.75 grid size-12 place-items-center rounded-[14px] border border-white/20 bg-[var(--accent)] text-[22px] text-white">
          ↑
        </span>
        <strong className="text-[18px] font-medium text-[var(--text-primary)]">
          Drop your images here
        </strong>
        <span className="mt-2 text-base text-[var(--text-secondary)]">
          or select files from your device
        </span>
        <button
          className="mt-5 rounded-lg border border-[var(--bg-button)] bg-[var(--bg-button)] px-4 py-2.75 text-base font-medium text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent)]"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          Select Images ↗
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
      <div className="mt-3.5 grid grid-cols-1 gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 min-[701px]:grid-cols-2">
        <div>
          <span className="font-mono text-base text-[var(--accent)]">
            Resolution
          </span>
          <strong className="ml-4 text-base font-medium text-[var(--text-primary)]">100% Original</strong>
          <small className="mt-1 block text-base text-[var(--text-secondary)]">
            Image dimensions will remain untouched
          </small>
        </div>
        <label>
          <span className="font-mono text-base text-[var(--accent)]">
            WebP Quality
          </span>
          <select
            className="ml-4 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1.5 text-base text-[var(--text-primary)]"
            value={quality}
            onChange={(event) => setQuality(event.target.value)}
          >
            <option value="target">Smart Target</option>
            <option value="1">Maximum Quality (100%)</option>
            <option value=".92">High Quality (92%)</option>
            <option value=".82">Balanced Quality (82%)</option>
          </select>
          <small className="mt-1 block text-base text-[var(--text-secondary)]">
            Optimal balance between compression and visual fidelity
          </small>
        </label>
      </div>

      {/* Progress bar */}
      {converting && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>Converting... {progress.current}/{progress.total}</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {(converting || files.length > 0) && (
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-medium text-[var(--text-primary)]">
              {converting
                ? "Converting your images…"
                : `${files.length} WebP file(s) ready`}
            </h3>
            <button
              className="rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-2.5 text-base font-medium text-white transition hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]"
              onClick={() => void downloadZip()}
              disabled={converting}
            >
              Download ZIP ↓
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {files.map((file) => (
              <article
                className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-[9px] border border-[var(--border)] bg-[var(--bg-surface)] p-2"
                key={file.url}
              >
                <img
                  className="size-10.5 rounded-[7px] object-cover"
                  src={file.url}
                  alt={`Converted image: ${file.name}`}
                />
                <div>
                  <strong className="block truncate text-base text-[var(--text-primary)]">
                    {file.name}
                  </strong>
                  <small className="text-base text-[var(--text-secondary)]">
                    {file.dimensions} · {formatBytes(file.blob.size)}
                  </small>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  className="text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Download
                </a>
              </article>
            ))}
          </div>
          <div className="mt-3 flex justify-between font-mono text-base text-[var(--text-secondary)]">
            <span>Total WebP Size</span>
            <strong>{formatBytes(totalSize)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
