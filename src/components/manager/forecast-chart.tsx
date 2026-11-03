"use client";

import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { fmtNum } from "@/lib/format";

export type ForecastRow = {
  label: string;
  value?: number | null;
  /** μ ± 2σ normal band (history only). */
  band?: [number, number];
  anomaly?: boolean;
  predicted?: number;
  /** 95% forecast interval. */
  spread?: [number, number];
};

/**
 * History and forecast on one chart, one y-axis: solid actuals with the normal band,
 * then a dashed forecast with a light uncertainty band, joined at the last actual day.
 */
export function ForecastChart({ data, color, label, unit, height = 340, todayLabel }: {
  data: ForecastRow[];
  color: string;
  label: string;
  unit: string;
  height?: number;
  todayLabel?: string;
}) {
  const config: ChartConfig = {
    value: { label, color },
    predicted: { label: "คาดการณ์", color },
    band: { label: "ช่วงปกติ (μ ± 2σ)", color: "var(--muted-foreground)" },
    spread: { label: "ช่วงคาดการณ์ 95%", color },
  };
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => fmtNum(v, 0)} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(v, n) =>
                n === "band" || n === "spread" ? null : (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">{config[n as string]?.label}</span>
                    <span className="font-medium tabular">{fmtNum(v as number)} {unit}</span>
                  </div>
                )
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1 [&>div]:whitespace-nowrap" />} />
        <Area dataKey="band" type="monotone" stroke="none" fill="var(--muted-foreground)" fillOpacity={0.1} isAnimationActive={false} />
        <Area dataKey="spread" type="monotone" stroke="none" fill={color} fillOpacity={0.12} isAnimationActive={false} />
        {todayLabel && <ReferenceLine x={todayLabel} stroke="var(--border)" strokeDasharray="2 2" />}
        <Line dataKey="value" type="monotone" stroke={color} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
        <Line dataKey="predicted" type="monotone" stroke={color} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        {data.filter((d) => d.anomaly).map((d) => (
          <ReferenceDot key={d.label} x={d.label} y={d.value ?? 0} r={5} fill="var(--status-critical)" stroke="var(--card)" strokeWidth={2} />
        ))}
      </ComposedChart>
    </ChartContainer>
  );
}
