"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Sparkles,
  Building2,
  CheckCircle2,
  Factory,
  Globe2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type CompanyDetail = {
  companyId: number;
  companyCode: string;
  companyName: string;

  taxId: string | null;
  industryType: string | null;

  address: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;

  phone: string | null;
  email: string | null;
  website: string | null;
  logoPath: string | null;

  subscriptionPlan: string | null;
  carbonStandard: string | null;

  timezone: string | null;
  currency: string | null;
  language: string | null;

  status: string;
  createdAt: string;
  updatedAt: string;

  _count?: {
    factories: number;
    users: number;
    resourceUsages: number;
    equipment: number;
  };
};

type FactoryItem = {
  id: number;
  code: string;
  name: string;

  address: string;
  province: string;
  country: string;

  latitude: string | null;
  longitude: string | null;
  googleMapUrl: string;

  phone: string;
  email: string;
  timezone: string;

  status: string;
  buildings: number;
  users: number;
  resourceUsages: number;
};

type CompanyResponse = {
  success: boolean;
  message?: string;
  data: CompanyDetail;
};

type FactoryResponse = {
  success: boolean;
  message?: string;
  data: FactoryItem[];
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#edf6f2] text-[#14775a]">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] text-[#8b9590]">{label}</p>

        <p className="mt-1 break-words text-[12px] font-semibold text-[#29342f]">
          {value || "ยังไม่ระบุ"}
        </p>
      </div>
    </div>
  );
}

