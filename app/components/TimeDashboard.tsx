"use client";

import { useEffect, useMemo, useState } from "react";

type Zone = {
  city: string;
  country: string;
  flag: string;
  timezone: string;
  code: string;
};
type Alarm = { id: number; label: string; due: number };
type Weather = {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
};
type CityResult = {
  name: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
};

const zones: Zone[] = [
  {
    city: "Dhaka",
    country: "Bangladesh",
    flag: "🇧🇩",
    timezone: "Asia/Dhaka",
    code: "BST",
  },
  {
    city: "New York",
    country: "United States",
    flag: "🇺🇸",
    timezone: "America/New_York",
    code: "EST",
  },
  {
    city: "Chicago",
    country: "United States",
    flag: "🇺🇸",
    timezone: "America/Chicago",
    code: "CST",
  },
  {
    city: "Toronto",
    country: "Canada",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    code: "EST",
  },
  {
    city: "Los Angeles",
    country: "United States",
    flag: "🇺🇸",
    timezone: "America/Los_Angeles",
    code: "PST",
  },
  {
    city: "Vancouver",
    country: "Canada",
    flag: "🇨🇦",
    timezone: "America/Vancouver",
    code: "PST",
  },
  {
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    timezone: "Europe/London",
    code: "GMT",
  },
];

const availableTimezones =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : zones.map((zone) => zone.timezone);

function timezoneCity(timezone: string) {
  return timezone.split("/").pop()?.replaceAll("_", " ") ?? timezone;
}

function timezoneCode(date: Date, timezone: string) {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "LOCAL"
  );
}

function weatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain showers";
  return "Stormy";
}

function offsetFor(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const value =
    parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  return (
    (match[1] === "+" ? 1 : -1) *
    (Number(match[2]) * 60 + Number(match[3] ?? 0))
  );
}

function formatDifference(minutes: number) {
  if (minutes === 0) return "BASE TIME";
  const sign = minutes > 0 ? "+" : "−";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const mins = absolute % 60;
  return `${sign}${hours}${mins ? `h ${mins}m` : "h"}`;
}

function formatTime(date: Date, timezone: string, twelveHour: boolean) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: twelveHour,
  }).format(date);
}

function formatDate(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function isDaytime(date: Date, timezone: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(date),
  );
  return hour >= 6 && hour < 18;
}

function playCompletionSound() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.setValueAtTime(880, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.34);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.36);
    window.setTimeout(() => void context.close(), 500);
  } catch {
    // Audio is optional and may be blocked by the browser.
  }
}

