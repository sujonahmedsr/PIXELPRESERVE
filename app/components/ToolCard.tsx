type ToolCardProps = {
  active: boolean;
  icon: string;
  title: string;
  description: string;
  tag: string;
  onClick: () => void;
};

export function ToolCard({
  active,
  icon,
  title,
  description,
  tag,
  onClick,
}: ToolCardProps) {
  return (
    <button
      className={`relative flex min-h-43.5 flex-col items-start rounded-2xl border p-4.25 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${active ? "border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]/30" : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}
      onClick={onClick}
      type="button"
      aria-pressed={active}
    >
      <span className="flex w-full items-center justify-between">
        <span className="grid size-10.5 place-items-center rounded-xl border border-white/20 bg-[var(--accent)] text-base text-white">
          {icon}
        </span>
        <span className="font-mono text-base tracking-[0.08em]">{tag}</span>
      </span>
      <span className="mt-5.5 text-base font-medium text-[var(--text-primary)]">
        {title}
      </span>
      <span className="mt-1 text-base leading-[1.45]">{description}</span>
      <span
        className="absolute right-4.25 bottom-3.75 text-xl text-[var(--accent)]"
        aria-hidden="true"
      >
        ↗
      </span>
    </button>
  );
}
