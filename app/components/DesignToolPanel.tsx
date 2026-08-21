"use client";

import { useMemo, useState } from "react";

type DesignToolKind = "glass" | "palette";
type GlassSettings = {
  backgroundColor: string;
  textColor: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  shadowColor: string;
  shadowOpacity: number;
  backdropBlur: number;
  backgroundOpacity: number;
  borderOpacity: number;
  radius: number;
};

const initialGlass: GlassSettings = {
  backgroundColor: "#FFFFFF",
  textColor: "#000",
  offsetX: 0,
  offsetY: 18,
  blur: 40,
  spread: -8,
  shadowColor: "#14211d",
  shadowOpacity: 18,
  backdropBlur: 18,
  backgroundOpacity: 34,
  borderOpacity: 42,
  radius: 24,
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null;
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
}

function contrastRatio(background: string, foreground: string) {
  const light = Math.max(luminance(background), luminance(foreground));
  const dark = Math.min(luminance(background), luminance(foreground));
  return (light + 0.05) / (dark + 0.05);
}

function rgba(hex: string, opacity: number) {
  const rgb = hexToRgb(hex) ?? { r: 20, g: 33, b: 29 };
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity / 100).toFixed(2)})`;
}

function rgbValue(hex: string) {
  const rgb = hexToRgb(hex);
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "Invalid color";
}

function copyToClipboard(value: string, setCopied: (value: string) => void) {
  void navigator.clipboard.writeText(value).then(() => {
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1600);
  });
}

function Control({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#17201e]">
      <span className="flex justify-between gap-3">
        <span>{label}</span>
        <b className="font-mono text-xs font-medium text-[#157c62]">
          {value}
          {suffix}
        </b>
      </span>
      <input
        className="accent-[#157c62]"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#17201e]">
      {label}
      <div className="flex gap-2">
        <input
          className="size-11 rounded-lg border border-[#dce5df] bg-white p-1"
          type="color"
          value={hexToRgb(value) ? value : "#ffffff"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <input
          className="min-w-0 flex-1 rounded-lg border border-[#dce5df] bg-white px-3 text-sm uppercase outline-none focus:border-[#157c62]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} HEX value`}
        />
      </div>
    </label>
  );
}

