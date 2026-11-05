"use client";

import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceDot, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { fmtNum } from "@/lib/format";

export type Series = { key: string; label: string; color: string };

/**
 * Daily trend: one y-axis, 2px lines, optional μ±2σ band and anomaly markers.
 * `data` rows: { label: "3 พ.ย.", [series.key]: number, upper?, lower?, anomaly? }.
 */
export function TrendChart({ data, series, unit, band, height = 280, kind = "line", yDomain }: {
  data: Record<string, unknown>[];
  series: Series[];
  unit?: string;
  band?: boolean;
  height?: number;
  kind?: "line" | "bar";
  /** Fit the y-axis to the data (e.g. ["dataMin - 100", "auto"]) instead of starting at 0; lines only. */
  yDomain?: [number | string, number | string];
}) {
  const config: ChartConfig = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }]));
  if (band) config.band = { label: "ช่วงปกติ (μ ± 2σ)", color: "var(--muted-foreground)" };
  const yTick = (v: number) => fmtNum(v, 0);

  if (kind === "bar")
    return (
      <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
        <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={yTick} />
          <ChartTooltip content={<ChartTooltipContent formatter={(v, n) => <TooltipRow name={config[n as string]?.label} value={v as number} unit={unit} />} />} />
          {series.length > 1 && <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1 [&>div]:whitespace-nowrap" />} />}
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} stackId="a" fill={`var(--color-${s.key})`} radius={i === series.length - 1 ? [4, 4, 0, 0] : 0} stroke="var(--card)" strokeWidth={series.length > 1 ? 1 : 0} />
          ))}
        </BarChart>
      </ChartContainer>
    );

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={yTick} domain={yDomain} allowDataOverflow={false} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v, n) => (n === "band" ? null : <TooltipRow name={config[n as string]?.label} value={v as number} unit={unit} />)} />} />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1 [&>div]:whitespace-nowrap" />} />}
        {band && <Area dataKey="band" type="monotone" stroke="none" fill="var(--muted-foreground)" fillOpacity={0.08} isAnimationActive={false} legendType="none" />}
        {series.map((s) => (
          <Line key={s.key} dataKey={s.key} type="monotone" stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
        ))}
        {band &&
          data
            .filter((d) => d.anomaly)
            .map((d) => (
              <ReferenceDot key={String(d.label)} x={String(d.label)} y={d[series[0].key] as number} r={5} fill="var(--status-critical)" stroke="var(--card)" strokeWidth={2} />
            ))}
      </ComposedChart>
    </ChartContainer>
  );
}

function TooltipRow({ name, value, unit }: { name: React.ReactNode; value: number; unit?: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-muted-foreground">{name}</span>
      <span className="font-medium tabular">{fmtNum(value)} {unit}</span>
    </div>
  );
}
