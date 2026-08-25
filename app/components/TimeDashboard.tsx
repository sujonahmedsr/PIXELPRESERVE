"use client";

import { useEffect, useMemo, useState } from "react";

type Zone = {
  id: string;
  city: string;
  country: string;
  flag: string;
  timezone: string;
  code: string;
};

type Alarm = { id: number; label: string; due: number };

const INITIAL_ZONES: Zone[] = [
  {
    id: "dhaka",
    city: "Dhaka",
    country: "Bangladesh",
    flag: "🇧🇩",
    timezone: "Asia/Dhaka",
    code: "BST",
  },
  {
    id: "ny",
    city: "New York",
    country: "United States",
    flag: "🇺🇸",
    timezone: "America/New_York",
    code: "EST",
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    timezone: "Europe/London",
    code: "GMT",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    timezone: "Asia/Tokyo",
    code: "JST",
  },
];

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
    year: "numeric",
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

function playNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(587.33, context.currentTime);
    oscillator.frequency.setValueAtTime(880, context.currentTime + 0.15);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.42);
    setTimeout(() => void context.close(), 500);
  } catch {
    // Audio fallback
  }
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (e) {
      console.error(e);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

export default function TimeDashboard() {
  const [now, setNow] = useState(() => new Date());
  const [twelveHour, setTwelveHour] = useLocalStorage("clock_12h_pref", true);
  const [zones, setZones] = useLocalStorage<Zone[]>(
    "clock_zones",
    INITIAL_ZONES,
  );
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>("clock_alarms", []);

  const [citySearch, setCitySearch] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState("");

  // Persistent Timer State using LocalStorage & Target Time
  const [timerTotal, setTimerTotal] = useLocalStorage(
    "timer_total_sec",
    25 * 60,
  );
  const [timerEndAt, setTimerEndAt] = useLocalStorage<number | null>(
    "timer_end_at",
    null,
  );
  const [timerPausedRemaining, setTimerPausedRemaining] =
    useLocalStorage<number>("timer_paused_rem", 25 * 60);
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const [alarmLabel, setAlarmLabel] = useState("");
  const [alarmDelay, setAlarmDelay] = useState("10");
  const [alarmUnit, setAlarmUnit] = useState<"minutes" | "seconds">("minutes");
  const [toast, setToast] = useState("");

  const baseOffset = useMemo(() => offsetFor(now, "Asia/Dhaka"), [now]);

  // Request Notification Permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
  }, []);

  // Main Live Clock Interval
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Sync Timer across Page Refresh / Navigation using Target Timestamp
  useEffect(() => {
    if (timerEndAt) {
      const remaining = Math.max(
        0,
        Math.ceil((timerEndAt - Date.now()) / 1000),
      );
      if (remaining > 0) {
        setTimerSeconds(remaining);
        setTimerRunning(true);
      } else {
        setTimerSeconds(0);
        setTimerRunning(false);
        setTimerEndAt(null);
      }
    } else {
      setTimerSeconds(timerPausedRemaining);
      setTimerRunning(false);
    }
  }, []);

  // Timer Tick Engine
  useEffect(() => {
    if (!timerRunning || !timerEndAt) return;

    const interval = window.setInterval(() => {
      const remaining = Math.ceil((timerEndAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimerSeconds(0);
        setTimerRunning(false);
        setTimerEndAt(null);
        setTimerPausedRemaining(timerTotal);
        playNotificationSound();

        if (Notification.permission === "granted") {
          new Notification("Timer Completed!", {
            body: "Your focus session is over.",
          });
        }
      } else {
        setTimerSeconds(remaining);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning, timerEndAt, timerTotal]);

  // Alarm Check Engine
  useEffect(() => {
    if (!alarms.length) return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      const due = alarms.filter((item) => item.due <= current);
      if (due.length) {
        setAlarms((items) => items.filter((item) => item.due > current));
        const message = `Reminder: ${due[0].label}`;
        setToast(message);
        playNotificationSound();

        if (Notification.permission === "granted") {
          new Notification("Reminder Alert!", { body: due[0].label });
        }

        setTimeout(() => setToast(""), 5000);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [alarms, setAlarms]);

  // Timer Handlers
  const handleStartTimer = () => {
    playNotificationSound(); // Unlocks audio context on user interaction
    const targetTime = Date.now() + timerSeconds * 1000;
    setTimerEndAt(targetTime);
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setTimerEndAt(null);
    setTimerPausedRemaining(timerSeconds);
    setTimerRunning(false);
  };

  const handleResetTimer = (newTotalSecs?: number) => {
    const total = newTotalSecs ?? timerTotal;
    setTimerEndAt(null);
    setTimerRunning(false);
    setTimerTotal(total);
    setTimerPausedRemaining(total);
    setTimerSeconds(total);
  };

  async function handleAddCity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = citySearch.trim();
    if (!query) return;

    setCityLoading(true);
    setCityError("");
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as {
        results?: Array<{ name: string; country: string; timezone: string }>;
      };
      const result = data.results?.[0];
      if (!result) throw new Error("City not found");

      const getCountryCode = (resultObj: {
        name: string;
        country: string;
        timezone: string;
      }): string => {
        // Safe runtime check using 'in' operator
        if (
          "countryCode" in resultObj &&
          typeof (resultObj as Record<string, unknown>).countryCode === "string"
        ) {
          return ((resultObj as Record<string, unknown>).countryCode as string)
            .trim()
            .slice(0, 2)
            .toUpperCase();
        }

        if (resultObj.country && resultObj.country.trim().length >= 2) {
          return resultObj.country.trim().slice(0, 2).toUpperCase();
        }

        return "XX";
      };

      const newZone: Zone = {
        id: `${result.name.toLowerCase()}-${Date.now()}`,
        city: result.name,
        country: result.country,
        flag: getCountryCode(result),
        timezone: result.timezone,
        code: timezoneCode(now, result.timezone),
      };

      setZones((prev) => [...prev, newZone]);
      setCitySearch("");
    } catch {
      setCityError("City not found. Try another city.");
    } finally {
      setCityLoading(false);
    }
  }

  function handleAddAlarm(e: React.FormEvent) {
    e.preventDefault();
    playNotificationSound();
    const amount =
      Math.max(1, Number(alarmDelay) || 1) *
      (alarmUnit === "minutes" ? 60 : 1) *
      1000;
    setAlarms((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: alarmLabel.trim() || "Quick Task",
        due: Date.now() + amount,
      },
    ]);
    setAlarmLabel("");
  }

  const timerMins = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, "0");
  const timerSecs = (timerSeconds % 60).toString().padStart(2, "0");
  const timerProgress = timerTotal
    ? ((timerTotal - timerSeconds) / timerTotal) * 100
    : 0;

  return (
    <main className="relative min-h-screen text-[#17201e] px-4 sm:px-8 py-10 text-base pb-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-[#e2ece6]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5e2da] bg-white px-3 py-1  text-xs font-semibold text-[#157c62]">
              <span className="h-2 w-2 rounded-full bg-[#157c62] animate-pulse" />
              REALTIME DASHBOARD
            </div>
            <h1 className="mt-3 text-3xl sm:text-[38px] leading-tight font-bold tracking-tight text-[#17201e]">
              GLOBAL SYNC & FOCUS COMMAND
            </h1>
          </div>
          <div className="text-right">
            <p className=" text-xs font-semibold text-[#71807b]">
              {formatDate(now, "Asia/Dhaka").toUpperCase()}
            </p>
            <strong className="block  text-3xl font-semibold text-[#157c62]">
              {formatTime(now, "Asia/Dhaka", false)}
            </strong>
            <span className=" text-xs text-[#71807b]">
              DHAKA (BST) UTC +06:00
            </span>
          </div>
        </header>

        {/* World Clock Grid Section */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#17201e]">
                WORLD TIME ENGINE
              </h2>
              <p className="text-sm text-[#71807b]">
                Synced automatically in local storage
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <form onSubmit={handleAddCity} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add City..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="rounded-xl border border-[#d5e2da] bg-white px-3.5 py-2 text-sm outline-none transition focus:border-[#157c62] focus:ring-1 focus:ring-[#157c62]"
                />
                <button
                  type="submit"
                  disabled={cityLoading}
                  className="rounded-xl bg-[#157c62] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#10664f] disabled:opacity-50"
                >
                  {cityLoading ? "..." : "+ Add"}
                </button>
              </form>

              <div className="flex rounded-xl border border-[#d5e2da] bg-white p-1">
                <button
                  onClick={() => setTwelveHour(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs  font-bold transition ${
                    twelveHour
                      ? "bg-[#157c62] text-white"
                      : "text-[#71807b] hover:text-[#17201e]"
                  }`}
                >
                  12H
                </button>
                <button
                  onClick={() => setTwelveHour(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs  font-bold transition ${
                    !twelveHour
                      ? "bg-[#157c62] text-white"
                      : "text-[#71807b] hover:text-[#17201e]"
                  }`}
                >
                  24H
                </button>
              </div>
            </div>
          </div>

          {cityError && (
            <p className="mb-4 text-sm font-medium text-[#df795f]">
              {cityError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {zones.map((zone) => {
              const daytime = isDaytime(now, zone.timezone);
              return (
                <article
                  key={zone.id}
                  className={`relative rounded-2xl border p-6 transition-all duration-200 ${
                    daytime
                      ? "border-[#e2ece6] bg-white text-[#17201e]"
                      : "border-[#2c3e38] bg-[#1a2421] text-white"
                  }`}
                >
                  {zones.length > 1 && (
                    <button
                      onClick={() =>
                        setZones((prev) =>
                          prev.filter((item) => item.id !== zone.id),
                        )
                      }
                      className="absolute top-2 right-3 text-sm text-[#71807b] hover:text-[#df795f] transition"
                    >
                      ✕
                    </button>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{zone.flag}</span>
                    <span
                      className={` text-xs font-bold px-2.5 py-1 rounded-full border ${
                        daytime
                          ? "bg-[#f1f7f4] border-[#d5e2da] text-[#157c62]"
                          : "bg-[#253530] border-[#364b44] text-[#52b79a]"
                      }`}
                    >
                      {daytime ? "☼ DAY" : "☾ NIGHT"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold uppercase tracking-tight">
                    {zone.city}
                  </h3>
                  <p className="text-sm text-[#71807b]">{zone.country}</p>
                  <div className="mt-6 flex items-baseline justify-between border-t border-dashed border-[#cbd7cc]/40 pt-4">
                    <p className=" text-2xl">
                      {formatTime(now, zone.timezone, twelveHour)}
                    </p>
                    <span className=" text-xs font-semibold text-[#df795f]">
                      {formatDifference(
                        offsetFor(now, zone.timezone) - baseOffset,
                      )}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Premium Tools Grid */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Timer */}
          <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <span className=" text-xs font-bold text-[#8fa09a] tracking-widest uppercase">
                  FOCUS TIMER
                </span>
                <h2 className="text-xl font-bold text-[#17201e] mt-0.5">
                  POMODORO WINDOW
                </h2>
              </div>
              <span className=" text-xs px-2.5 py-1 rounded-full border border-[#e2ece6] bg-[#fafcfb] text-[#71807b]">
                {timerRunning ? "● ACTIVE" : "PAUSED"}
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative size-48 grid place-content-center">
                <svg
                  className="absolute size-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    className="fill-none stroke-[#f1f5f3] stroke-8"
                    cx="50"
                    cy="50"
                    r="42"
                  />
                  <circle
                    className="fill-none stroke-[#157c62] stroke-8 transition-all duration-300"
                    cx="50"
                    cy="50"
                    r="42"
                    strokeDasharray={264}
                    strokeDashoffset={264 * (1 - timerProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className=" text-4xl font-bold tracking-tight">
                  {timerMins}:{timerSecs}
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={timerRunning ? handlePauseTimer : handleStartTimer}
                  className="rounded-xl bg-[#157c62] px-7 py-2.5 text-sm font-bold text-white transition hover:bg-[#10664f]"
                >
                  {timerRunning ? "Pause" : "Start Focus"}
                </button>
                <button
                  onClick={() => handleResetTimer()}
                  className="rounded-xl border border-[#d5e2da] px-6 py-2.5 text-sm font-bold text-[#71807b] transition hover:border-[#17201e] hover:text-[#17201e]"
                >
                  Reset
                </button>
              </div>

              <div className="mt-5 flex gap-2">
                {[300, 900, 1500, 3600].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleResetTimer(sec)}
                    className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                      timerTotal === sec
                        ? "border-[#157c62] bg-[#f1f7f4] text-[#157c62]"
                        : "border-[#d5e2da] text-[#71807b] hover:border-[#157c62] hover:text-[#157c62]"
                    }`}
                  >
                    {sec / 60}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Reminders */}
          <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <span className=" text-xs font-bold text-[#8fa09a] tracking-widest uppercase">
                    ALERT SYSTEM
                  </span>
                  <h2 className="text-xl font-bold text-[#17201e] mt-0.5">
                    REMINDERS
                  </h2>
                </div>
                <span className=" text-xs font-bold text-[#157c62] bg-[#f1f7f4] border border-[#d5e2da] px-3 py-1 rounded-full">
                  {alarms.length} ACTIVE
                </span>
              </div>

              <form onSubmit={handleAddAlarm} className="mt-5 grid gap-3">
                <input
                  type="text"
                  placeholder="Reminder Title (e.g. Client Call)"
                  value={alarmLabel}
                  onChange={(e) => setAlarmLabel(e.target.value)}
                  className="rounded-xl border border-[#d5e2da] p-3 text-sm outline-none transition focus:border-[#157c62] focus:ring-1 focus:ring-[#157c62]"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={alarmDelay}
                    onChange={(e) => setAlarmDelay(e.target.value)}
                    className="w-full rounded-xl border border-[#d5e2da] p-3 text-sm outline-none transition focus:border-[#157c62] focus:ring-1 focus:ring-[#157c62]"
                  />
                  <select
                    value={alarmUnit}
                    onChange={(e) =>
                      setAlarmUnit(e.target.value as "minutes" | "seconds")
                    }
                    className="rounded-xl border border-[#d5e2da] p-3 text-sm outline-none focus:border-[#157c62] bg-white cursor-pointer"
                  >
                    <option value="minutes">mins</option>
                    <option value="seconds">secs</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-[#157c62] py-3 text-sm font-bold text-white transition hover:bg-[#10664f]"
                >
                  + Add Reminder
                </button>
              </form>
            </div>

            <div className="mt-5 max-h-40 overflow-y-auto divide-y divide-[#e2ece6]">
              {alarms.length === 0 ? (
                <p className="text-sm text-[#71807b] py-3 text-center border border-dashed border-[#d5e2da] rounded-xl mt-2">
                  No active reminders set.
                </p>
              ) : (
                alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="flex justify-between items-center py-2.5 text-sm"
                  >
                    <span className="font-medium text-[#17201e]">
                      {alarm.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className=" text-xs text-[#71807b] bg-[#f1f5f3] px-2 py-1 rounded-md border border-[#e2ece6]">
                        {new Date(alarm.due).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() =>
                          setAlarms((items) =>
                            items.filter((item) => item.id !== alarm.id),
                          )
                        }
                        className="text-[#71807b] hover:text-[#df795f] font-bold text-lg px-1 transition"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Global Bottom Sticky Countdown Bar */}
      {timerRunning && (
        <aside className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-full border border-[#157c62]/30 bg-[#17201e] px-5 py-2.5 text-white backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#52b79a] animate-ping" />
            <span className=" text-xs font-semibold uppercase tracking-wider text-[#9bb3ab]">
              Focus Session
            </span>
          </div>
          <div className=" text-lg font-bold text-[#ffffff] border-x border-[#2c3e38] px-3">
            {timerMins}:{timerSecs}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePauseTimer}
              className="rounded-full bg-[#2c3e38] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#3d544c]"
            >
              Pause
            </button>
            <button
              onClick={() => handleResetTimer()}
              className="rounded-full border border-[#2c3e38] px-3 py-1 text-xs font-bold text-[#9bb3ab] transition hover:text-white"
            >
              Reset
            </button>
          </div>
        </aside>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-[#df795f] bg-[#df795f] px-5 py-3.5 font-bold text-white animate-bounce text-sm">
          🔔 {toast}
        </div>
      )}
    </main>
  );
}
