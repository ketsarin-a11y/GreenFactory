"use client";

import { useMemo, useState } from "react";
import CompanyDrawer from "./CompanyDrawer";
import CompanyFilters from "./CompanyFilters";
import CompanyHeader from "./CompanyHeader";
import CompanyTable from "./CompanyTable";
import CreateCompanyModal from "./CreateCompanyModal";
import SummaryCards from "./SummaryCards";
import OperationsOverview from "./OperationsOverview";
import { INITIAL_COMPANIES } from "./data";
import type { Company, CompanyStatus, NewCompany } from "./types";

const PAGE_SIZE = 6;

export default function CompaniesPageClient() {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | CompanyStatus>("ALL");
  const [industry, setIndustry] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [drawerCompany, setDrawerCompany] = useState<Company | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const industries = useMemo(
    () => Array.from(new Set(companies.map((item) => item.industry))),
    [companies],
  );

  const filteredCompanies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return companies.filter((company) => {
      const searchable = [
        company.name,
        company.email,
        company.code,
        company.industry,
        company.contactName,
        company.phone,
        company.province,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!keyword || searchable.includes(keyword)) &&
        (status === "ALL" || company.status === status) &&
        (industry === "ALL" || company.industry === industry)
      );
    });
  }, [companies, industry, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const visibleCompanies = filteredCompanies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalFactories = companies.reduce((sum, item) => sum + item.factories, 0);
  const totalUsers = companies.reduce((sum, item) => sum + item.users, 0);

  function resetFilters() {
    setSearch("");
    setStatus("ALL");
    setIndustry("ALL");
    setPage(1);
  }

  function toggleSelect(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleSelectAll() {
    const ids = visibleCompanies.map((item) => item.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  }

  function changeStatus(id: number, nextStatus: CompanyStatus) {
    setCompanies((current) =>
      current.map((company) =>
        company.id === id ? { ...company, status: nextStatus } : company,
      ),
    );
  }

  function removeCompany(id: number) {
    const target = companies.find((item) => item.id === id);

    if (!target || !window.confirm(`ต้องการลบ “${target.name}” ใช่หรือไม่`)) {
      return;
    }

    setCompanies((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function createCompany(form: NewCompany) {
    const nextId = Math.max(0, ...companies.map((item) => item.id)) + 1;

    setCompanies((current) => [
      {
        id: nextId,
        ...form,
        registeredAt: new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date()),
        registeredTime: `${new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        })} น.`,
        status: "ACTIVE",
        logoText: form.name.replace("บริษัท", "").trim().slice(0, 2).toUpperCase(),
        logoClass: "bg-slate-100 text-slate-700",
        factories: 0,
        users: 1,
      },
      ...current,
    ]);

    setCreateOpen(false);
    setPage(1);
  }

  function exportCsv() {
    const rows = filteredCompanies.map((company) => [
      company.code,
      company.name,
      company.email,
      company.industry,
      company.contactName,
      company.phone,
      company.province,
    ]);

    const csv = [
      ["รหัส", "ชื่อบริษัท", "อีเมล", "อุตสาหกรรม", "ผู้ดูแล", "โทรศัพท์", "จังหวัด"],
      ...rows,
    ]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "companies.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-full bg-[#f3f4f6]">
      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <CompanyHeader
          totalCompanies={companies.length}
          totalFactories={totalFactories}
          totalUsers={totalUsers}
          activeCompanies={companies.filter((item) => item.status === "ACTIVE").length}
          onCreate={() => setCreateOpen(true)}
          onExport={exportCsv}
        />

        <SummaryCards companies={companies} />

        <OperationsOverview companies={companies} />

        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold text-slate-950">รายชื่อบริษัท</h2>
              <p className="mt-1 text-[10px] text-slate-400">
                พบ {filteredCompanies.length} รายการ
              </p>
            </div>
          </div>

          <CompanyFilters
            search={search}
            status={status}
            industry={industry}
            industries={industries}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onStatus={(value) => {
              setStatus(value);
              setPage(1);
            }}
            onIndustry={(value) => {
              setIndustry(value);
              setPage(1);
            }}
            onReset={resetFilters}
          />

          <CompanyTable
            companies={visibleCompanies}
            selectedIds={selectedIds}
            page={page}
            totalPages={totalPages}
            totalItems={filteredCompanies.length}
            pageSize={PAGE_SIZE}
            onSelect={toggleSelect}
            onSelectAll={toggleSelectAll}
            onPageChange={setPage}
            onView={setDrawerCompany}
            onStatusChange={changeStatus}
            onDelete={removeCompany}
          />
        </section>
      </div>

      <CompanyDrawer company={drawerCompany} onClose={() => setDrawerCompany(null)} />

      <CreateCompanyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createCompany}
      />
    </div>
  );
}
