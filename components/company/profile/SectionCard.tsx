import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function SectionCard({
  title,
  description,
  children,
  action,
}: Props) {
  return (
    <section className="rounded-[22px] border border-[#e1eae4] bg-white p-5 shadow-[0_12px_36px_rgba(30,73,46,0.055)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-extrabold text-[#26362d]">{title}</h2>
          {description && (
            <p className="mt-1 text-[12px] leading-5 text-[#819087]">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}
