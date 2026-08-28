"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  changeCompanyStatus,
  createCompany,
  listCompanies,
  removeCompany,
} from "./company-api";

import CompanyFilters from "./CompanyFilters";
import CompanyHeader from "./CompanyHeader";
import CompanyTable from "./CompanyTable";
import CreateCompanyModal from "./CreateCompanyModal";
import OperationsOverview from "./OperationsOverview";
import SummaryCards from "./SummaryCards";

import type {
  Company,
  CompanyStatus,
  CompanySummary,
  NewCompany,
} from "./types";

const PAGE_SIZE = 8;

const emptySummary: CompanySummary = {
  totalCompanies: 0,
  activeCompanies: 0,
  pendingCompanies: 0,
  suspendedCompanies: 0,
  totalFactories: 0,
  totalUsers: 0,
  totalMachines: 0,
  totalSensors: 0,
  unresolvedAlerts: 0,
};

export default function CompaniesPageClient() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [summary, setSummary] =
    useState<CompanySummary>(emptySummary);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<"ALL" | CompanyStatus>("ALL");
  const [industry, setIndustry] = useState("ALL");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const industries = useMemo(() => {
    return Array.from(
      new Set(
        companies
          .map((company) => company.industry)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [companies]);

  const loadCompanies = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const response = await listCompanies(
          {
            search,
            status,
            industry,
            page,
            pageSize: PAGE_SIZE,
          },
          signal,
        );

        setCompanies(response.data);
        setSummary(response.summary);
        setTotalItems(response.meta.totalItems);
        setTotalPages(
          Math.max(1, response.meta.totalPages),
        );

        setSelectedIds((current) =>
          current.filter((id) =>
            response.data.some(
              (company) => company.id === id,
            ),
          ),
        );
      } catch (caught) {
        if (
          caught instanceof DOMException &&
          caught.name === "AbortError"
        ) {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : "โหลดข้อมูลบริษัทไม่สำเร็จ",
        );
      } finally {
        setLoading(false);
      }
    },
    [industry, page, search, status],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadCompanies(controller.signal);

    return () => controller.abort();
  }, [loadCompanies]);

  function toggleSelect(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleSelectAll() {
    const visibleIds = companies.map(
      (company) => company.id,
    );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedIds.includes(id),
      );

    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter(
          (id) => !visibleIds.includes(id),
        );
      }

      return Array.from(
        new Set([...current, ...visibleIds]),
      );
    });
  }

  async function handleStatusChange(
    id: number,
    nextStatus: CompanyStatus,
  ) {
    try {
      await changeCompanyStatus(id, nextStatus);
      await loadCompanies();
    } catch (caught) {
      window.alert(
        caught instanceof Error
          ? caught.message
          : "เปลี่ยนสถานะไม่สำเร็จ",
      );
    }
  }

  async function handleDelete(id: number) {
    const target = companies.find(
      (company) => company.id === id,
    );

    if (!target) {
      return;
    }

    const confirmed = window.confirm(
      `ต้องการลบ “${target.name}” ใช่หรือไม่`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeCompany(id);

      setSelectedIds((current) =>
        current.filter((item) => item !== id),
      );

      await loadCompanies();
    } catch (caught) {
      window.alert(
        caught instanceof Error
          ? caught.message
          : "ลบบริษัทไม่สำเร็จ",
      );
    }
  }

  async function handleCreate(form: NewCompany) {
    setCreating(true);

    try {
      await createCompany(form);

      setCreateOpen(false);
      setPage(1);

      await loadCompanies();
    } finally {
      setCreating(false);
    }
  }

  function exportCsv() {
    const csvRows = [
      [
        "รหัส",
        "ชื่อบริษัท",
        "อีเมล",
        "อุตสาหกรรม",
        "สถานะ",
      ],
      ...companies.map((company) => [
        company.code,
        company.name,
        company.email,
        company.industry,
        company.status,
      ]),
    ];

    const csv = csvRows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(
                /"/g,
                '""',
              )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "greenfactory-companies.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-full bg-[#f3f5f4]">
      <div className="mx-auto max-w-[1640px] space-y-5 px-4 py-6 lg:px-8">
        <CompanyHeader
          totalCompanies={summary.totalCompanies}
          totalFactories={summary.totalFactories}
          totalUsers={summary.totalUsers}
          activeCompanies={summary.activeCompanies}
          onCreate={() => setCreateOpen(true)}
          onExport={exportCsv}
        />

        <SummaryCards summary={summary} />

        <OperationsOverview summary={summary} />

        <section className="overflow-hidden rounded-[22px] border border-[#e2e7e4] bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold">
                รายชื่อบริษัท
              </h2>

              <p className="mt-1 text-[10px] text-[#8a9490]">
                พบ {totalItems} รายการ
              </p>
            </div>

            {loading && (
              <LoaderCircle className="h-4 w-4 animate-spin text-[#0e7b5b]" />
            )}
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
            onReset={() => {
              setSearch("");
              setStatus("ALL");
              setIndustry("ALL");
              setPage(1);
            }}
          />

          {error ? (
            <div className="py-16 text-center">
              <AlertTriangle className="mx-auto h-6 w-6 text-[#c15561]" />

              <p className="mt-3 text-[13px] font-semibold">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadCompanies()
                }
                className="mt-4 rounded-xl bg-[#0e7b5b] px-4 py-2 text-[11px] font-semibold text-white"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <CompanyTable
              companies={companies}
              selectedIds={selectedIds}
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              loading={loading}
              onSelect={toggleSelect}
              onSelectAll={toggleSelectAll}
              onPageChange={setPage}
              onView={(company) => {
                router.push(
                  `/platform/companies/${company.id}`,
                );
              }}
              onStatusChange={
                handleStatusChange
              }
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>

      <CreateCompanyModal
        open={createOpen}
        submitting={creating}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}