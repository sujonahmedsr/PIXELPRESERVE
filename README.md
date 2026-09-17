# SHOFIDEV_TOOLS

SHOFIDEV_TOOLS (Shofi Dev Tools) is a privacy-first browser toolkit for developers, freelancers, and designers created by Shofiqul Islam. It brings everyday developer utilities into one fast, responsive Next.js application: image conversion, text and JSON helpers, Base64 encoding, Markdown preview, design tools, a Fiverr message checker, a local task board, a world-time focus desk, Bangladesh prayer times, and a built-in AI assistant.

All core editing and productivity data stays in the browser. No account is required.

## Features

- **WebP converter** — Convert multiple images in the browser, preserve dimensions, choose a quality level, track per-image progress, download files individually, or export a real `.zip` archive.
- **Text case transformer** — Convert text to sentence, lower, upper, title, alternating, capitalized, or inverse case and copy the result.
- **JSON formatter** — Validate, pretty-print, and minify JSON.
- **Glass & shadow generator** — Adjust glassmorphism settings and copy the generated CSS.
- **Palette checker** — Generate shades from a base colour and check WCAG contrast ratios.
- **Base64 tool** — Encode and decode text or files to/from Base64, with file upload support.
- **Markdown preview** — Live side-by-side Markdown rendering with GFM support. Copy as Markdown or HTML.
- **AI assistant** — Built-in conversational AI for coding help, study plans, debugging, and general questions. Supports conversation history saved locally.
- **Fiverr message checker** — Detect configured restricted terms, create a safer rewritten version, and copy it.
- **Task manager** — Add, filter, move, and delete tasks. Tasks are saved locally in the browser.
- **Time Desk** — Track multiple time zones, add cities through Open-Meteo geocoding, run a Pomodoro timer, and create browser-local reminders.

## Design System

- **Dark mode** — Full dark theme support with a toggle in the header. Automatically respects system preference.
- **CSS design tokens** — Comprehensive custom property system for consistent theming across all components.
- **Mobile-first navigation** — Hamburger menu for mobile devices with smooth dropdown navigation.
- **Toast notifications** — Global notification system for user feedback on actions (copy, download, etc.).
- **Error boundaries** — Graceful error handling with polished fallback UI.
- **Inter font** — Modern typography via Google Fonts.

## Tech stack

- Next.js (App Router)
- React and TypeScript
- Tailwind CSS v4 with custom design tokens
- Browser APIs: Canvas, Clipboard, Local Storage, Notifications, Web Audio
- Vercel AI SDK with Google Gemini (used only for the AI assistant)
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
├── api/chat/         # AI assistant API route (Gemini streaming)
├── ai/page.tsx       # Full-page AI assistant route
├── components/
│   ├── AppShell.tsx         # Layout wrapper with providers
│   ├── Base64Tool.tsx       # Base64 encode/decode tool
│   ├── Chatbot.tsx          # Floating AI chat widget
│   ├── DesignToolPanel.tsx  # Glass & shadow + palette tools
│   ├── ErrorBoundary.tsx    # React error boundary
│   ├── FiverrChecker.tsx    # Fiverr message safety tool
│   ├── JsonFormatter.tsx    # JSON format & minify tool
│   ├── MarkdownPreview.tsx  # Live Markdown preview tool
│   ├── SectionHeading.tsx   # Reusable section heading
│   ├── SiteFooter.tsx       # Global footer
│   ├── SiteHeader.tsx       # Header with hamburger nav & dark toggle
│   ├── TaskManager.tsx      # Kanban task board
│   ├── TextTransformer.tsx  # Text case converter
│   ├── ThemeProvider.tsx    # Dark mode context provider
│   ├── Toast.tsx            # Global toast notification system
│   ├── ToolCard.tsx         # Tool selection card
│   ├── TimeDashboard.tsx    # World clock & focus timer
│   └── WebPConverter.tsx    # Image to WebP converter
├── hooks/
│   └── useChatStream.ts     # Shared AI chat streaming hook
├── lib/
│   └── zip.ts               # Pure-JS ZIP archive builder
├── fiverr/page.tsx   # Fiverr message checker route
├── tasks/page.tsx    # Local task board route
├── time/page.tsx     # World clock, focus timer, and reminders route
├── layout.tsx        # Shared metadata, fonts, and providers
├── page.tsx          # Main toolbox (7 tools)
└── tailwind.css      # Design tokens, dark theme, utilities
```

## Privacy and data

Image conversion, text formatting, JSON formatting, CSS generation, Base64 encoding, Markdown rendering, and task storage run locally in the browser. Time Desk uses local storage for its preferences, cities, alarms, and timer state. AI conversations are stored locally; only the conversation content is sent to Google's Gemini API for responses. A city search sends only the search term to Open-Meteo's geocoding service.

## Verification

The project is checked in CI with TypeScript and a production Next.js build. Run `npm run lint` and `npm run build` before deploying changes.

## Author

Developed by [Shofiqul Islam](https://github.com/sujonahmedsr).
