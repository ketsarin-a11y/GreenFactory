"use client";

import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { fmtNum } from "@/lib/format";
import { resourceColor } from "@/lib/resources";

type Metric = { code: string; resource: string; unit: string; total: number; byFactory: { factoryId: number; daily: number[] }[] };

/**
 * One daily bar chart per resource/unit. With several factories the bars stack by factory
 * (factory colors in fixed order); with one factory the bar takes the resource's own color.
 */
export function ReportCharts({ metrics, days, factories }: { metrics: Metric[]; days: string[]; factories: { id: number; name: string }[] }) {
  const label = (d: string) => String(Number(d.slice(8)));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {metrics.map((m) => {
        const used = factories.map((f, i) => ({ f, i })).filter(({ f }) => m.byFactory.some((b) => b.factoryId === f.id && b.daily.some((v) => v > 0)));
        const multi = factories.length > 1;
        const series = multi
          ? used.map(({ f, i }) => ({ key: `f${f.id}`, label: f.name, color: `var(--chart-${i + 1})` }))
          : [{ key: `f${factories[0]?.id}`, label: m.resource, color: resourceColor(m.code) }];
        const data = days.map((d, i) => ({ label: label(d), ...Object.fromEntries(m.byFactory.map((b) => [`f${b.factoryId}`, b.daily[i]])) }));
        return (
          <ChartCard
            key={`${m.code}-${m.unit}`}
            title={m.resource}
            description={`รวม ${fmtNum(m.total)} ${m.unit} รายวันตลอดเดือน`}
            table={{
              columns: ["วันที่", ...factories.map((f) => `${f.name} (${m.unit})`)],
              rows: days.map((d, i) => [label(d), ...m.byFactory.map((b) => fmtNum(b.daily[i]))]),
            }}
          >
            <TrendChart kind="bar" data={data} series={series} unit={m.unit} height={200} />
          </ChartCard>
        );
      })}
    </div>
  );
}
