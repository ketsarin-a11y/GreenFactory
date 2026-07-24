import { Plus } from "lucide-react";

export default function MasterHeader({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel: string;
}) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <p className="text-[11px] font-semibold text-[#7a847f]">
          Global Master Data
          <span className="mx-2 text-[#c0c4c1]">›</span>
          {title}
        </p>

        <h2 className="mt-2 text-[27px] font-bold tracking-[-0.035em] text-[#1e2924]">
          {title}
        </h2>

        <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-[#7b8580]">
          {description}
        </p>
      </div>

      <button
        type="button"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0d7659] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(13,118,89,0.18)] transition hover:-translate-y-0.5 hover:bg-[#09694f]"
      >
        <Plus className="h-[17px] w-[17px]" />
        {actionLabel}
      </button>
    </section>
  );
}
