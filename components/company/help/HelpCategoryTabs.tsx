import type { HelpCategory } from "./types";

const categories: Array<{ id: HelpCategory; label: string }> = [
  { id: "all", label: "ทั้งหมด" },
  { id: "account", label: "บัญชีผู้ใช้" },
  { id: "factory", label: "โรงงาน" },
  { id: "sensor", label: "เซนเซอร์" },
  { id: "report", label: "รายงาน" },
  { id: "resource", label: "ทรัพยากร" },
  { id: "qr", label: "QR Code" },
];

type Props = {
  activeCategory: HelpCategory;
  onChange: (category: HelpCategory) => void;
};

export default function HelpCategoryTabs({
  activeCategory,
  onChange,
}: Props) {
  return (
    <div className="overflow-x-auto border-b border-[#e4ece7] [scrollbar-width:none]">
      <div className="flex min-w-max gap-1">
        {categories.map((category) => {
          const active = activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={`relative min-h-[46px] px-4 text-[12px] font-bold transition ${
                active
                  ? "text-[#168253]"
                  : "text-[#6f7d74] hover:text-[#2d5d43]"
              }`}
            >
              {category.label}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[#1d9b5f]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
