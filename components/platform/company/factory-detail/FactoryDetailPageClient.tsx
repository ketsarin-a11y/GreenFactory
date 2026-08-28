"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Factory,
  Globe2,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type FactoryCompany = {
  companyId: number;
  companyCode: string;
  companyName: string;
};

type FactoryBuilding = {
  buildingId: number;
  buildingCode: string;
  buildingName: string;
  buildingType: string | null;
  floorCount: number | null;
  status: string;
};

type FactoryDetail = {
  factoryId: number;
  companyId: number;
  factoryCode: string;
  factoryName: string;

  address: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;

  latitude: string | number | null;
  longitude: string | number | null;
  googleMapUrl: string | null;
  mapZoom: number | null;
  layoutImagePath: string | null;

  phone: string | null;
  email: string | null;
  timezone: string | null;
  status: string;

  createdAt: string;
  updatedAt: string;

  company: FactoryCompany;
  buildings?: FactoryBuilding[];

  _count?: {
    buildings: number;
    users: number;
    resourceUsages: number;
  };
};

type FactoryResponse = {
  success: boolean;
  message?: string;
  data: FactoryDetail;
};

type InfoCardProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  tone?: "green" | "blue" | "violet" | "amber";
};

const INFO_TONES = {
  green: "bg-[#eaf7f1] text-[#168662]",
  blue: "bg-[#eaf3ff] text-[#3478da]",
  violet: "bg-[#f2edff] text-[#7c56c4]",
  amber: "bg-[#fff4e5] text-[#d28718]",
};

