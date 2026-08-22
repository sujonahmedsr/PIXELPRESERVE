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
      className={`relative flex min-h-43.5 flex-col items-start rounded-2xl border p-4.25 text-left transition duration-200 hover:-translate-y-1 hover:border-[#8fc5aa] hover:bg-white hover:text-[#17201e] hover:shadow-[0_18px_34px_#2e725914] focus-visible:ring-2 focus-visible:ring-[#157c62] focus-visible:ring-offset-2 ${active ? "border-[#8fc5aa] bg-white text-[#17201e] shadow-[0_18px_34px_#2e725914]" : "border-[#dbe8e0] bg-[#f7faf7] text-[#71807b]"}`}
      onClick={onClick}
      type="button"
      aria-pressed={active}
    >
      <span className="flex w-full items-center justify-between">
        <span className="grid size-10.5 place-items-center rounded-xl bg-[#157c62] text-base text-white shadow-[0_10px_20px_#157c6238]">
          {icon}
        </span>
        <span className="font-mono text-base tracking-[0.08em]">{tag}</span>
      </span>
      <span className="mt-5.5 text-base font-medium text-[#17201e]">
        {title}
      </span>
      <span className="mt-1 text-base leading-[1.45]">{description}</span>
      <span
        className="absolute right-4.25 bottom-3.75 text-xl text-[#157c62]"
        aria-hidden="true"
      >
        ↗
      </span>
    </button>
  );
}
