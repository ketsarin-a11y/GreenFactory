"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type TableView = { columns: string[]; rows: (string | number)[][]; numericFrom?: number };

/**
 * Card around a chart with a "ดูเป็นตาราง" toggle — every chart has a table view
 * (accessibility + exact numbers), per DESIGN.md.
 */
export function ChartCard({ title, description, actions, table, children, className }: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  table?: TableView;
  children: ReactNode;
  className?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className={cn("rounded-[10px] border bg-card p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {table && (
            <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="รูปแบบการแสดงผล">
              <button type="button" onClick={() => setAsTable(false)} aria-pressed={!asTable} className={cn("rounded px-2 py-1 text-muted-foreground", !asTable && "bg-muted text-foreground")} title="กราฟ">
                <BarChart3 className="size-4" aria-hidden /><span className="sr-only">กราฟ</span>
              </button>
              <button type="button" onClick={() => setAsTable(true)} aria-pressed={asTable} className={cn("rounded px-2 py-1 text-muted-foreground", asTable && "bg-muted text-foreground")} title="ตาราง">
                <Table2 className="size-4" aria-hidden /><span className="sr-only">ตาราง</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {asTable && table ? (
        <div className="max-h-[360px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>{table.columns.map((c, i) => <TableHead key={c} className={cn(i >= (table.numericFrom ?? 1) && "text-right")}>{c}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((r, i) => (
                <TableRow key={i}>{r.map((v, j) => <TableCell key={j} className={cn(j >= (table.numericFrom ?? 1) && "tabular text-right")}>{v}</TableCell>)}</TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
