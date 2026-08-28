import {
  Bot,
  Droplets,
  FileBarChart,
  Leaf,
  Recycle,
  Zap,
} from "lucide-react";

const solutionLinks = [
  {
    label: "พลังงาน",
    href: "#energy",
    icon: Zap,
  },
  {
    label: "คาร์บอน",
    href: "#carbon",
    icon: Leaf,
  },
  {
    label: "น้ำและทรัพยากร",
    href: "#water",
    icon: Droplets,
  },
  {
    label: "ของเสีย",
    href: "#water",
    icon: Recycle,
  },
  {
    label: "AI และการวิเคราะห์",
    href: "#ai",
    icon: Bot,
  },
  {
    label: "ภาพรวมแพลตฟอร์ม",
    href: "#platform",
    icon: FileBarChart,
  },
];

export default function SolutionNavigation() {
  return (
    <section className="sticky top-[72px] z-30 border-y border-[#243a2b]/[0.07] bg-[#f9faf7]/90 px-5 backdrop-blur-2xl sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto flex min-h-[76px] max-w-[1380px] items-center">
        <div className="flex w-full items-center gap-3 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="mr-2 hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#809087] lg:block">
            Explore
          </span>

          {solutionLinks.map((item, index) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`group inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 text-[12px] font-medium transition duration-300 ${
                  index === 0
                    ? "bg-[#315f41] text-white shadow-[0_12px_28px_rgba(49,95,65,0.18)]"
                    : "border border-[#263e2d]/10 bg-white/70 text-[#536158] hover:border-[#497458]/25 hover:bg-[#edf3ed] hover:text-[#376747]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    index === 0
                      ? "text-white"
                      : "text-[#4a7759] transition group-hover:text-[#376747]"
                  }`}
                  strokeWidth={1.55}
                />

                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}