function InfoCard({
  icon: Icon,
  label,
  value,
  tone = "green",
}: InfoCardProps) {
  return (
    <div className="flex gap-3 rounded-[16px] border border-transparent p-3 transition hover:border-[#e8ece9] hover:bg-[#fbfcfb]">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-[13px] ${INFO_TONES[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium text-[#8b9590]">
          {label}
        </p>

        <p className="mt-1 break-words text-[12px] font-semibold text-[#29342f]">
          {value || "ยังไม่ระบุ"}
        </p>
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return "ใช้งานอยู่";
  if (status === "INACTIVE") return "ไม่ใช้งาน";
  if (status === "SUSPENDED") return "ระงับใช้งาน";
  return status || "ไม่ระบุ";
}

function statusClass(status: string) {
  if (status === "ACTIVE") {
    return "border-[#cfeadf] bg-[#eaf8f2] text-[#087a57]";
  }

  if (status === "SUSPENDED") {
    return "border-[#f1d6da] bg-[#fff0f1] text-[#b83b4b]";
  }

  return "border-[#dde2df] bg-[#f2f4f3] text-[#69756f]";
}

function formatThaiDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "ไม่ระบุ";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function coordinateText(
  latitude: FactoryDetail["latitude"],
  longitude: FactoryDetail["longitude"],
) {
  if (latitude === null || longitude === null) {
    return "ยังไม่ระบุพิกัด";
  }

  return `${String(latitude)}, ${String(longitude)}`;
}

export default function FactoryDetailPageClient({
  companyId,
  factoryId,
}: {
  companyId: number;
  factoryId: number;
}) {
  const [factory, setFactory] = useState<FactoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFactory = useCallback(
    async (signal?: AbortSignal) => {
      if (
        !Number.isInteger(companyId) ||
        companyId <= 0 ||
        !Number.isInteger(factoryId) ||
        factoryId <= 0
      ) {
        setError("รหัสบริษัทหรือโรงงานไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/platform/factories/${factoryId}`,
          {
            cache: "no-store",
            signal,
          },
        );

        const result = (await response.json()) as FactoryResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ?? "ไม่สามารถโหลดข้อมูลโรงงานได้",
          );
        }

        if (result.data.companyId !== companyId) {
          throw new Error("โรงงานนี้ไม่ได้อยู่ในบริษัทที่เลือก");
        }

        setFactory(result.data);
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
    [companyId, factoryId],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadFactory(controller.signal);

    return () => controller.abort();
  }, [loadFactory]);

  const buildings = useMemo(
    () => factory?.buildings ?? [],
    [factory?.buildings],
  );

  const setupItems = useMemo(
    () => [
      {
        label: "ข้อมูลพื้นฐาน",
        complete: Boolean(factory?.factoryName && factory?.factoryCode),
      },
      {
        label: "ข้อมูลติดต่อ",
        complete: Boolean(factory?.phone || factory?.email),
      },
      {
        label: "ที่อยู่โรงงาน",
        complete: Boolean(factory?.address || factory?.province),
      },
      {
        label: "พิกัดและแผนที่",
        complete: Boolean(
          factory?.googleMapUrl ||
            (factory?.latitude !== null &&
              factory?.longitude !== null),
        ),
      },
      {
        label: "โครงสร้างอาคาร",
        complete: buildings.length > 0,
      },
    ],
    [buildings.length, factory],
  );

  if (loading) {
    return (
      <div className="grid min-h-[640px] place-items-center bg-[#f3f5f4]">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] border border-[#dce9e3] bg-white shadow-sm">
            <LoaderCircle className="h-6 w-6 animate-spin text-[#14775a]" />
          </div>

          <p className="mt-4 text-[12px] font-medium text-[#75817b]">
            กำลังโหลดข้อมูลโรงงาน
          </p>
        </div>
      </div>
    );
  }

  if (error || !factory) {
    return (
      <div className="min-h-full bg-[#f3f5f4] px-6 py-10">
        <div className="mx-auto max-w-[760px] rounded-[24px] border border-[#f0d9dc] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-[#fff0f1] text-[#c25563]">
            <CircleAlert className="h-5 w-5" />
          </div>

          <h1 className="mt-4 text-[18px] font-bold text-[#28332e]">
            โหลดข้อมูลโรงงานไม่สำเร็จ
          </h1>

          <p className="mt-2 text-[12px] text-[#a43d4b]">
            {error || "ไม่พบข้อมูลโรงงาน"}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={`/platform/companies/${companyId}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dfe5e1] px-4 text-[11px] font-semibold text-[#5f6c65]"
            >
              กลับหน้าบริษัท
            </Link>

            <button
              type="button"
              onClick={() => void loadFactory()}
              className="h-10 rounded-xl bg-[#0e7b5b] px-5 text-[11px] font-semibold text-white"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  const buildingCount =
    factory._count?.buildings ?? buildings.length;
  const userCount = factory._count?.users ?? 0;

  return (
    <div className="min-h-full bg-[#f3f5f4]">
      <div className="mx-auto max-w-[1640px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/platform/companies/${companyId}`}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-[11px] font-semibold text-[#64716b] transition hover:bg-white hover:text-[#16765a]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้ารายละเอียดบริษัท
          </Link>

          <div className="flex items-center gap-2 text-[10px] text-[#8b9590]">
            <CalendarDays className="h-3.5 w-3.5" />
            อัปเดตล่าสุด {formatThaiDate(factory.updatedAt)}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border border-[#e1e7e3] bg-white shadow-[0_20px_70px_rgba(41,54,47,0.07)]">
          <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-[#dff5ec] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 left-[24%] h-64 w-64 rounded-full bg-[#e8efff] blur-3xl" />

          <div className="relative px-6 py-7 lg:px-8 lg:py-8">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-[#dff4eb] to-[#edf4ff] text-[#126c54] shadow-[inset_0_0_0_1px_rgba(20,119,90,0.08)]">
                  <Factory className="h-8 w-8" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${statusClass(
                        factory.status,
                      )}`}
                    >
                      {statusLabel(factory.status)}
                    </span>

                    <span className="rounded-full border border-[#e0e5e2] bg-[#f7f9f8] px-3 py-1 text-[10px] font-semibold text-[#68746e]">
                      {factory.factoryCode}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe9e2] bg-[#f6fbf8] px-3 py-1 text-[10px] font-semibold text-[#497864]">
                      <ShieldCheck className="h-3 w-3" />
                      Platform view
                    </span>
                  </div>

                  <h1 className="mt-4 max-w-[820px] truncate text-[28px] font-bold tracking-[-0.045em] text-[#202b26] lg:text-[32px]">
                    {factory.factoryName}
                  </h1>

                  <p className="mt-2 text-[11px] text-[#77827c]">
                    {factory.company.companyName} ·{" "}
                    {factory.province || "ยังไม่ระบุจังหวัด"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-[125px] rounded-[18px] border border-[#e5e9e7] bg-white/80 p-4 backdrop-blur">
                  <div className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#eaf3ff] text-[#3478da]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <strong className="mt-3 block text-[24px] text-[#24302a]">
                    {buildingCount}
                  </strong>
                  <p className="mt-1 text-[9px] text-[#8b9590]">
                    อาคาร
                  </p>
                </div>

                <div className="min-w-[125px] rounded-[18px] border border-[#e5e9e7] bg-white/80 p-4 backdrop-blur">
                  <div className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#f2edff] text-[#7c56c4]">
                    <UsersRound className="h-4 w-4" />
                  </div>
                  <strong className="mt-3 block text-[24px] text-[#24302a]">
                    {userCount}
                  </strong>
                  <p className="mt-1 text-[9px] text-[#8b9590]">
                    ผู้ใช้งาน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[24px] border border-[#e2e7e4] bg-white p-6 shadow-[0_14px_44px_rgba(44,55,49,0.045)]">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eaf3ff] text-[#3478da]">
                <LayoutDashboard className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-[16px] font-bold text-[#27322d]">
                  ข้อมูลพื้นฐานโรงงาน
                </h2>
                <p className="mt-1 text-[10px] text-[#8a9490]">
                  Platform Admin เห็นเฉพาะข้อมูลโครงสร้างและการตั้งค่า
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <InfoCard
                icon={Factory}
                label="บริษัทเจ้าของ"
                value={factory.company.companyName}
                tone="green"
              />

              <InfoCard
                icon={Mail}
                label="อีเมลโรงงาน"
                value={factory.email ?? ""}
                tone="blue"
              />

              <InfoCard
                icon={Phone}
                label="โทรศัพท์"
                value={factory.phone ?? ""}
                tone="green"
              />

              <InfoCard
                icon={MapPin}
                label="จังหวัด"
                value={factory.province ?? ""}
                tone="amber"
              />

              <InfoCard
                icon={Globe2}
                label="เขตเวลา"
                value={factory.timezone ?? ""}
                tone="violet"
              />

              <InfoCard
                icon={MapPin}
                label="พิกัด"
                value={coordinateText(
                  factory.latitude,
                  factory.longitude,
                )}
                tone="blue"
              />
            </div>

            <div className="mt-5 rounded-[18px] border border-[#edf0ee] bg-[#f8faf9] p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#6b7771]" />
                <p className="text-[10px] font-semibold text-[#65716b]">
                  ที่อยู่โรงงาน
                </p>
              </div>

              <p className="mt-3 text-[11px] leading-6 text-[#727d77]">
                {[
                  factory.address,
                  factory.province,
                  factory.postalCode,
                  factory.country,
                ]
                  .filter(Boolean)
                  .join(" ") || "ยังไม่ได้ระบุที่อยู่"}
              </p>

              {factory.googleMapUrl && (
                <a
                  href={factory.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-[11px] bg-[#eaf7f1] px-4 text-[10px] font-semibold text-[#167459]"
                >
                  เปิด Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <aside className="overflow-hidden rounded-[24px] bg-[#19382e] text-white shadow-[0_20px_56px_rgba(27,54,45,0.16)]">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
                Factory setup
              </p>
              <h2 className="mt-2 text-[19px] font-bold">
                ความพร้อมของโรงงาน
              </h2>
            </div>

            <div className="space-y-3 px-6 py-5">
              {setupItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[14px] bg-white/[0.06] px-4 py-3"
                >
                  <span className="text-[11px] text-white/75">
                    {item.label}
                  </span>

                  {item.complete ? (
                    <CheckCircle2 className="h-4 w-4 text-[#70ddb2]" />
                  ) : (
                    <span className="rounded-full bg-[#f7b955]/15 px-2 py-1 text-[9px] font-semibold text-[#ffd08a]">
                      ยังไม่ครบ
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 px-6 py-5">
              <p className="text-[10px] leading-5 text-white/55">
                ข้อมูลพลังงาน เครื่องจักร เซนเซอร์ คาร์บอน
                และข้อมูลปฏิบัติการจะไม่แสดงในบัญชี Platform Admin
              </p>
            </div>
          </aside>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#e2e7e4] bg-white shadow-[0_14px_44px_rgba(42,54,48,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0ee] px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#75549f]" />
                <h2 className="text-[16px] font-bold text-[#27322d]">
                  โครงสร้างอาคาร
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-[#8a9490]">
                แสดงเฉพาะข้อมูลพื้นฐานของอาคารภายในโรงงาน
              </p>
            </div>

            <span className="rounded-full bg-[#f2edff] px-3 py-1.5 text-[10px] font-semibold text-[#75549f]">
              {buildingCount} อาคาร
            </span>
          </div>

          {buildings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#f1edfb] text-[#75549f]">
                <Building2 className="h-6 w-6" />
              </div>

              <p className="mt-4 text-[14px] font-semibold">
                ยังไม่มีข้อมูลอาคาร
              </p>

              <p className="mt-1 text-[10px] text-[#8d9691]">
                Factory Admin สามารถสร้างอาคารและโครงสร้างภายในได้ภายหลัง
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {buildings.map((building) => (
                <article
                  key={building.buildingId}
                  className="rounded-[20px] border border-[#e3e7e5] bg-[#fbfcfb] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#f1edfb] text-[#75549f]">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${statusClass(
                        building.status,
                      )}`}
                    >
                      {statusLabel(building.status)}
                    </span>
                  </div>

                  <h3 className="mt-4 truncate text-[13px] font-bold text-[#27322d]">
                    {building.buildingName}
                  </h3>

                  <p className="mt-1 text-[9px] font-medium text-[#8a9490]">
                    {building.buildingCode}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#e9edeb] pt-4 text-[10px] text-[#6f7a74]">
                    <span>
                      {building.buildingType || "ไม่ระบุประเภท"}
                    </span>

                    <span>
                      {building.floorCount
                        ? `${building.floorCount} ชั้น`
                        : "ไม่ระบุชั้น"}
                    </span>
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