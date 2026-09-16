export type ToolSummary = {
  headline: string;
  howToUse: string[];
  keyFeatures: string[];
  privacyNote: string;
};

export type ToolItem = {
  id: string;
  slug: string;
  name: string;
  tag: string;
  category: "Media" | "Text & Code" | "Design & CSS" | "Productivity" | "Backend";
  icon: string;
  shortDescription: string;
  summary: ToolSummary;
};

export const TOOLS: ToolItem[] = [

  {
    id: "webp-converter",
    slug: "webp-converter",
    name: "WebP Image Converter",
    tag: "MEDIA",
    category: "Media",
    icon: "🖼️",
    shortDescription: "Convert PNG, JPG, GIF & SVG to modern, lightweight WebP format without losing quality.",
    summary: {
      headline: "High-speed in-browser image compressor and WebP format converter.",
      howToUse: [
        "Drag and drop one or multiple images into the dropzone, or click 'Select Images' to browse.",
        "Choose your preferred WebP quality setting (Smart Target, Maximum, High, or Balanced).",
        "Inspect real-time statistics showing original file size, compressed size, and space saved.",
        "Download individual converted WebP files or click 'Download All as ZIP' to grab everything at once.",
      ],
      keyFeatures: [
        "Batch image conversion with live progress bar",
        "100% Client-Side: Processed using HTML5 Canvas with zero server uploads",
        "Multiple compression quality presets with original resolution preservation",
        "One-click ZIP archive generator for multiple files",
      ],
      privacyNote: "Your images never leave your computer. Processing occurs entirely in your browser memory.",
    },
  },
  {
    id: "text-transformer",
    slug: "text-transformer",
    name: "Text Case Transformer",
    tag: "TEXT",
    category: "Text & Code",
    icon: "📝",
    shortDescription: "Transform text between Sentence case, lowercase, UPPERCASE, Title Case, and more.",
    summary: {
      headline: "Instant multi-format text capitalization and case conversion utility.",
      howToUse: [
        "Type or paste your text into the input area.",
        "Click on any case conversion option (Sentence case, lowercase, UPPERCASE, Capitalized, etc.).",
        "The text updates instantly. Click 'Copy' to copy the result to your clipboard.",
      ],
      keyFeatures: [
        "7 case transformation algorithms (Sentence, Lower, Upper, Title, Capitalized, Alternating, Inverse)",
        "Live character and word counter",
        "Instant one-click clipboard copy with toast notifications",
        "Fast clear button to reset input",
      ],
      privacyNote: "Text transformation runs entirely in client-side JavaScript.",
    },
  },
  {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter & Minifier",
    tag: "DEV TOOLS",
    category: "Text & Code",
    icon: "🔧",
    shortDescription: "Pretty-print, format, validate, and minify JSON payloads with syntax error detection.",
    summary: {
      headline: "Make JSON readable, clean, and compact for APIs and debugging.",
      howToUse: [
        "Paste unformatted, compact, or raw JSON data into the editor.",
        "Click 'Format JSON' to beautify with standard 2-space indentation.",
        "Click 'Minify' to compress JSON into a single compact line for network payloads.",
        "If there are any syntax errors, an inline alert highlights the problem immediately.",
      ],
      keyFeatures: [
        "2-space clean indentation beautifier",
        "Single-line compact minification",
        "Instant syntax validation and parse error detection",
        "One-click copy to clipboard",
      ],
      privacyNote: "Payloads and sensitive API keys are processed locally via native JSON parser. Nothing is transmitted.",
    },
  },
  {
    id: "base64-tool",
    slug: "base64-tool",
    name: "Base64 Encoder & Decoder",
    tag: "DATA",
    category: "Text & Code",
    icon: "🔤",
    shortDescription: "Encode text and files into Base64 strings or decode Base64 data back to plain text.",
    summary: {
      headline: "Fast two-way Base64 encoding and decoding engine with file-to-Base64 upload support.",
      howToUse: [
        "Select 'Encode' or 'Decode' mode from the top toggle.",
        "Type or paste text into the input field, or upload an image/document via the 'From file' button.",
        "Inspect the instant output in the right panel and copy with a single click.",
      ],
      keyFeatures: [
        "Two-way UTF-8 text encoding and decoding",
        "Direct file-to-Base64 converter (images, PDFs, documents, audio)",
        "Smart mode switching: automatically flips input and output",
        "Malformed Base64 string validation with clear error messages",
      ],
      privacyNote: "File reading and encoding operate via the browser FileReader API entirely offline.",
    },
  },
  {
    id: "markdown-preview",
    slug: "markdown-preview",
    name: "Markdown Live Previewer",
    tag: "DOCS",
    category: "Text & Code",
    icon: "📄",
    shortDescription: "Real-time side-by-side Markdown editor with GitHub Flavored Markdown and HTML export.",
    summary: {
      headline: "Interactive GitHub Flavored Markdown (GFM) editor and real-time live previewer.",
      howToUse: [
        "Type Markdown code in the left editor pane.",
        "Watch the rendered preview update in real-time in the right pane.",
        "Click 'Copy MD' to copy your markdown source or 'Copy HTML' to copy rendered HTML markup.",
      ],
      keyFeatures: [
        "GitHub Flavored Markdown (GFM) support: tables, code blocks, checklists, strikethrough",
        "Live real-time dual-pane rendering",
        "Dual copy exports: Raw Markdown and Rendered HTML code",
        "Clean developer-friendly cheatsheet preset",
      ],
      privacyNote: "Markdown parsing and rendering execute locally in-browser.",
    },
  },
  {
    id: "glass-shadow",
    slug: "glass-shadow",
    name: "CSS Glassmorphism & Shadow Maker",
    tag: "DESIGN",
    category: "Design & CSS",
    icon: "🎨",
    shortDescription: "Generate modern frosted glass effects and layered realistic drop shadows with copyable CSS.",
    summary: {
      headline: "Visual CSS code generator for glassmorphism backdrops and natural multi-layer shadows.",
      howToUse: [
        "Adjust blur, backdrop-filter, border opacity, and shadow offset sliders on the control panel.",
        "Observe the live visual preview container over colorful backdrop surfaces.",
        "Copy the generated production-ready CSS snippet directly into your stylesheet or Tailwind project.",
      ],
      keyFeatures: [
        "Interactive live canvas with backdrop-filter blur simulation",
        "Multi-parameter sliders for fine-tuning blur, spread, radius, color, and opacity",
        "Instant one-click CSS copy with toast confirmation",
        "Reset button to restore default balanced parameters",
      ],
      privacyNote: "All styles and CSS snippets are generated in client-side memory.",
    },
  },
  {
    id: "contrast-palette",
    slug: "contrast-palette",
    name: "Color Contrast & Palette Builder",
    tag: "COLORS",
    category: "Design & CSS",
    icon: "🎯",
    shortDescription: "Check WCAG 2.1 accessibility contrast ratios (AA/AAA) and generate color palettes.",
    summary: {
      headline: "WCAG accessibility contrast checker and dynamic brand color palette generator.",
      howToUse: [
        "Pick background and text colors using the native color picker or type HEX values.",
        "Check the calculated contrast ratio and WCAG 2.1 AA/AAA compliance ratings.",
        "Generate harmonious tint and shade palette steps from any base brand color.",
      ],
      keyFeatures: [
        "Accurate WCAG 2.1 luminance contrast calculation formula",
        "Normal text and large display text AA/AAA pass/fail indicators",
        "Base brand color scale generator with copyable HEX codes",
      ],
      privacyNote: "Calculated client-side via mathematical color space transforms.",
    },
  },
  {
    id: "fiverr-checker",
    slug: "fiverr-checker",
    name: "Fiverr Message Safety Checker",
    tag: "SAFETY",
    category: "Productivity",
    icon: "🛡️",
    shortDescription: "Clean and sanitize client messages before sending to avoid restricted terms and account flags.",
    summary: {
      headline: "Client message safety filter that detects restricted keywords and generates policy-safe rewrites.",
      howToUse: [
        "Paste a buyer or client message into the Original Message input box.",
        "The safety engine instantly detects restricted words (payment, off-platform contacts, review manipulation).",
        "Copy the safe sanitized rewrite that complies with marketplace Terms of Service.",
      ],
      keyFeatures: [
        "40+ restricted terms detection across contacts, payments, and ratings",
        "Automatic platform-safe hyphenated word substitutions (e.g. pay-pal, what-sapp)",
        "Real-time word count, character count, and review status badge",
        "100% Private: Messages are never stored or transmitted",
      ],
      privacyNote: "Messages are analyzed in memory only. Nothing is stored, logged, or uploaded.",
    },
  },
  {
    id: "task-manager",
    slug: "task-manager",
    name: "Task & Delivery Board",
    tag: "PROJECTS",
    category: "Productivity",
    icon: "📋",
    shortDescription: "Kanban delivery board with priority tags, deadlines, search filtering, and delivery health.",
    summary: {
      headline: "Command center for managing sprints, client deliverables, deadlines, and project health.",
      howToUse: [
        "Click 'Add task' to create a new task with project, client, deadline, and priority.",
        "Search tasks by title or filter by status (To Do, In Progress, Complete).",
        "Click 'Next ->' to advance task progress across columns, or delete tasks when finished.",
      ],
      keyFeatures: [
        "Delivery health bar with percentage completion and overdue alerts",
        "Multi-column Kanban board with real-time task counts",
        "Instant search filter and status dropdown selector",
        "Priority tags (High, Medium, Low) with distinct visual accents",
      ],
      privacyNote: "Your tasks and client details are stored strictly in your browser session.",
    },
  },
  {
    id: "time-desk",
    slug: "time-desk",
    name: "Time Desk & World Timezones",
    tag: "TIME",
    category: "Productivity",
    icon: "⏱️",
    shortDescription: "World clock, international timezone difference calculator, and delayed countdown timers.",
    summary: {
      headline: "Global time command center for distributed remote teams, freelancers, and clients.",
      howToUse: [
        "View real-time clocks for international business hubs (Dhaka, New York, London, Tokyo).",
        "Search and pin new world cities to track global client working hours.",
        "Set delayed countdown alarms for timed deliverables and client follow-ups.",
      ],
      keyFeatures: [
        "Live ticking clock with accurate local timezone offset calculations",
        "Worldwide city search and custom timezone pinning",
        "Countdown timer and delayed alarm alerts",
        "Clean, responsive layout with 1px borders and zero box-shadows",
      ],
      privacyNote: "Operates using the browser's native Internationalization API (`Intl.DateTimeFormat`).",
    },
  },
  {
    id: "jwt-debugger",
    slug: "jwt-debugger",
    name: "JWT Debugger & Token Inspector",
    tag: "BACKEND",
    category: "Backend",
    icon: "🔑",
    shortDescription: "Decode and inspect JSON Web Tokens, verify expiration countdown, and analyze claims securely in-browser.",
    summary: {
      headline: "Client-side JWT decoder, claim analyzer, and token lifetime inspector for backend developers.",
      howToUse: [
        "Paste any raw JWT or Bearer authorization token into the input textarea, or click 'Load Sample Token'.",
        "Examine the decoded Header (algorithm & type) and Payload (user claims, roles, tenant ID).",
        "Review the live expiration badge showing whether the token is currently active or expired, along with exact time elapsed.",
        "Copy formatted JSON payloads or signatures with a single click.",
      ],
      keyFeatures: [
        "100% Client-Side Privacy: Tokens never touch any server or external API",
        "Live expiration status badge with relative time calculation (e.g. 'Expires in 4h' or 'Expired 2h ago')",
        "Structured claims inspection: exp, iat, nbf, sub, iss, and custom scopes",
        "Instant one-click JSON copy with formatting preservation",
      ],
      privacyNote: "Zero network transmission. Sensitive production and staging tokens stay strictly in local memory.",
    },
  },
  {
    id: "crypto-toolkit",
    slug: "crypto-toolkit",
    name: "Backend Crypto & Token Suite",
    tag: "SECURITY",
    category: "Backend",
    icon: "🛡️",
    shortDescription: "Cryptographic hash generation (SHA-256, SHA-512, MD5), HMAC webhook signing, UUID v4, and Unix epoch converter.",
    summary: {
      headline: "Essential backend cryptographic and token utility powered by the Web Crypto API.",
      howToUse: [
        "Select 'Hash & HMAC' to compute digests using SHA-256, SHA-512, SHA-384, SHA-1, or MD5 in Hex and Base64.",
        "Optionally provide a secret key to compute HMAC signatures for Stripe, GitHub, or Shopify webhooks.",
        "Switch to 'UUID & Keys' to batch generate cryptographically random UUID v4s and secure hex API keys.",
        "Switch to 'Unix Timestamp' to convert between epoch timestamps and human-readable UTC/local dates.",
      ],
      keyFeatures: [
        "High-performance native hashing via Web Crypto API with optional HMAC secret signing",
        "Batch UUID v4 generator with custom uppercase and no-hyphen formatting options",
        "Cryptographically secure random secret and API key generator (128-bit to 512-bit entropy)",
        "Live ticking Unix Epoch clock and bidirectional Timestamp <-> Date converter",
      ],
      privacyNote: "All hashes and tokens are calculated locally using the browser's hardware-accelerated Web Crypto API.",
    },
  },
];
