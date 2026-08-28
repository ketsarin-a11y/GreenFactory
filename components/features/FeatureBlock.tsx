import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CircleGauge,
  Database,
  RadioTower,
} from "lucide-react";

import DashboardMockup from "@/components/common/DashboardMockup";

type Metric = {
  value: string;
  label: string;
  detail?: string;
};

type FeatureBlockProps = {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  icon: LucideIcon;
  dashboardVariant: "overview" | "energy" | "carbon" | "water" | "ai";
  metrics: Metric[];
  tags: string[];
  reversed?: boolean;
  tinted?: boolean;
  note?: string;
};

const sourceIcons = [RadioTower, Database, CircleGauge, BarChart3];

export default function FeatureBlock({
  id,
  eyebrow,
  title,
  highlight,
  description,
  icon: Icon,
  dashboardVariant,
  metrics,
  tags,
  reversed = false,
  tinted = false,
  note,
}: FeatureBlockProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16 ${
        tinted ? "bg-[#edf2ec]" : "bg-[#f7f8f4]"
      }`}
    >
      <div className="mx-auto max-w-[1380px]">
        <div
          className={`grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20 ${
            reversed
              ? "lg:grid-cols-[1.22fr_0.78fr] lg:[&>*:first-child]:order-2"
              : ""
          }`}
        >
          {/* Content */}
          <div className="max-w-[590px]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#4a7659]/15 bg-white/70 text-[#4a7659]">
              <Icon className="h-5 w-5" strokeWidth={1.45} />
            </span>

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4a7659]">
              {eyebrow}
            </p>

            <h2 className="mt-5 text-[clamp(2.5rem,4.3vw,4.9rem)] font-medium leading-[1.04] tracking-[-0.055em] text-[#1d2c23]">
              {title}
              <span className="block text-[#4a7659]">{highlight}</span>
            </h2>

            <p className="mt-6 max-w-[530px] text-[14px] font-light leading-8 text-[#6f7b73] sm:text-[15px]">
              {description}
            </p>

            {/* Metrics */}
            <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-7 border-y border-[#263c2d]/10 py-7 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={`${metric.value}-${metric.label}`}>
                  <p className="text-[25px] font-medium tracking-[-0.045em] text-[#26382e] sm:text-[28px]">
                    {metric.value}
                  </p>

                  <p className="mt-1.5 text-[11px] font-medium text-[#536159]">
                    {metric.label}
                  </p>

                  {metric.detail && (
                    <p className="mt-1 text-[9px] font-light leading-4 text-[#8b958f]">
                      {metric.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-7 flex flex-wrap gap-2">
              {tags.map((tag, index) => {
                const TagIcon = sourceIcons[index % sourceIcons.length];

                return (
                  <span
                    key={tag}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-[#29412f]/10 bg-white/65 px-3.5 text-[10px] font-medium text-[#5c6961]"
                  >
                    <TagIcon
                      className="h-3.5 w-3.5 text-[#4d795b]"
                      strokeWidth={1.5}
                    />
                    {tag}
                  </span>
                );
              })}
            </div>

            {note && (
              <p className="mt-6 border-l border-[#4a7659]/35 pl-4 text-[11px] font-light leading-6 text-[#7b867f]">
                {note}
              </p>
            )}

            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-2 text-[12px] font-medium text-[#3f7150]"
            >
              พูดคุยเกี่ยวกับโซลูชันนี้

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Dashboard */}
          <div className="relative">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[72%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7fa889]/12 blur-[80px]" />

            <DashboardMockup variant={dashboardVariant} />
          </div>
        </div>
      </div>
    </section>
  );
}