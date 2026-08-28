"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFactory,
  deleteFactory,
  listFactories,
  updateFactoryStatus,
} from "./factory-api";
import CreateFactoryModal from "./CreateFactoryModal";
import FactoryDrawer from "./FactoryDrawer";
import FactoryFilters from "./FactoryFilters";
import FactoryHeader from "./FactoryHeader";
import FactorySummaryCards from "./FactorySummaryCards";
import FactoryTable from "./FactoryTable";
import type {
  CompanyOption,
  Factory,
  FactoryStatus,
  FactorySummary,
  NewFactory,
} from "./types";

const PAGE_SIZE = 8;

const emptySummary: FactorySummary = {
  totalFactories: 0,
  activeFactories: 0,
  inactiveFactories: 0,
  suspendedFactories: 0,
  totalBuildings: 0,
  totalUsers: 0,
};

export default function FactoriesPageClient() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [summary, setSummary] =
    useState<FactorySummary>(emptySummary);

  /*
   * เก็บบริษัททั้งหมดที่เปิดใช้งาน
   * ไม่กรองบริษัทที่มีโรงงานออกตรงนี้
   */
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<"ALL" | FactoryStatus>("ALL");
  const [companyId, setCompanyId] = useState("");
  const [page, setPage] = useState(1);

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [drawerFactory, setDrawerFactory] =
    useState<Factory | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  /*
   * รายชื่อบริษัทสำหรับตัวกรอง
   * รวมข้อมูลจาก API บริษัทและบริษัทที่อยู่ในรายการโรงงาน
   * แล้วใช้ Map ตัด ID ซ้ำ
   */
  const filterCompanies = useMemo(() => {
    const companyMap = new Map<number, CompanyOption>();

    for (const company of companies) {
      companyMap.set(company.id, company);
    }

    for (const factory of factories) {
      companyMap.set(factory.company.companyId, {
        id: factory.company.companyId,
        code: factory.company.companyCode,
        name: factory.company.companyName,
      });
    }

    return Array.from(companyMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [companies, factories]);

  /*
   * รายชื่อบริษัทสำหรับ Modal เพิ่มโรงงาน
   * จะแสดงเฉพาะบริษัทที่ยังไม่มีโรงงาน
   */
  const availableCompanies = useMemo(() => {
    const companyIdsWithFactory = new Set(
      factories.map(
        (factory) => factory.company.companyId,
      ),
    );

    return companies.filter(
      (company) => !companyIdsWithFactory.has(company.id),
    );
  }, [companies, factories]);

  const loadFactories = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const response = await listFactories(
          {
            search,
            status,
            companyId,
            page,
            pageSize: PAGE_SIZE,
          },
          signal,
        );

        setFactories(response.data);
        setSummary(response.summary);
        setTotalItems(response.meta.totalItems);
        setTotalPages(
          Math.max(1, response.meta.totalPages),
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
            : "ไม่สามารถโหลดข้อมูลโรงงานได้",
        );
      } finally {
        setLoading(false);
      }
    },
    [companyId, page, search, status],
  );

  /*
   * โหลดบริษัททั้งหมดเพียงอย่างเดียว
   * ไม่ผูก dependency กับ factories เพื่อป้องกัน fetch วน
   */
  const loadCompanies = useCallback(async () => {
    const response = await fetch(
      "/api/platform/companies?page=1&pageSize=100&status=ACTIVE&industry=ALL",
      {
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ?? "ไม่สามารถโหลดบริษัทได้",
      );
    }

    const companyMap = new Map<number, CompanyOption>();

    for (const company of data.data as Array<{
      id: number;
      code: string;
      name: string;
    }>) {
      companyMap.set(company.id, {
        id: company.id,
        code: company.code,
        name: company.name,
      });
    }

    setCompanies(
      Array.from(companyMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadFactories(controller.signal);

    return () => controller.abort();
  }, [loadFactories]);

  useEffect(() => {
    void loadCompanies().catch((caught) => {
      console.error("Load companies error:", caught);
      setCompanies([]);
    });
  }, [loadCompanies]);

  async function handleCreate(form: NewFactory) {
    setCreating(true);

    try {
      await createFactory(form);

      setCreateOpen(false);
      setPage(1);

      await loadFactories();
      await loadCompanies();
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(
    id: number,
    nextStatus: FactoryStatus,
  ) {
    try {
      await updateFactoryStatus(id, nextStatus);
      await loadFactories();
    } catch (caught) {
      window.alert(
        caught instanceof Error
          ? caught.message
          : "เปลี่ยนสถานะโรงงานไม่สำเร็จ",
      );
    }
  }

  async function handleDelete(id: number) {
    const target = factories.find(
      (factory) => factory.id === id,
    );

    if (
      !target ||
      !window.confirm(
        `ต้องการลบ “${target.name}” ใช่หรือไม่`,
      )
    ) {
      return;
    }

    try {
      await deleteFactory(id);

      setDrawerFactory((current) =>
        current?.id === id ? null : current,
      );

      await loadFactories();
      await loadCompanies();
    } catch (caught) {
      window.alert(
        caught instanceof Error
          ? caught.message
          : "ลบโรงงานไม่สำเร็จ",
      );
    }
  }

  return (
    <div className="min-h-full bg-[#f3f5f4]">
      <div className="mx-auto max-w-[1640px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <FactoryHeader
          totalFactories={summary.totalFactories}
          activeFactories={summary.activeFactories}
          totalBuildings={summary.totalBuildings}
          onCreate={() => setCreateOpen(true)}
        />

        <FactorySummaryCards summary={summary} />

        <section className="overflow-hidden rounded-[22px] border border-[#e2e7e4] bg-white shadow-[0_14px_44px_rgba(42,54,48,0.05)]">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold">
                รายชื่อโรงงาน
              </h2>

              <p className="mt-1 text-[10px] text-[#8a9490]">
                พบ {totalItems} รายการ
              </p>
            </div>

            {loading && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
          </div>

          <FactoryFilters
            search={search}
            status={status}
            companyId={companyId}
            companies={filterCompanies}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onStatus={(value) => {
              setStatus(value);
              setPage(1);
            }}
            onCompany={(value) => {
              setCompanyId(value);
              setPage(1);
            }}
            onReset={() => {
              setSearch("");
              setStatus("ALL");
              setCompanyId("");
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
                onClick={() => void loadFactories()}
                className="mt-4 rounded-xl bg-[#0e7b5b] px-4 py-2 text-white"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <FactoryTable
              factories={factories}
              loading={loading}
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              onView={setDrawerFactory}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>

      <FactoryDrawer
        factory={drawerFactory}
        onClose={() => setDrawerFactory(null)}
      />

      <CreateFactoryModal
        open={createOpen}
        companies={availableCompanies}
        submitting={creating}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}