function GlassPanel() {
  const [settings, setSettings] = useState(initialGlass);
  const [copied, setCopied] = useState("");
  const [showBackdropText, setShowBackdropText] = useState(true);
  const [backdropTextColor, setBackdropTextColor] = useState("#FFFFFF");
  const update = (key: keyof GlassSettings, value: number | string) =>
    setSettings((current) => ({ ...current, [key]: value }));
  const css = `.glass-card {\n  background: ${rgba(settings.backgroundColor, settings.backgroundOpacity)};\n  color: ${settings.textColor};\n  backdrop-filter: blur(${settings.backdropBlur}px);\n  border: 1px solid ${rgba(settings.textColor, settings.borderOpacity)};\n  border-radius: ${settings.radius}px;\n  box-shadow: ${settings.offsetX}px ${settings.offsetY}px ${settings.blur}px ${settings.spread}px ${rgba(settings.shadowColor, settings.shadowOpacity)};\n}`;
  const presets: { label: string; settings: GlassSettings }[] = [
    {
      label: "Soft",
      settings: {
        ...initialGlass,
        blur: 28,
        backdropBlur: 12,
        backgroundOpacity: 48,
        radius: 18,
      },
    },
    { label: "Float", settings: initialGlass },
    {
      label: "Crisp",
      settings: {
        ...initialGlass,
        offsetY: 8,
        blur: 18,
        spread: 0,
        backdropBlur: 8,
        backgroundOpacity: 72,
        borderOpacity: 62,
        radius: 14,
      },
    },
  ];

  return (
    <div
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]"
      role="tabpanel"
    >
      {/* বামপাশের প্রিভিউ প্যানেলটি এখন স্টিকি */}
      <div className="self-start overflow-hidden rounded-2xl border border-[#dce5df] bg-[#e7f1ec] p-5 shadow-[0_14px_35px_rgba(23,32,30,.05)] sm:p-8 lg:sticky lg:top-2">
        <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_20%_20%,#d8f36a_0,transparent_34%),radial-gradient(circle_at_80%_80%,#df795f_0,transparent_36%),#18372e] p-8">
          {showBackdropText && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-[.82] tracking-[-.04em]"
              style={{ color: rgba(backdropTextColor, 35) }}
            >
              <span className="rotate-[-8deg]">
                Backdrop
                <br />
                blur
              </span>
            </div>
          )}
          <span className="absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-black px-3 py-1 font-mono text-[10px] tracking-[.16em] text-white">
            LIVE CANVAS
          </span>
          <div
            className="relative z-10 w-full max-w-sm p-7 text-white"
            style={{
              background: rgba(
                settings.backgroundColor,
                settings.backgroundOpacity,
              ),
              color: settings.textColor,
              backdropFilter: `blur(${settings.backdropBlur}px)`,
              border: `1px solid ${rgba(settings.textColor, settings.borderOpacity)}`,
              borderRadius: settings.radius,
              boxShadow: `${settings.offsetX}px ${settings.offsetY}px ${settings.blur}px ${settings.spread}px ${rgba(settings.shadowColor, settings.shadowOpacity)}`,
            }}
          >
            <span className="font-mono text-xs tracking-[.16em] opacity-70">
              LIVE PREVIEW
            </span>
            <h3 className="mt-4 text-3xl font-semibold">Quiet surfaces.</h3>
            <p className="mt-3 text-sm leading-6 opacity-70">
              A translucent card with a considered shadow system and a little
              atmosphere.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[.16em] text-[#157c62]">
              GENERATED CSS
            </p>
            <p className="mt-2 text-sm text-[#71807b]">
              Ready to paste into your component.
            </p>
          </div>
          <button
            className="shrink-0 rounded-lg bg-[#17201e] px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#157c62]"
            onClick={() => copyToClipboard(css, setCopied)}
            type="button"
            aria-live="polite"
          >
            {copied === css ? "Copied" : "Copy CSS"}
          </button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-[#17201e] p-4 text-xs leading-6 text-[#d8f36a]">
          {css}
        </pre>
      </div>

      {/* ডানপাশের কন্ট্রোল প্যানেল যা স্ক্রোল হবে */}
      <div className="grid gap-5 rounded-2xl border border-[#dce5df] bg-[#f8faf8] p-5 shadow-[0_14px_35px_rgba(23,32,30,.04)] sm:grid-cols-2 lg:grid-cols-1">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs tracking-[.16em] text-[#157c62]">
                DESIGN CONTROLS
              </p>
              <h3 className="mt-2 text-xl font-medium">Shape the depth</h3>
            </div>
            <button
              className="text-xs font-semibold text-[#71807b] underline decoration-[#b8c8be] underline-offset-4"
              onClick={() => setSettings(initialGlass)}
              type="button"
            >
              Reset
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                className="rounded-full border border-[#cbd9d0] bg-white px-3 py-1.5 text-xs font-semibold text-[#157c62] transition hover:border-[#157c62] hover:bg-[#e7f4ef]"
                key={preset.label}
                onClick={() => setSettings(preset.settings)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-[#dce5df] pt-5 sm:col-span-2 lg:col-span-1">
          <p className="font-mono text-xs tracking-[.16em] text-[#157c62]">
            COLOUR SYSTEM
          </p>
        </div>
        <ColorControl
          label="Card background"
          value={settings.backgroundColor}
          onChange={(value) => update("backgroundColor", value)}
        />
        <ColorControl
          label="Card text"
          value={settings.textColor}
          onChange={(value) => update("textColor", value)}
        />
        <Control
          label="Offset X"
          value={settings.offsetX}
          min={-40}
          max={40}
          suffix="px"
          onChange={(value) => update("offsetX", value)}
        />
        <Control
          label="Offset Y"
          value={settings.offsetY}
          min={-40}
          max={60}
          suffix="px"
          onChange={(value) => update("offsetY", value)}
        />
        <Control
          label="Blur radius"
          value={settings.blur}
          min={0}
          max={100}
          suffix="px"
          onChange={(value) => update("blur", value)}
        />
        <Control
          label="Spread radius"
          value={settings.spread}
          min={-30}
          max={30}
          suffix="px"
          onChange={(value) => update("spread", value)}
        />
        <label className="grid gap-2 text-sm font-medium text-[#17201e]">
          Shadow color
          <div className="flex gap-2">
            <input
              className="size-11 rounded-lg border border-[#dce5df] bg-white p-1"
              type="color"
              value={settings.shadowColor}
              onChange={(event) => update("shadowColor", event.target.value)}
            />
            <input
              className="min-w-0 flex-1 rounded-lg border border-[#dce5df] bg-white px-3 text-sm uppercase outline-none focus:border-[#157c62]"
              value={settings.shadowColor}
              onChange={(event) => update("shadowColor", event.target.value)}
            />
          </div>
        </label>
        <Control
          label="Shadow opacity"
          value={settings.shadowOpacity}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => update("shadowOpacity", value)}
        />
        <div className="border-t border-[#dce5df] pt-5 sm:col-span-2 lg:col-span-1">
          <p className="font-mono text-xs tracking-[.16em] text-[#157c62]">
            GLASSMORPHISM
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-[#17201e] sm:col-span-2 lg:col-span-1">
          <input
            className="size-4 accent-[#157c62]"
            type="checkbox"
            checked={showBackdropText}
            onChange={(event) => setShowBackdropText(event.target.checked)}
          />
          Show backdrop text
        </label>
        <ColorControl
          label="Backdrop text color"
          value={backdropTextColor}
          onChange={setBackdropTextColor}
        />
        <Control
          label="Backdrop blur"
          value={settings.backdropBlur}
          min={0}
          max={40}
          suffix="px"
          onChange={(value) => update("backdropBlur", value)}
        />
        <Control
          label="Background opacity"
          value={settings.backgroundOpacity}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => update("backgroundOpacity", value)}
        />
        <Control
          label="Border opacity"
          value={settings.borderOpacity}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => update("borderOpacity", value)}
        />
        <Control
          label="Border radius"
          value={settings.radius}
          min={0}
          max={48}
          suffix="px"
          onChange={(value) => update("radius", value)}
        />
      </div>
    </div>
  );
}

function PalettePanel() {
  const [background, setBackground] = useState("#F7FAF7");
  const [foreground, setForeground] = useState("#17201E");
  const [base, setBase] = useState("#157C62");
  const [copied, setCopied] = useState("");
  const ratio = contrastRatio(background, foreground);
  const rgb = hexToRgb(base);
  const shades = useMemo(() => {
    if (!rgb) return [];
    return [
      {
        name: "Mist",
        value: rgbToHex(
          Math.round(rgb.r + (255 - rgb.r) * 0.8),
          Math.round(rgb.g + (255 - rgb.g) * 0.8),
          Math.round(rgb.b + (255 - rgb.b) * 0.8),
        ),
      },
      {
        name: "Soft",
        value: rgbToHex(
          Math.round(rgb.r + (255 - rgb.r) * 0.45),
          Math.round(rgb.g + (255 - rgb.g) * 0.45),
          Math.round(rgb.b + (255 - rgb.b) * 0.45),
        ),
      },
      { name: "Base", value: base.toUpperCase() },
      {
        name: "Deep",
        value: rgbToHex(
          Math.round(rgb.r * 0.7),
          Math.round(rgb.g * 0.7),
          Math.round(rgb.b * 0.7),
        ),
      },
      {
        name: "Ink",
        value: rgbToHex(
          Math.round(rgb.r * 0.42),
          Math.round(rgb.g * 0.42),
          Math.round(rgb.b * 0.42),
        ),
      },
    ];
  }, [base, rgb]);
  const score = (threshold: number) => (ratio >= threshold ? "Pass" : "Fail");

  return (
    <div
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]"
      role="tabpanel"
    >
      {/* বামপাশের কনট্রাস্ট চেকার প্যানেলটি এখন স্টিকি */}
      <div className="self-start rounded-2xl border border-[#d5e4da] bg-[#f8fbf8] p-5 shadow-[0_18px_45px_rgba(23,32,30,.07)] lg:sticky lg:top-6 sm:p-7">
        <div className="flex flex-col justify-between gap-5 border-b border-[#dce9df] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[.18em] text-[#157c62]">
              CONTRAST CHECK
            </p>
            <h3 className="mt-2 text-3xl font-medium tracking-[-.04em] text-[#17201e]">
              Make type effortless to read.
            </h3>
          </div>
          <div className="rounded-xl border border-[#cfe1d5] bg-white px-4 py-3 text-left shadow-[0_8px_20px_rgba(23,32,30,.04)] sm:min-w-32 sm:text-right">
            <span className="block font-mono text-[10px] font-semibold tracking-[.14em] text-[#91a19a]">
              RATIO
            </span>
            <strong className="mt-1 block text-4xl font-semibold leading-none tracking-tighter text-[#157c62]">
              {ratio.toFixed(2)}:1
            </strong>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${ratio >= 4.5 ? "bg-[#dff3e7] text-[#157c62]" : "bg-[#fff0eb] text-[#c65e45]"}`}
            >
              {ratio >= 4.5 ? "Accessible pair" : "Needs contrast"}
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Background", value: background, setValue: setBackground },
            { label: "Text color", value: foreground, setValue: setForeground },
          ].map((color) => (
            <label
              className="grid gap-2 text-sm font-medium text-[#17201e]"
              key={color.label}
            >
              <span className="text-xs font-semibold uppercase tracking-[.12em] text-[#71807b]">
                {color.label}
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-[#d5e4da] bg-white p-1.5 shadow-[0_4px_12px_rgba(23,32,30,.03)] focus-within:border-[#157c62]">
                <input
                  className="size-9 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0.5"
                  type="color"
                  value={color.value}
                  onChange={(event) =>
                    color.setValue(event.target.value.toUpperCase())
                  }
                />
                <input
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm uppercase outline-none"
                  value={color.value}
                  onChange={(event) => color.setValue(event.target.value)}
                  aria-label={`${color.label} HEX value`}
                />
              </div>
            </label>
          ))}
        </div>
        <div
          className="relative mt-6 overflow-hidden rounded-2xl p-7 shadow-[0_14px_28px_rgba(23,32,30,.12)]"
          style={{ background, color: foreground }}
        >
          <span className="absolute -right-5 -top-8 size-28 rounded-full border-18 border-current opacity-10" />
          <p className="relative font-mono text-[11px] tracking-[.16em] opacity-60">
            SAMPLE TYPE
          </p>
          <p className="relative mt-3 text-3xl font-semibold tracking-[-.04em]">
            Accessible by design.
          </p>
          <p className="relative mt-2 max-w-xs text-sm leading-6 opacity-75">
            This preview updates as your color pair changes.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#dce5df] bg-white p-4 shadow-[0_6px_16px_rgba(23,32,30,.03)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#17201e]">Normal text</p>
              <span className="rounded-full bg-[#eef4ef] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#71807b]">
                Body
              </span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span>AA 4.5:1</span>
              <b
                className={
                  score(4.5) === "Pass" ? "text-[#157c62]" : "text-[#c65e45]"
                }
              >
                {score(4.5)}
              </b>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>AAA 7:1</span>
              <b
                className={
                  score(7) === "Pass" ? "text-[#157c62]" : "text-[#c65e45]"
                }
              >
                {score(7)}
              </b>
            </div>
          </div>
          <div className="rounded-xl border border-[#dce5df] bg-white p-4 shadow-[0_6px_16px_rgba(23,32,30,.03)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#17201e]">Large text</p>
              <span className="rounded-full bg-[#eef4ef] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#71807b]">
                Display
              </span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span>AA 3:1</span>
              <b
                className={
                  score(3) === "Pass" ? "text-[#157c62]" : "text-[#c65e45]"
                }
              >
                {score(3)}
              </b>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>AAA 4.5:1</span>
              <b
                className={
                  score(4.5) === "Pass" ? "text-[#157c62]" : "text-[#c65e45]"
                }
              >
                {score(4.5)}
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* ডানপাশের প্যালেট বিল্ডার যা স্ক্রোল হবে */}
      <div className="rounded-2xl border border-[#dce5df] bg-[#f8faf8] p-5 shadow-[0_14px_35px_rgba(23,32,30,.04)] sm:p-6">
        <p className="font-mono text-xs tracking-[.16em] text-[#157c62]">
          PALETTE BUILDER
        </p>
        <h3 className="mt-2 text-xl font-medium">Build from a base color</h3>
        <label className="mt-5 grid gap-2 text-sm font-medium text-[#17201e]">
          Base HEX
          <div className="flex gap-2">
            <input
              className="size-11 rounded-lg border border-[#dce5df] bg-white p-1"
              type="color"
              value={rgb ? base : "#157c62"}
              onChange={(event) => setBase(event.target.value.toUpperCase())}
            />
            <input
              className="min-w-0 flex-1 rounded-lg border border-[#dce5df] bg-white px-3 uppercase outline-none focus:border-[#157c62]"
              value={base}
              onChange={(event) => setBase(event.target.value)}
            />
          </div>
        </label>
        <div className="mt-6 grid gap-2">
          {shades.map((shade) => (
            <div
              className="flex items-center justify-between gap-3 rounded-xl border border-[#dce5df] bg-white p-2"
              key={shade.name}
            >
              <span className="flex min-w-0 items-center gap-3">
                <i
                  className="size-9 shrink-0 rounded-lg border border-black/10"
                  style={{ background: shade.value }}
                />
                <span className="min-w-0">
                  <b className="block text-sm text-[#17201e]">{shade.name}</b>
                  <small className="block truncate font-mono text-xs text-[#71807b]">
                    {shade.value}
                  </small>
                  <small className="block truncate font-mono text-xs text-[#9aa8a2]">
                    {rgbValue(shade.value)}
                  </small>
                </span>
              </span>
              <span className="flex shrink-0 gap-1">
                <button
                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#157c62] transition hover:bg-[#e7f4ef]"
                  onClick={() => copyToClipboard(shade.value, setCopied)}
                  type="button"
                >
                  {copied === shade.value ? "Copied" : "HEX"}
                </button>
                <button
                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#157c62] transition hover:bg-[#e7f4ef]"
                  onClick={() =>
                    copyToClipboard(rgbValue(shade.value), setCopied)
                  }
                  type="button"
                >
                  {copied === rgbValue(shade.value) ? "Copied" : "RGB"}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DesignToolPanel({ kind }: { kind: DesignToolKind }) {
  return kind === "glass" ? <GlassPanel /> : <PalettePanel />;
}
