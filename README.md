# PixelPreserve

PixelPreserve is a privacy-first browser toolkit for freelancers, developers, and designers. It brings everyday utilities into one responsive Next.js app: image conversion, text and JSON helpers, design tools, a Fiverr message checker, a local task board, and a world-time focus desk.

All core editing and productivity data stays in the browser. No account is required.

## Features

- **WebP converter** — Convert multiple images in the browser, preserve dimensions, choose a quality level, download files individually, or export a real `.zip` archive.
- **Text case transformer** — Convert text to sentence, lower, upper, title, alternating, capitalized, or inverse case and copy the result.
- **JSON formatter** — Validate and pretty-print JSON.
- **Glass & shadow generator** — Adjust glassmorphism settings and copy the generated CSS.
- **Palette checker** — Generate shades from a base colour and check WCAG contrast ratios.
- **Fiverr message checker** — Detect configured restricted terms, create a safer rewritten version, and copy it.
- **Task manager** — Add, filter, move, and delete tasks. Tasks are saved locally in the browser.
- **Time Desk** — Track multiple time zones, add cities through Open-Meteo geocoding, run a Pomodoro timer, and create browser-local reminders.

## Tech stack

- Next.js (App Router)
- React and TypeScript
- Tailwind CSS v4
- Browser APIs: Canvas, Clipboard, Local Storage, Notifications, Web Audio
- Open-Meteo Geocoding API (used only when searching for a city)

## Run locally

Prerequisites: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev     # Start the development server
npm run lint    # Run TypeScript type checks
npm run build   # Create a production build
npm run start   # Serve the production build
```

## Project structure

```text
app/
├── components/       # Shared UI and interactive tool components
├── fiverr/page.tsx   # Fiverr message checker route
├── tasks/page.tsx    # Local task board route
├── time/page.tsx     # World clock, focus timer, and reminders route
├── layout.tsx        # Shared metadata, header, and footer
└── page.tsx          # Main toolbox and WebP converter
```

## Privacy and data

Image conversion, text formatting, JSON formatting, CSS generation, and task storage run locally in the browser. Time Desk uses local storage for its preferences, cities, alarms, and timer state. A city search sends only the search term to Open-Meteo's geocoding service.

## Verification

The project is checked in CI with TypeScript and a production Next.js build. Run `npm run lint` and `npm run build` before deploying changes.

## Author

Developed by [Shofiqul Islam](https://github.com/sujonahmedsr).
