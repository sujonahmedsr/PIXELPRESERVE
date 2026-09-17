import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, type ToolItem } from "../../lib/tools";
import { WebPConverter } from "../../components/WebPConverter";
import { TextTransformer } from "../../components/TextTransformer";
import { JsonFormatter } from "../../components/JsonFormatter";
import { Base64Tool } from "../../components/Base64Tool";
import { MarkdownPreview } from "../../components/MarkdownPreview";
import { DesignToolPanel } from "../../components/DesignToolPanel";
import { FiverrChecker } from "../../components/FiverrChecker";
import TaskManager from "../../components/TaskManager";
import TimeDashboard from "../../components/TimeDashboard";
import { JwtDebugger } from "../../components/JwtDebugger";
import { CryptoToolkit } from "../../components/CryptoToolkit";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shofidev-tools.vercel.app";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) {
    return { title: "Tool Not Found | SHOFIDEV_TOOLS" };
  }

  return {
    title: `${tool.name} - Free Online Developer Tool`,
    description: `${tool.name} on SHOFIDEV_TOOLS (Shofi Dev Tools): ${tool.shortDescription} 100% private, free, in-browser developer utility created by Shofiqul Islam.`,
    keywords: [
      tool.name,
      tool.tag,
      "shofi dev tools",
      "SHOFIDEV_TOOLS",
      "shofidev tools",
      "developer tools",
      "free developer tools",
      "online developer tools",
      "browser developer tools",
      "client-side tools",
    ],
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      title: `${tool.name} - Free Online Developer Tool | SHOFIDEV_TOOLS`,
      description: tool.shortDescription,
      url: `${siteUrl}/tools/${slug}`,
      siteName: "SHOFIDEV_TOOLS",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | SHOFIDEV_TOOLS Developer Suite`,
      description: tool.shortDescription,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const otherTools = TOOLS.filter((t) => t.slug !== slug);

  function renderTool(toolSlug: string) {
    switch (toolSlug) {
      case "webp-converter":
        return <WebPConverter />;
      case "text-transformer":
        return <TextTransformer />;
      case "json-formatter":
        return <JsonFormatter />;
      case "base64-tool":
        return <Base64Tool />;
      case "markdown-preview":
        return <MarkdownPreview />;
      case "glass-shadow":
        return <DesignToolPanel kind="glass" />;
      case "contrast-palette":
        return <DesignToolPanel kind="palette" />;
      case "fiverr-checker":
        return <FiverrChecker />;
      case "task-manager":
        return <TaskManager />;
      case "time-desk":
        return <TimeDashboard />;
      case "jwt-debugger":
        return <JwtDebugger />;
      case "crypto-toolkit":
        return <CryptoToolkit />;
      default:
        return null;
    }
  }

  const toolJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${tool.name} - SHOFIDEV_TOOLS`,
    alternateName: `${tool.name} by Shofi Dev Tools`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    description: tool.shortDescription,
    url: `${siteUrl}/tools/${tool.slug}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Shofiqul Islam",
      url: "https://github.com/sujonahmedsr",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: `${siteUrl}/#tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `${siteUrl}/tools/${tool.slug}`,
      },
    ],
  };

  return (
    <main className="relative mx-auto w-[calc(100%-24px)] max-w-7xl px-0 pb-16 min-[701px]:w-[calc(100%-56px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mt-4 mb-5 flex items-center gap-2 font-mono text-xs sm:text-sm text-[var(--text-secondary)]"
      >
        <Link
          href="/"
          className="transition hover:text-[var(--accent)] hover:underline"
        >
          Home
        </Link>
        <span>/</span>
        <Link
          href="/#tools"
          className="transition hover:text-[var(--accent)] hover:underline"
        >
          Tools
        </Link>
        <span>/</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {tool.name}
        </span>
      </nav>

      {/* Main Tool Container */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-glass)] p-4 backdrop-blur-[18px] min-[701px]:rounded-[26px] min-[701px]:p-8">
        {/* Tool Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-[var(--accent)] text-2xl text-white">
              {tool.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--accent)]">
                  {tool.tag}
                </span>
                <span className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                  100% Client-Side
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {tool.name}
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-mono font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            ← View All Tools
          </Link>
        </div>

        {/* Live Interactive Workspace */}
        <div className="min-h-[300px]">{renderTool(tool.slug)}</div>
      </section>

      {/* Dedicated Tool Summary Section */}
      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            About This Tool
          </span>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {tool.summary.headline}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
            {tool.shortDescription}
          </p>
        </div>

        <div className="mt-8 grid gap-8 border-t border-[var(--border)] pt-8 md:grid-cols-2">
          {/* How to Use */}
          <div>
            <h3 className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wider text-[var(--text-primary)] uppercase">
              <span className="grid size-6 place-items-center rounded-lg bg-[var(--accent-soft)] text-xs text-[var(--accent)] font-bold">
                1
              </span>
              How to Use
            </h3>
            <ol className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              {tool.summary.howToUse.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] font-mono text-[11px] font-semibold text-[var(--text-primary)]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wider text-[var(--text-primary)] uppercase">
              <span className="grid size-6 place-items-center rounded-lg bg-[var(--accent-soft)] text-xs text-[var(--accent)] font-bold">
                2
              </span>
              Key Features
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              {tool.summary.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[var(--accent)] font-bold">
                    ✓
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Privacy & Security Guarantee */}
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-5 flex items-start gap-3.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white text-base">
            🔒
          </span>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Client-Side Privacy Guarantee
            </h4>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
              {tool.summary.privacyNote} SHOFIDEV_TOOLS does not transmit,
              store, or log any of your files, text, or tokens on external
              servers.
            </p>
          </div>
        </div>
      </section>

      {/* Explore Other Tools Section */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm tracking-wider uppercase text-[var(--text-secondary)]">
            Explore Other Utilities
          </h2>
          <Link
            href="/"
            className="font-mono text-xs text-[var(--accent)] hover:underline"
          >
            All {TOOLS.length} Tools →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {otherTools.slice(0, 4).map((item) => (
            <Link
              key={item.slug}
              href={`/tools/${item.slug}`}
              className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface)] no-underline"
            >
              <span className="text-xl">{item.icon}</span>
              <strong className="mt-2 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                {item.name}
              </strong>
              <span className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                {item.shortDescription}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
