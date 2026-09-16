type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <span className="font-mono text-base tracking-[0.12em] text-[var(--accent)]">
        {eyebrow}
      </span>
      <h2 className="mt-2 max-w-142.5 text-[30px] leading-[1.08] font-medium tracking-[-1.8px] text-[var(--text-primary)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2.5 max-w-130 text-base leading-[1.6] text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
