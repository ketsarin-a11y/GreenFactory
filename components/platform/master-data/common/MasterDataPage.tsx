"use client";

import { useMemo, useState } from "react";
import type { MasterColumn, MasterItem } from "./types";
import type { MasterStat } from "./MasterStats";
import MasterHeader from "./MasterHeader";
import MasterStats from "./MasterStats";
import MasterToolbar from "./MasterToolbar";
import MasterTable from "./MasterTable";
import MasterDrawer from "./MasterDrawer";
import Pagination from "./Pagination";

export default function MasterDataPage({
  title,
  description,
  actionLabel,
  drawerTitle,
  iconType,
  rows,
  columns,
  stats,
  categoryLabel,
}: {
  title: string;
  description: string;
  actionLabel: string;
  drawerTitle: string;
  iconType: "machine" | "sensor" | "resource" | "category" | "unit" | "emission";
  rows: MasterItem[];
  columns: MasterColumn[];
  stats: MasterStat[];
  categoryLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MasterItem | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((row) => row.category).filter(Boolean))) as string[],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rows.filter((row) => {
      const text = [
        row.code,
        row.nameTh,
        row.nameEn,
        row.description,
        row.category,
        row.unit,
        row.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!keyword || text.includes(keyword)) &&
        (category === "ALL" || row.category === category) &&
        (status === "ALL" || row.status === status)
      );
    });
  }, [rows, search, category, status]);

  return (
    <div className="space-y-6">
      <MasterHeader
        title={title}
        description={description}
        actionLabel={actionLabel}
      />

      <MasterStats items={stats} />

      <section className="overflow-hidden rounded-[18px] border border-[#e7e4df] bg-white shadow-[0_10px_36px_rgba(52,45,37,0.045)]">
        <MasterToolbar
          search={search}
          category={category}
          status={status}
          categories={categories}
          categoryLabel={categoryLabel}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
          onReset={() => {
            setSearch("");
            setCategory("ALL");
            setStatus("ALL");
            setPage(1);
          }}
        />

        <MasterTable
          rows={filteredRows}
          columns={columns}
          iconType={iconType}
          onView={setSelected}
        />

        <Pagination
          page={page}
          totalVisible={filteredRows.length}
          total={rows.length}
          onPageChange={setPage}
        />
      </section>

      <MasterDrawer
        item={selected}
        title={drawerTitle}
        iconType={iconType}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
