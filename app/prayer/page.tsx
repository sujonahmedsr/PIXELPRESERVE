"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface BDDistrict {
  id: string;
  nameBn: string;
  nameEn: string;
  lat: number;
  lng: number;
}

const BD_DIVISIONS: BDDistrict[] = [
  { id: "dhaka", nameBn: "ঢাকা", nameEn: "Dhaka", lat: 23.8103, lng: 90.4125 },
  {
    id: "chittagong",
    nameBn: "চট্টগ্রাম",
    nameEn: "Chittagong",
    lat: 22.3569,
    lng: 91.7832,
  },
  {
    id: "sylhet",
    nameBn: "সিলেট",
    nameEn: "Sylhet",
    lat: 24.8949,
    lng: 91.8687,
  },
  {
    id: "rajshahi",
    nameBn: "রাজশাহী",
    nameEn: "Rajshahi",
    lat: 24.3636,
    lng: 88.6241,
  },
  {
    id: "khulna",
    nameBn: "খুলনা",
    nameEn: "Khulna",
    lat: 22.8456,
    lng: 89.5403,
  },
  {
    id: "barisal",
    nameBn: "বরিশাল",
    nameEn: "Barisal",
    lat: 22.701,
    lng: 90.3535,
  },
  {
    id: "rangpur",
    nameBn: "রংপুর",
    nameEn: "Rangpur",
    lat: 25.7439,
    lng: 89.2752,
  },
  {
    id: "mymensingh",
    nameBn: "ময়মনসিংহ",
    nameEn: "Mymensingh",
    lat: 24.7471,
    lng: 90.4203,
  },
];

interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
}

function timeStrToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

function minutesTo12h(totalMins: number): string {
  let norm = totalMins % 1440;
  if (norm < 0) norm += 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
}

function calculateBDOkTimes(
  date: Date,
  lat: number,
  lng: number,
): PrayerTimesData {
  const fajrAngle = 18;
  const ishaAngle = 18;
  const tzOffset = 6;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const d = jd - 2451545.0;

  const d2r = (deg: number) => (deg * Math.PI) / 180;
  const r2d = (rad: number) => (rad * 180) / Math.PI;

  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;
  const L = q + 1.915 * Math.sin(d2r(g)) + 0.02 * Math.sin(d2r(2 * g));

  const e = 23.439 - 0.00000036 * d;
  const RA =
    r2d(Math.atan2(Math.cos(d2r(e)) * Math.sin(d2r(L)), Math.cos(d2r(L)))) / 15;
  const sinDelta = Math.sin(d2r(e)) * Math.sin(d2r(L));
  const cosDelta = Math.sqrt(1 - sinDelta * sinDelta);
  const delta = r2d(Math.asin(sinDelta));

  const EqT = q / 15 - (RA < 0 ? RA + 24 : RA);
  const noon = 12 + tzOffset - lng / 15 - EqT;

  function hourAngle(alt: number): number {
    const sinH = Math.sin(d2r(alt));
    const cosLat = Math.cos(d2r(lat));
    const sinLat = Math.sin(d2r(lat));
    const cosH = (sinH - sinLat * sinDelta) / (cosLat * cosDelta);
    return r2d(Math.acos(Math.max(-1, Math.min(1, cosH)))) / 15;
  }

  const haSunrise = hourAngle(-0.8333);
  const haFajr = hourAngle(-fajrAngle);
  const haIsha = hourAngle(-ishaAngle);

  // Hanafi Asr (Shadow factor 2)
  const asrAltitude = -r2d(
    Math.atan(1 / (2 + Math.tan(d2r(Math.abs(lat - delta))))),
  );
  const haAsr = hourAngle(-asrAltitude);

  const formatDec = (decH: number, offsetMins: number = 0) => {
    let norm = (decH % 24) + offsetMins / 60;
    if (norm < 0) norm += 24;
    const totalM = Math.round(norm * 60);
    const h = Math.floor(totalM / 60) % 24;
    const min = totalM % 60;
    return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  };

  return {
    fajr: formatDec(noon - haFajr),
    sunrise: formatDec(noon - haSunrise),
    dhuhr: formatDec(noon, 1),
    asr: formatDec(noon + haAsr),
    sunset: formatDec(noon + haSunrise),
    maghrib: formatDec(noon + haSunrise, 1),
    isha: formatDec(noon + haIsha),
  };
}

