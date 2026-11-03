"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/data/chart-card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { dayLabel } from "@/components/company/labels";
import { fmtNum } from "@/lib/format";

/**
 * Electricity per day per factory (7-day average lines, 2–4 factories) with a table view.
 * Unlike the shared TrendChart the y-axis fits the data instead of starting at 0: these are
 * lines, and a 7% retrofit saving would otherwise be a flat line.
 */
export function FactoryTrend({ days, factories, caption }: {
  days: string[];
  factories: { key: string; label: string; color: string; daily: number[] }[];
  caption: string;
}) {
  const data = days.map((day, i) => ({ label: dayLabel(day), ...Object.fromEntries(factories.map((f) => [f.key, f.daily[i]])) }));
  const config: ChartConfig = Object.fromEntries(factories.map((f) => [f.key, { label: f.label, color: f.color }]));
  const all = factories.flatMap((f) => f.daily);
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.12 || hi * 0.05 || 1;
  const step = niceStep((hi - lo + pad * 2) / 4);
  const domain: [number, number] = [Math.max(0, Math.floor((lo - pad) / step) * step), Math.ceil((hi + pad) / step) * step];
  return (
    <ChartCard
      title="ไฟฟ้าต่อวันแยกโรงงาน"
      description={caption}
      table={{ columns: ["วันที่", ...factories.map((f) => `${f.label} (kWh/วัน)`)], rows: days.map((day, i) => [dayLabel(day), ...factories.map((f) => fmtNum(f.daily[i], 0))]).reverse() }}
    >
      <ChartContainer config={config} className="aspect-auto w-full" style={{ height: 300 }}>
        <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={32} />
          <YAxis tickLine={false} axisLine={false} width={56} domain={domain} tickCount={5} allowDecimals={false} tickFormatter={(v: number) => fmtNum(v, 0)} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(v, n) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">{config[n as string]?.label}</span>
                    <span className="font-medium tabular">{fmtNum(v as number, 0)} kWh/วัน</span>
                  </div>
                )}
              />
            }
          />
          {factories.length > 1 && <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1 [&>div]:whitespace-nowrap" />} />}
          {factories.map((f) => (
            <Line key={f.key} dataKey={f.key} type="monotone" stroke={`var(--color-${f.key})`} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}

function niceStep(raw: number) {
  const p = 10 ** Math.floor(Math.log10(raw || 1));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}