export default function CompanyDetailPageClient({
  companyId,
}: {
  companyId: number;
}) {
  const router = useRouter();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [factories, setFactories] = useState<FactoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      if (!Number.isInteger(companyId) || companyId <= 0) {
        setError("รหัสบริษัทไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [companyResponse, factoryResponse] = await Promise.all([
          fetch(`/api/platform/companies/${companyId}`, {
            cache: "no-store",
            signal,
          }),
          fetch(
            `/api/platform/factories?companyId=${companyId}&page=1&pageSize=100&status=ALL`,
            {
              cache: "no-store",
              signal,
            },
          ),
        ]);

        const companyResult =
          (await companyResponse.json()) as CompanyResponse;

        const factoryResult =
          (await factoryResponse.json()) as FactoryResponse;

        if (!companyResponse.ok || !companyResult.success) {
          throw new Error(
            companyResult.message ?? "ไม่สามารถโหลดข้อมูลบริษัทได้",
          );
        }

        if (!factoryResponse.ok || !factoryResult.success) {
          throw new Error(
            factoryResult.message ?? "ไม่สามารถโหลดข้อมูลโรงงานได้",
          );
        }

        setCompany(companyResult.data);
        setFactories(factoryResult.data);
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
            : "ไม่สามารถโหลดข้อมูลได้",
        );
      } finally {
        setLoading(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  if (loading) {
    return (
      <div className="grid min-h-[520px] place-items-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#14775a]" />

          <p className="mt-3 text-[12px] text-[#75817b]">
            กำลังโหลดรายละเอียดบริษัท
          </p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-10">
        <div className="rounded-[22px] border border-[#f0d9dc] bg-white p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-[#fff0f1] text-[#c25563]">
            <CircleAlert className="h-5 w-5" />
          </div>

          <p className="mt-4 text-[14px] font-semibold text-[#a43d4b]">
            {error || "ไม่พบข้อมูลบริษัท"}
          </p>

          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-5 rounded-xl bg-[#0e7b5b] px-5 py-2.5 text-[11px] font-semibold text-white"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const totalBuildings = factories.reduce(
    (sum, factory) => sum + factory.buildings,
    0,
  );

  const totalFactoryUsers = factories.reduce(
    (sum, factory) => sum + factory.users,
    0,
  );

  return (
    <div className="min-h-full bg-[#f3f5f4]">
      <div className="mx-auto max-w-[1640px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/platform/companies"
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-[11px] font-semibold text-[#64716b] transition hover:bg-white hover:text-[#16765a]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าบริษัท
          </Link>

          <div className="flex items-center gap-2 text-[10px] text-[#8b9590]">
            <CalendarDays className="h-3.5 w-3.5" />
            อัปเดตล่าสุด{" "}
            {new Intl.DateTimeFormat("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(company.updatedAt))}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border border-[#e1e7e3] bg-white px-7 py-7 shadow-[0_18px_60px_rgba(41,54,47,0.06)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#dff5ec] blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] bg-[#e8f5f0] text-[20px] font-bold text-[#107458]">
                {company.companyName
                  .replace("บริษัท", "")
                  .trim()
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eaf8f2] px-3 py-1 text-[10px] font-semibold text-[#087a57]">
                    {company.status === "ACTIVE"
                      ? "ใช้งานอยู่"
                      : company.status}
                  </span>

                  <span className="rounded-full bg-[#f1f3f2] px-3 py-1 text-[10px] font-semibold text-[#68746e]">
                    {company.subscriptionPlan ?? "ยังไม่มีแผน"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe9e2] bg-[#f6fbf8] px-3 py-1 text-[10px] font-semibold text-[#497864]">
                    <Sparkles className="h-3 w-3" />
                    Organization workspace
                  </span>
                </div>

                <h1 className="mt-3 text-[28px] font-bold tracking-[-0.045em] text-[#202b26]">
                  {company.companyName}
                </h1>

                <p className="mt-2 text-[11px] text-[#77827c]">
                  {company.companyCode} ·{" "}
                  {company.industryType ?? "ยังไม่ระบุอุตสาหกรรม"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="min-w-[115px] rounded-[16px] border border-[#e5e9e7] bg-[#fbfcfb] p-4">
                <p className="text-[9px] text-[#8b9590]">โรงงาน</p>
                <strong className="mt-2 block text-[23px]">
                  {factories.length}
                </strong>
              </div>

              <div className="min-w-[115px] rounded-[16px] border border-[#e5e9e7] bg-[#fbfcfb] p-4">
                <p className="text-[9px] text-[#8b9590]">อาคาร</p>
                <strong className="mt-2 block text-[23px]">
                  {totalBuildings}
                </strong>
              </div>

              <div className="min-w-[115px] rounded-[16px] border border-[#e5e9e7] bg-[#fbfcfb] p-4">
                <p className="text-[9px] text-[#8b9590]">ผู้ใช้</p>
                <strong className="mt-2 block text-[23px]">
                  {company._count?.users ?? totalFactoryUsers}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="rounded-[24px] border border-[#e2e7e4] bg-white p-6 shadow-[0_12px_40px_rgba(44,55,49,0.045)]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#eaf3ff] text-[#3478da]">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-[15px] font-bold text-[#27322d]">
                  ข้อมูลบริษัท
                </h2>

                <p className="mt-1 text-[10px] text-[#8a9490]">
                  ข้อมูลติดต่อและการตั้งค่าหลัก
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <InfoItem
                icon={Mail}
                label="อีเมล"
                value={company.email ?? ""}
              />

              <InfoItem
                icon={Phone}
                label="โทรศัพท์"
                value={company.phone ?? ""}
              />

              <InfoItem
                icon={MapPin}
                label="จังหวัด"
                value={company.province ?? ""}
              />

              <InfoItem
                icon={Globe2}
                label="เว็บไซต์"
                value={company.website ?? ""}
              />

              <InfoItem
                icon={ShieldCheck}
                label="มาตรฐานคาร์บอน"
                value={company.carbonStandard ?? ""}
              />

              <InfoItem
                icon={Globe2}
                label="เขตเวลา"
                value={company.timezone ?? ""}
              />
            </div>

            <div className="mt-6 rounded-[16px] bg-[#f7f9f8] p-4">
              <p className="text-[10px] font-semibold text-[#65716b]">
                ที่อยู่
              </p>

              <p className="mt-2 text-[11px] leading-6 text-[#727d77]">
                {[
                  company.address,
                  company.province,
                  company.postalCode,
                  company.country,
                ]
                  .filter(Boolean)
                  .join(" ") || "ยังไม่ได้ระบุที่อยู่"}
              </p>
            </div>
          </div>

          <aside className="rounded-[22px] bg-[#1d382f] p-6 text-white shadow-[0_18px_50px_rgba(27,54,45,0.14)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">
              Organization setup
            </p>

            <h2 className="mt-3 text-[19px] font-bold">
              สถานะการตั้งค่าบริษัท
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/70">
                  ข้อมูลบริษัท
                </span>

                <CheckCircle2 className="h-4 w-4 text-[#6ee7b7]" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/70">
                  โรงงานหลัก
                </span>

                {factories.length > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-[#6ee7b7]" />
                ) : (
                  <span className="text-[10px] text-[#fdba74]">
                    ยังไม่มี
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/70">
                  ผู้ใช้งาน
                </span>

                {(company._count?.users ?? 0) > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-[#6ee7b7]" />
                ) : (
                  <span className="text-[10px] text-[#fdba74]">
                    ยังไม่มี
                  </span>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-[24px] border border-[#e2e7e4] bg-white shadow-[0_14px_44px_rgba(42,54,48,0.05)]">
          <div className="flex items-center justify-between border-b border-[#edf0ee] px-6 py-5">
            <div>
              <h2 className="text-[15px] font-bold text-[#27322d]">
                โรงงานของบริษัท
              </h2>

              <p className="mt-1 text-[10px] text-[#8a9490]">
                บริษัทนี้มี {factories.length} โรงงาน
              </p>
            </div>

            <Factory className="h-5 w-5 text-[#238066]" />
          </div>

          {factories.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Factory className="mx-auto h-7 w-7 text-[#87928c]" />

              <p className="mt-3 text-[13px] font-semibold">
                บริษัทยังไม่มีโรงงาน
              </p>

              <p className="mt-1 text-[10px] text-[#8d9691]">
                สามารถเพิ่มโรงงานผ่าน Factory API ได้ภายหลัง
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {factories.map((factory) => (
                <article
                  key={factory.id}
                  className="rounded-[20px] border border-[#e1e6e3] bg-[#fbfcfb] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(42,55,48,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#e7f4ef] text-[#167459]">
                        <Factory className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-bold text-[#26312c]">
                          {factory.name}
                        </h3>

                        <p className="mt-1 text-[10px] text-[#87918c]">
                          {factory.code}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#eaf8f2] px-2.5 py-1 text-[9px] font-semibold text-[#087a57]">
                      ใช้งานอยู่
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-[13px] bg-white p-3">
                      <p className="text-[9px] text-[#8b9590]">อาคาร</p>
                      <strong className="mt-1 block text-[18px]">
                        {factory.buildings}
                      </strong>
                    </div>

                    <div className="rounded-[13px] bg-white p-3">
                      <p className="text-[9px] text-[#8b9590]">ผู้ใช้</p>
                      <strong className="mt-1 block text-[18px]">
                        {factory.users}
                      </strong>
                    </div>

                    <div className="rounded-[13px] bg-white p-3">
                      <p className="text-[9px] text-[#8b9590]">
                        การบันทึก
                      </p>
                      <strong className="mt-1 block text-[18px]">
                        {factory.resourceUsages}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[10px] text-[#67736c]">
                    <MapPin className="h-3.5 w-3.5" />
                    {factory.province || "ยังไม่ระบุจังหวัด"}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#e9edeb] pt-4">
                    <p className="max-w-[65%] truncate text-[9px] text-[#8d9691]">
                      {factory.address || "ยังไม่ได้ระบุที่อยู่โรงงาน"}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/platform/companies/${companyId}/factories/${factory.id}`,
                        )
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-[11px] bg-[#0e7b5b] px-4 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(14,123,91,0.18)] transition hover:bg-[#0a6d50]"
                    >
                      เข้าโรงงาน
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}