export default function PrayerPage() {
  const [selectedDivision, setSelectedDivision] = useState<BDDistrict>(
    BD_DIVISIONS[0],
  );
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timings, setTimings] = useState<PrayerTimesData>(() =>
    calculateBDOkTimes(new Date(), BD_DIVISIONS[0].lat, BD_DIVISIONS[0].lng),
  );

  // Tick clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live timings with local caching
  useEffect(() => {
    let isCancelled = false;
    const dateKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `bd_salah_${selectedDivision.id}_${dateKey}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.fajr) {
          setTimings(parsed);
        }
      }
    } catch {
      // Ignore
    }

    async function fetchLive() {
      try {
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
          selectedDivision.nameEn,
        )}&country=Bangladesh&method=1&school=1`;
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error("API failed");
        const json = await res.json();
        const t = json?.data?.timings;
        if (t && !isCancelled) {
          const clean = (val: string) => val.split(" ")[0].trim();
          const liveData: PrayerTimesData = {
            fajr: clean(t.Fajr),
            sunrise: clean(t.Sunrise),
            dhuhr: clean(t.Dhuhr),
            asr: clean(t.Asr),
            sunset: clean(t.Sunset),
            maghrib: clean(t.Maghrib),
            isha: clean(t.Isha),
          };
          setTimings(liveData);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(liveData));
          } catch {
            // Ignore
          }
        }
      } catch {
        if (!isCancelled) {
          setTimings(
            calculateBDOkTimes(
              new Date(),
              selectedDivision.lat,
              selectedDivision.lng,
            ),
          );
        }
      }
    }

    fetchLive();
    return () => {
      isCancelled = true;
    };
  }, [selectedDivision]);

  const prayerState = useMemo(() => {
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const currentSecs = currentTime.getSeconds();
    const currentTotalSec = currentMins * 60 + currentSecs;

    const fajrM = timeStrToMinutes(timings.fajr);
    const sunriseM = timeStrToMinutes(timings.sunrise);
    const dhuhrM = timeStrToMinutes(timings.dhuhr);
    const asrM = timeStrToMinutes(timings.asr);
    const sunsetM = timeStrToMinutes(timings.sunset || timings.maghrib);
    const maghribM = timeStrToMinutes(timings.maghrib);
    const ishaM = timeStrToMinutes(timings.isha);

    // 3 Prohibited Times matching Islamic Foundation & MuslimBangla
    const p1Start = sunriseM;
    const p1End = sunriseM + 15;

    const p2Start = dhuhrM - 6;
    const p2End = dhuhrM;

    const p3Start = sunsetM - 16;
    const p3End = sunsetM;

    let isProhibited = false;
    let prohibitedName = "";
    let prohibitedEndM = 0;

    if (currentMins >= p1Start && currentMins < p1End) {
      isProhibited = true;
      prohibitedName = "Sunrise (সূর্যোদয়)";
      prohibitedEndM = p1End;
    } else if (currentMins >= p2Start && currentMins < p2End) {
      isProhibited = true;
      prohibitedName = "Solar Noon / Zawal (দ্বিপ্রহর)";
      prohibitedEndM = p2End;
    } else if (currentMins >= p3Start && currentMins < p3End) {
      isProhibited = true;
      prohibitedName = "Sunset (সূর্যাস্ত)";
      prohibitedEndM = p3End;
    }

    const prayers = [
      {
        id: "fajr",
        name: "Fajr",
        subName: "ফজর",
        mins: fajrM,
        endMins: sunriseM - 1,
        icon: "🌅",
      },
      {
        id: "sunrise",
        name: "Sunrise",
        subName: "সূর্যোদয়",
        mins: sunriseM,
        endMins: p1End,
        icon: "☀️",
        isMarker: true,
      },
      {
        id: "dhuhr",
        name: "Dhuhr",
        subName: "যুহর",
        mins: dhuhrM,
        endMins: asrM - 1,
        icon: "🌞",
      },
      {
        id: "asr",
        name: "Asr (Hanafi)",
        subName: "আসর (হানাফি)",
        mins: asrM,
        endMins: sunsetM - 1,
        icon: "⛅",
      },
      {
        id: "maghrib",
        name: "Maghrib",
        subName: "মাগরিব",
        mins: maghribM,
        endMins: ishaM - 1,
        icon: "🌇",
      },
      {
        id: "isha",
        name: "Isha",
        subName: "ইশা",
        mins: ishaM,
        endMins: fajrM - 1,
        icon: "🌙",
      },
    ];

    let currentPrayer = prayers[0];
    let nextPrayer = prayers[0];
    let remainingSec = 0;

    for (let i = 0; i < prayers.length; i++) {
      const p = prayers[i];
      if (currentMins < p.mins) {
        nextPrayer = p;
        remainingSec = p.mins * 60 - currentTotalSec;
        currentPrayer = i > 0 ? prayers[i - 1] : prayers[prayers.length - 1];
        break;
      }
    }

    if (currentMins >= prayers[prayers.length - 1].mins) {
      currentPrayer = prayers[prayers.length - 1];
      nextPrayer = prayers[0];
      remainingSec = 1440 * 60 - currentTotalSec + prayers[0].mins * 60;
    }

    const cdH = Math.floor(remainingSec / 3600);
    const cdM = Math.floor((remainingSec % 3600) / 60);
    const cdS = remainingSec % 60;
    const countdownFormatted = `${cdH > 0 ? `${cdH}h ` : ""}${cdM}m ${cdS}s`;

    const tahajjudSahriEnd = minutesTo12h(fajrM - 1);
    const ishraqChashtStart = minutesTo12h(p1End + 1);
    const ishraqChashtEnd = minutesTo12h(p2Start - 1);

    return {
      isProhibited,
      prohibitedName,
      prohibitedEndStr: isProhibited ? minutesTo12h(prohibitedEndM) : "",
      currentPrayer,
      nextPrayer,
      countdownFormatted,
      prayers,
      p1Str: `${minutesTo12h(p1Start)} - ${minutesTo12h(p1End)}`,
      p2Str: `${minutesTo12h(p2Start)} - ${minutesTo12h(p2End)}`,
      p3Str: `${minutesTo12h(p3Start)} - ${minutesTo12h(p3End)}`,
      tahajjudSahriEnd,
      ishraqChashtStr: `${ishraqChashtStart} - ${ishraqChashtEnd}`,
    };
  }, [currentTime, timings]);

  return (
    <main className="mx-auto w-[calc(100%-24px)] max-w-7xl px-0 pb-16 min-[701px]:w-[calc(100%-56px)]">
      {/* Breadcrumb & Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--text-primary)]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)]">Prayer Times</span>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
        >
          &larr; Back to Tools
        </Link>
      </div>

      {/* Hero Header */}
      <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-glass)] p-6 backdrop-blur-[18px] sm:p-8 min-[701px]:rounded-[26px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-500">
              <span>🕌</span>
              <span>BANGLADESH STANDARD (ইফা)</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Islamic Prayer &amp; Salah Times
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Official Bangladesh timetable calibrated to Islamic Foundation
              Bangladesh &amp; MuslimBangla.com
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-right font-mono text-xs">
            <div className="text-[var(--text-secondary)]">
              Current Time (BST):
            </div>
            <div className="text-base font-bold text-[var(--text-primary)]">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <div className="text-[11px] text-[var(--accent)]">
              {selectedDivision.nameEn} ({selectedDivision.nameBn}), Bangladesh
            </div>
          </div>
        </div>

        {/* Real-time Status Card */}
        <div className="mt-6">
          {prayerState.isProhibited ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-500">
              <div className="flex items-start gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-rose-400">
                    Salah is Currently Prohibited (Makruh Tahrimi)
                  </h3>
                  <p className="mt-1 text-base font-semibold text-rose-300">
                    {prayerState.prohibitedName} prohibited period in progress
                    until {prayerState.prohibitedEndStr}.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-rose-200/80">
                    It is strictly forbidden to perform obligatory or voluntary
                    prayers during sunrise, midday zenith (Zawal), and sunset
                    (Sahih Muslim 831).
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-600">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🟢</span>
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-emerald-600">
                    Permissible for Prayer
                  </h3>
                  <p className="mt-0.5 text-base font-semibold text-emerald-600">
                    Active Waqt:{" "}
                    <strong>{prayerState.currentPrayer.name}</strong> (
                    {prayerState.currentPrayer.subName}) · Next:{" "}
                    <strong>{prayerState.nextPrayer.name}</strong> (
                    {prayerState.countdownFormatted} remaining).
                  </p>
                  <p className="mt-1 text-xs text-emerald-500">
                    All obligatory (Fard) and voluntary (Nafl) prayers are
                    currently permissible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Division Selector */}
        <div className="mt-6">
          <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Select Division / District:
          </div>
          <div className="flex flex-wrap gap-2">
            {BD_DIVISIONS.map((div) => (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivision(div)}
                className={`rounded-xl border px-3.5 py-2 font-mono text-xs font-medium transition ${
                  selectedDivision.id === div.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                    : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                {div.nameEn} ({div.nameBn})
              </button>
            ))}
          </div>
        </div>

        {/* 5 Daily Prayers Grid */}
        <div className="mt-8">
          <h2 className="mb-3 font-mono text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Today&apos;s Daily Prayer Schedule ({selectedDivision.nameEn})
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {prayerState.prayers.map((prayer) => {
              const isCurrent = prayerState.currentPrayer.id === prayer.id;
              const isNext = prayerState.nextPrayer.id === prayer.id;

              return (
                <div
                  key={prayer.id}
                  className={`rounded-2xl border p-4 text-center transition ${
                    isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : isNext
                        ? "border-amber-500/40 bg-amber-500/5 text-[var(--text-primary)]"
                        : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <div className="text-2xl">{prayer.icon}</div>
                  <div className="mt-1 font-mono text-xs font-bold uppercase tracking-wider">
                    {prayer.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {prayer.subName}
                  </div>
                  <div className="mt-2 font-mono text-base font-bold text-[var(--accent)]">
                    {minutesTo12h(prayer.mins)}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[var(--text-secondary)]">
                    Ends: {minutesTo12h(prayer.endMins)}
                  </div>
                  {isCurrent && (
                    <span className="mt-2 inline-block rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                  {isNext && !isCurrent && (
                    <span className="mt-2 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                      Up Next
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Prohibited Times Detailed Breakdown */}
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-rose-500">
              3 Prohibited Salah Intervals (Today)
            </h3>
            <span className="rounded bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-500">
              Makruh Tahrimi
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            According to Islamic Fiqh, performing any prayer (Fard or Nafl) is
            strictly prohibited during these three daily intervals:
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Sunrise */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span>1. Sunrise (সূর্যোদয়)</span>
                <span>15 min</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                {prayerState.p1Str}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                From sunrise for 15 minutes until the sun is a spear&apos;s
                height above the horizon. Ishraq begins after this ends.
              </p>
            </div>

            {/* Solar Noon / Zawal */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span>2. Solar Noon / Zawal (দ্বিপ্রহর)</span>
                <span>6 min</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                {prayerState.p2Str}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                From 6 minutes before Dhuhr until Dhuhr starts. When the sun is
                directly overhead at its meridian.
              </p>
            </div>

            {/* Sunset */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span>3. Sunset (সূর্যাস্ত)</span>
                <span>16 min</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                {prayerState.p3Str}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                From 16 minutes before Maghrib until the sun fully sets. (Except
                for that day&apos;s delayed Asr prayer).
              </p>
            </div>
          </div>
        </div>

        {/* Nafl & Voluntary Timings */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 font-mono text-xs text-[var(--text-secondary)]">
          <div>
            <span className="font-semibold uppercase text-[var(--text-primary)]">
              Tahajjud / Sahri End:
            </span>{" "}
            <strong className="text-[var(--accent)]">
              {prayerState.tahajjudSahriEnd}
            </strong>
          </div>
          <div>
            <span className="font-semibold uppercase text-[var(--text-primary)]">
              Ishraq &amp; Chasht (Duha):
            </span>{" "}
            <strong className="text-[var(--accent)]">
              {prayerState.ishraqChashtStr}
            </strong>
          </div>
          <div>
            <a
              href="https://muslimbangla.com/world/BD/prayer-times-Dhaka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Verified against MuslimBangla.com &amp; Islamic Foundation &rarr;
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