function TimezoneCard({
  zone,
  now,
  twelveHour,
  baseOffset,
  weather,
  weatherStatus,
}: {
  zone: Zone;
  now: Date;
  twelveHour: boolean;
  baseOffset: number;
  weather?: Weather;
  weatherStatus?: "loading" | "ready" | "error";
}) {
  const daytime = isDaytime(now, zone.timezone);
  return (
    <article className="group min-h-53.75 rounded-[10px] border border-[#d5e2da] bg-[linear-gradient(145deg,#ffffffd9,#f6faf7d9)] p-5 shadow-[0_18px_50px_#224c3d12] transition-all duration-300 hover:-translate-y-1 hover:border-[#157c62] hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid size-8.75 place-items-center rounded-lg bg-[#e7f1ec] text-xl"
            aria-hidden="true"
          >
            {zone.flag}
          </span>
          <div>
            <h3 className="text-[17px] font-semibold text-[#157c62] uppercase">
              {zone.city}
            </h3>
            <p className="mt-0.5 text-[13px] text-[#52645b]">
              {zone.country} / {zone.code}
            </p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.25 font-mono text-[11px] font-semibold tracking-[.08em] ${daytime ? "text-[#157c62]" : "text-[#df795f]"}`}
        >
          <span aria-hidden="true">{daytime ? "☼" : "☾"}</span>{" "}
          {daytime ? "DAY" : "NIGHT"}
        </span>
      </div>
      <div className="mt-8 flex items-end justify-between gap-2">
        <div>
          <p className="whitespace-nowrap font-mono text-[clamp(24px,2.5vw,34px)] font-medium tracking-[-1.5px] text-[#17201e]">
            {formatTime(now, zone.timezone, twelveHour)}
          </p>
          <p className="mt-2 text-[13px] uppercase tracking-[.14em] text-[#52645b]">
            {formatDate(now, zone.timezone)}
          </p>
        </div>
        <span className="text-right font-mono text-[13px] font-semibold text-[#df795f]">
          {formatDifference(offsetFor(now, zone.timezone) - baseOffset)}
        </span>
      </div>
      {weather && (
        <div className="mt-5 flex items-center justify-between border-t border-[#d5e2da] pt-3 text-[13px] text-[#52645b]">
          <span>
            ☁ {weatherLabel(weather.weatherCode)} ·{" "}
            {Math.round(weather.windSpeed)} km/h
          </span>
          <span className="font-mono font-semibold text-[#157c62]">
            {Math.round(weather.temperature)}°C
          </span>
        </div>
      )}
      {!weather && weatherStatus === "loading" && (
        <div className="mt-5 border-t border-[#d5e2da] pt-3 text-[13px] text-[#71807b]">
          Loading weather...
        </div>
      )}
      {!weather && weatherStatus === "error" && (
        <div className="mt-5 border-t border-[#d5e2da] pt-3 text-[13px] text-[#df795f]">
          Weather is temporarily unavailable.
        </div>
      )}
    </article>
  );
}

function CountdownTimer({ now }: { now: Date }) {
  const [remaining, setRemaining] = useState(25 * 60);
  const [total, setTotal] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(
      () => setRemaining((value) => Math.max(value - 1, 0)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (remaining === 0) {
      setRunning(false);
      playCompletionSound();
    }
  }, [remaining]);

  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");
  const progress = total ? ((total - remaining) / total) * 100 : 0;
  const circumference = 2 * Math.PI * 82;

  function setPreset(secondsValue: number) {
    setRemaining(secondsValue);
    setTotal(secondsValue);
    setRunning(false);
  }

  return (
    <section
      className="relative rounded-[10px] border border-[#d5e2da] bg-[linear-gradient(145deg,#ffffffd9,#f6faf7d9)] p-6.75 shadow-[0_18px_50px_#224c3d12] max-[640px]:p-5.25"
      aria-labelledby="countdown-title"
    >
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[.16em] text-[#8fa09a]">
            FOCUS WINDOW
          </p>
          <h2
            id="countdown-title"
            className="mt-2.5 text-[28px] tracking-[-.8px] text-[#17201e]"
          >
            Countdown timer
          </h2>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] text-[#157c62] before:inline-block before:size-1.75 before:rounded-full before:bg-[#157c62] before:shadow-[0_0_0_5px_#157c621c]">
          {running ? "RUNNING" : "PAUSED"}
        </span>
      </div>
      <div className="mt-6.5 flex items-center gap-9.5 max-[640px]:items-start max-[640px]:flex-col max-[640px]:gap-6">
        <div
          className="relative size-47.5 shrink-0"
          aria-label={`${minutes} minutes ${seconds} seconds remaining`}
        >
          <svg
            className="size-full -rotate-90"
            viewBox="0 0 190 190"
            aria-hidden="true"
          >
            <circle
              className="fill-none stroke-[#d5e2da] stroke-5"
              cx="95"
              cy="95"
              r="82"
            />
            <circle
              className="fill-none stroke-[#157c62] [stroke-linecap:round] stroke-5 transition-[stroke-dashoffset] duration-500 ease-linear"
              cx="95"
              cy="95"
              r="82"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <strong className="font-mono text-[34px] font-medium tracking-[-2px] text-[#17201e]">
              {minutes}:{seconds}
            </strong>
            <span className="mt-1.25 font-mono text-[10px] tracking-[.15em] text-[#52645b]">
              MINUTES
            </span>
          </div>
        </div>
        <div className="max-w-75 max-[640px]:max-w-none">
          <p className="text-sm leading-6 text-[#71807b]">
            Protect a small block of attention. Start with a preset or reset
            whenever you need a clean slate.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              className="min-h-10 rounded-md border border-[#157c62] bg-[#157c62] px-4 text-xs font-bold text-white transition-[transform,background] hover:bg-[#10664f]"
              type="button"
              onClick={() => setRunning((value) => !value)}
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              className="min-h-10 rounded-md border border-[#cbd7cc] bg-white px-4 text-xs font-bold text-[#71807b] transition-[transform,background] duration-200 hover:border-[#157c62] hover:text-[#17201e]"
              type="button"
              onClick={() => {
                setRunning(false);
                setRemaining(total);
              }}
            >
              Reset
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Timer presets">
            {[300, 900, 1800, 3600].map((value) => (
              <button
                className="min-h-10 rounded-md border border-[#cbd7cc] bg-white px-3 text-xs font-bold text-[#71807b] transition-[transform,background] duration-200 hover:border-[#157c62] hover:text-[#17201e]"
                type="button"
                key={value}
                onClick={() => setPreset(value)}
              >
                +{value === 3600 ? "1h" : `${value / 60}m`}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6.25 font-mono text-[11px] font-semibold tracking-[.16em] text-[#52645b]">
        SYSTEM CLOCK ·{" "}
        {now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </section>
  );
}

function TimeoutManager() {
  const [label, setLabel] = useState("Client call");
  const [delay, setDelay] = useState("15");
  const [unit, setUnit] = useState<"minutes" | "seconds">("minutes");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!alarms.length) return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      const due = alarms.filter((alarm) => alarm.due <= current);
      if (due.length) {
        setAlarms((items) => items.filter((alarm) => alarm.due > current));
        setToast(`${due[0].label} is due now`);
        playCompletionSound();
        window.setTimeout(() => setToast(""), 4000);
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [alarms]);

  function addAlarm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount =
      Math.max(1, Number(delay) || 1) * (unit === "minutes" ? 60 : 1) * 1000;
    setAlarms((items) => [
      ...items,
      {
        id: Date.now(),
        label: label.trim() || "Untitled reminder",
        due: Date.now() + amount,
      },
    ]);
    setLabel("");
  }

  return (
    <section
      className="relative rounded-[10px] border border-[#d5e2da] bg-[linear-gradient(145deg,#ffffffd9,#f6faf7d9)] p-6.75 shadow-[0_18px_50px_#224c3d12] max-[640px]:p-5.25"
      aria-labelledby="timeout-title"
    >
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[.16em] text-[#8fa09a]">
            DELAYED ACTIONS
          </p>
          <h2
            id="timeout-title"
            className="mt-2.5 text-[28px] tracking-[-.8px] text-[#17201e]"
          >
            Set a reminder
          </h2>
        </div>
        <span className="font-mono text-[11px] font-semibold tracking-[.16em] text-[#157c62]">
          {alarms.length.toString().padStart(2, "0")} ACTIVE
        </span>
      </div>
      <form className="mt-7 grid grid-cols-2 gap-3" onSubmit={addAlarm}>
        <label className="grid gap-2 font-mono text-[10px] tracking-[.08em] text-[#52645b] uppercase">
          <span>Label</span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Deploy code"
            className="w-full min-w-0 rounded-md border border-[#cbd7cc] bg-[#f8faf7] p-3 text-sm text-[#17201e] outline-0 placeholder:text-[#71807b] focus:border-[#157c62]"
          />
        </label>
        <label className="grid gap-2 font-mono text-[10px] tracking-[.08em] text-[#52645b] uppercase">
          <span>Delay</span>
          <div className="flex gap-1.5">
            <input
              type="number"
              min="1"
              value={delay}
              onChange={(event) => setDelay(event.target.value)}
              className="w-full min-w-0 rounded-md border border-[#cbd7cc] bg-[#f8faf7] p-3 text-sm text-[#17201e] outline-0 focus:border-[#157c62]"
            />
            <select
              className="w-25 min-w-0 rounded-md border border-[#cbd7cc] bg-[#f8faf7] p-3 text-sm text-[#17201e] outline-0 focus:border-[#157c62]"
              value={unit}
              onChange={(event) =>
                setUnit(event.target.value as "minutes" | "seconds")
              }
            >
              <option value="minutes">minutes</option>
              <option value="seconds">seconds</option>
            </select>
          </div>
        </label>
        <button
          className="col-span-full mt-1 min-h-10 justify-self-start rounded-md border border-[#157c62] bg-[#157c62] px-4 text-xs font-bold text-white hover:bg-[#10664f]"
          type="submit"
        >
          Add reminder <span aria-hidden="true">↗</span>
        </button>
      </form>
      <div className="mt-6 border-t border-[#d5e2da]">
        {alarms.length === 0 ? (
          <p className="pt-4.75 text-[13px] leading-normal text-[#52645b]">
            No active reminders. Add one for a client call, deploy, or stretch
            break.
          </p>
        ) : (
          alarms.map((alarm) => (
            <div
              className="grid grid-cols-[22px_1fr_auto_24px] items-center gap-2.25 border-b border-[#d5e2da] py-3.25 text-[13px]"
              key={alarm.id}
            >
              <span className="text-lg text-[#df795f]" aria-hidden="true">
                ◷
              </span>
              <strong className="text-[#17201e]">{alarm.label}</strong>
              <span className="font-mono text-[11px] text-[#52645b]">
                {new Date(alarm.due).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                type="button"
                className="border-0 bg-transparent text-xl text-[#71827a] hover:text-[#df795f]"
                aria-label={`Remove ${alarm.label}`}
                onClick={() =>
                  setAlarms((items) =>
                    items.filter((item) => item.id !== alarm.id),
                  )
                }
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      {toast && (
        <div
          className="fixed right-6 bottom-6 z-5 flex items-center gap-2.75 rounded-lg border border-[#df795f] bg-[#df795f] px-4.25 py-3.5 font-bold text-[#17201e] shadow-[0_15px_40px_#00000040]"
          role="status"
        >
          <span>✓</span>
          {toast}
        </div>
      )}
    </section>
  );
}

export default function TimeDashboard() {
  const [now, setNow] = useState(() => new Date());
  const [twelveHour, setTwelveHour] = useState(true);
  const [customTimezone, setCustomTimezone] = useState("Asia/Kolkata");
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [citySearch, setCitySearch] = useState("Kolkata");
  const [cityResult, setCityResult] = useState<CityResult>({
    name: "Kolkata",
    country: "India",
    timezone: "Asia/Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
  });
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState("");
  const baseOffset = useMemo(() => offsetFor(now, "Asia/Dhaka"), [now]);
  const filteredTimezones = useMemo(() => {
    const query = timezoneSearch.trim().toLowerCase();
    if (!query) return availableTimezones;
    return availableTimezones.filter((timezone) =>
      `${timezoneCity(timezone)} ${timezone}`.toLowerCase().includes(query),
    );
  }, [timezoneSearch]);
  useEffect(() => {
    const controller = new AbortController();
    setWeather(null);
    setWeatherStatus("loading");
    void fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${cityResult.latitude}&longitude=${cityResult.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Weather unavailable");
        return response.json() as Promise<{
          current: {
            temperature_2m: number;
            weather_code: number;
            wind_speed_10m: number;
          };
        }>;
      })
      .then((data) =>
        setWeather({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m,
        }),
      )
      .then(() => setWeatherStatus("ready"))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setWeather(null);
        setWeatherStatus("error");
      });
    return () => controller.abort();
  }, [cityResult]);

  const customZone: Zone = {
    city: cityResult.name,
    country: cityResult.country,
    flag: "✦",
    timezone: customTimezone,
    code: timezoneCode(now, customTimezone),
  };

  async function searchCity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = citySearch.trim();
    if (!query) return;
    setCityLoading(true);
    setCityError("");
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
      );
      if (!response.ok) throw new Error("City search failed");
      const data = (await response.json()) as {
        results?: Array<{
          name: string;
          country: string;
          timezone: string;
          latitude: number;
          longitude: number;
        }>;
      };
      const result = data.results?.[0];
      if (!result) throw new Error("City not found");
      setCityResult(result);
      setCustomTimezone(result.timezone);
    } catch {
      setCityError("City not found. Try another city name.");
    } finally {
      setCityLoading(false);
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-[calc(100vh-88px)] overflow-hidden  text-[#17201e]">
      <div className="pointer-events-none absolute -right-52.5 -top-82.5 size-155 rounded-full border border-[#157c6220] shadow-[0_0_100px_#157c620a]" />
      <div className="pointer-events-none absolute bottom-40 -left-65 size-95 rounded-full border border-[#df795f30]" />
      <div className="relative z-1 mx-auto max-w-7xl px-2 pt-18 pb-8.5 max-[640px]:pt-11.25">
        <header className="flex items-end justify-between gap-10 pb-18 max-[640px]:block max-[640px]:pb-12">
          <div>
            <p className="flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[.16em] text-[#157c62]">
              <span className="inline-block size-1.75 rounded-full bg-[#157c62] shadow-[0_0_0_5px_#157c621c]" />{" "}
              LOCAL / GLOBAL TIME DESK
            </p>
            <h1 className="mt-5 text-[clamp(46px,7vw,86px)] font-semibold leading-[.92] tracking-[-4px] text-[#17201e] max-[640px]:text-[52px] max-[640px]:tracking-[-2.5px]">
              Stay in sync
              <br />
              <em className="text-[#e07860] not-italic">across the room.</em>
            </h1>
            <p className="mt-7 max-w-105 text-base leading-[1.7] text-[#71807b]">
              A quiet command center for your distributed day, built around
              Bangladesh time.
            </p>
          </div>
          <div className="min-w-55 border-l border-[#d5e2da] pb-1.25 pl-6 text-right max-[640px]:mt-8.75 max-[640px]:border-t max-[640px]:border-l-0 max-[640px]:pt-5 max-[640px]:text-left">
            <p className="font-mono text-[11px] font-semibold tracking-[.16em] text-[#71807b]">
              MONDAY, AUG 24, 2026
            </p>
            <strong className="my-3 block font-mono text-[29px] font-medium tracking-[-1px] text-[#17201e]">
              {formatTime(now, "Asia/Dhaka", false)}
            </strong>
            <span className="font-mono text-[11px] font-semibold tracking-[.16em] text-[#71807b]">
              DHaka · BST · UTC +06:00
            </span>
          </div>
        </header>
        <section aria-labelledby="zones-title">
          <div className="flex items-end justify-between gap-5 max-[640px]:items-start max-[640px]:flex-col">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[.16em] text-[#8fa09a]">
                SEVEN LOCATIONS
              </p>
              <h2
                id="zones-title"
                className="mt-2.5 text-[28px] tracking-[-.8px] text-[#17201e]"
              >
                World clock
              </h2>
            </div>
            <div
              className="flex rounded-lg border border-[#d5e2da] bg-[#ffffffa8] p-1"
              role="group"
              aria-label="Clock format"
            >
              <button
                className={`rounded-[5px] border-0 px-3 py-2.25 font-mono text-[10px] font-semibold tracking-[.08em] ${twelveHour ? "bg-[#157c62] text-white" : "bg-transparent text-[#71807b]"}`}
                onClick={() => setTwelveHour(true)}
                type="button"
              >
                12 HOUR
              </button>
              <button
                className={`rounded-[5px] border-0 px-3 py-2.25 font-mono text-[10px] font-semibold tracking-[.08em] ${!twelveHour ? "bg-[#157c62] text-white" : "bg-transparent text-[#71807b]"}`}
                onClick={() => setTwelveHour(false)}
                type="button"
              >
                24 HOUR
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2.5 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
            {zones.map((zone) => (
              <TimezoneCard
                key={zone.timezone}
                zone={zone}
                now={now}
                twelveHour={twelveHour}
                baseOffset={baseOffset}
              />
            ))}
          </div>
          <div className="mt-2.5 rounded-[10px] border border-[#d5e2da] bg-white/75 p-5 shadow-[0_18px_50px_#224c3d0d]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold tracking-[.16em] text-[#157c62]">
                  EXPLORE ANYWHERE
                </p>
                <h3 className="mt-2 text-[21px] font-semibold tracking-[-.4px] text-[#17201e]">
                  Add another location
                </h3>
              </div>
              <form
                className="flex min-w-60 flex-1 flex-wrap items-end gap-2"
                onSubmit={searchCity}
              >
                <label className="grid min-w-60 flex-1 gap-2 font-mono text-[10px] font-semibold tracking-[.08em] text-[#52645b] uppercase">
                  <span>Search any city</span>
                  <input
                    className="rounded-md border border-[#cbd7cc] bg-[#f8faf7] px-3 py-2.5 font-sans text-sm normal-case tracking-normal text-[#17201e] outline-none placeholder:text-[#71807b] focus:border-[#157c62]"
                    value={citySearch}
                    onChange={(event) => setCitySearch(event.target.value)}
                    placeholder="e.g. Tokyo, Paris, Dubai"
                    type="search"
                  />
                </label>
                <button
                  className="min-h-10 rounded-md border border-[#157c62] bg-[#157c62] px-4 text-xs font-bold text-white hover:bg-[#10664f] disabled:cursor-wait disabled:opacity-60"
                  type="submit"
                  disabled={cityLoading}
                >
                  {cityLoading ? "Searching..." : "Search city"}
                </button>
                {cityError && (
                  <span className="basis-full font-sans text-xs normal-case tracking-normal text-[#df795f]">
                    {cityError}
                  </span>
                )}
              </form>
            </div>
            <div className="mt-4 grid max-w-md">
              <TimezoneCard
                zone={customZone}
                now={now}
                twelveHour={twelveHour}
                baseOffset={baseOffset}
                weather={weather ?? undefined}
                weatherStatus={weatherStatus}
              />
            </div>
          </div>
        </section>
        <div className="mt-2.5 grid grid-cols-[1.15fr_.85fr] gap-2.5 max-[900px]:grid-cols-1">
          <CountdownTimer now={now} />
          <TimeoutManager />
        </div>
      </div>
    </main>
  );
}
