# Pixel Preserve Tools

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38BDF8?style=for-the-badge&logo=tailwind-css)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions)

A modern, high-performance web dashboard application combining real-time global time management, auto-detected weather monitoring, and a productivity-driven focus suite (Pomodoro timer & reminders). Designed with a clean, responsive UI and optimized for developer productivity and seamless client-side persistence.

---

## 🌟 Key Features

### 🌐 1. World Time Engine & Real-Time Sync

- **Multi-City Clock Dashboard:** Monitor multiple global time zones simultaneously (defaulting to Dhaka, New York, London, Tokyo, etc.).
- **Dynamic Day/Night Visual Cards:** Themes automatically adjust based on local sunrise/sunset hours for each time zone.
- **Instant Time Zone Math:** Automatic calculation of offset differences relative to Bangladesh Standard Time (BST / UTC+6).
- **Flexible Display Format:** Toggle seamlessly between 12-hour and 24-hour time formats.
- **Custom City Addition:** Geocoding integration allowing users to search and add any world city dynamically.

### 🌤️ 2. Accurate Weather Integration

- **Auto GPS Detection:** Instant high-accuracy weather detection using HTML5 Geolocation API (`latitude` & `longitude`).
- **Live Temperature & Weather Codes:** Real-time metrics fetched via Open-Meteo API (`temperature_2m`, `weather_code`).
- **Fast Parallel Data Fetching:** Optimized asynchronous requests (`Promise.all`) ensuring zero delay when updating multiple cities.

### ⏱️ 3. Pomodoro Focus Engine

- **Visual Countdown Ring:** SVG-based interactive progress ring for visual time tracking.
- **Custom Presets:** Quick-select focus intervals (5m, 15m, 25m, 60m).
- **Audio & Browser Push Notifications:** Web Audio API sound alerts and native browser notifications upon timer completion.
- **Floating Command Bar:** Persistent floating controls active while navigating focus sessions.

### 🔔 4. Task Reminders & Alert System

- **Quick Task Reminders:** Set custom alerts in minutes or seconds.
- **Local Storage Persistence:** Reminders and user preferences automatically stored across sessions.
- **Toast & Audio Alerts:** Sound and UI toast notifications triggered when reminders expire.

### ⚡ 5. Enterprise-Grade CI/CD & Architecture

- **Strict TypeScript Verification:** Automated type checks (`tsc --noEmit`) integrated into the workflow.
- **GitHub Actions Pipeline:** Automated Continuous Integration ensuring zero broken builds or hydration errors reach production.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Library:** React 19
- **Language:** TypeScript 7.0
- **Styling:** Tailwind CSS v4
- **State & Storage:** React Hooks + LocalStorage API
- **APIs Used:**
  - Open-Meteo Weather API
  - Open-Meteo Geocoding API
  - Web Audio API & Web Notification API
- **CI/CD:** GitHub Actions

---

## 📁 Project Structure

```text
pixel-preserve-tools/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD Pipeline
├── src/
│   └── app/
│       ├── page.tsx            # Global Dashboard & Focus Command Center
│       ├── layout.tsx          # Root Layout
│       └── globals.css         # Global Styles (Tailwind CSS v4)
├── public/                     # Static Assets
├── package.json                # Dependencies and Scripts
├── tsconfig.json               # TypeScript Configuration
└── README.md                   # Documentation
```
