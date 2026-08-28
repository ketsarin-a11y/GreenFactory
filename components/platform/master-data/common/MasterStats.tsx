import type { ReactNode } from "react";

export type MasterStat = {
  label: string;
  value: string | number;
  unit: string;
  helper: string;
  icon: ReactNode;
  iconClassName: string;
};

export default function MasterStats({
  items,
}: {
  items: MasterStat[];
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-[18px] border border-[#e8e6e1] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(52,45,37,0.045)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-[#737a76]">
                {item.label}
              </p>

              <div className="mt-2 flex items-end gap-2">
                <p className="text-[28px] font-bold tracking-[-0.04em] text-[#1f2925]">
                  {item.value}
                </p>
                <span className="pb-1 text-[11px] font-medium text-[#89908c]">
                  {item.unit}
                </span>
              </div>
            </div>

            <div className={`grid h-11 w-11 place-items-center rounded-[14px] ${item.iconClassName}`}>
              {item.icon}
            </div>
          </div>

          <p className="mt-3 text-[11px] font-semibold text-[#118361]">
            {item.helper}
          </p>
        </article>
      ))}
    </section>
  );
}
