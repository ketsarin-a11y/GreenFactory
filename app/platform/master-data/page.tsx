import Link from "next/link";

export default function MasterDataPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Master Data
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          จัดการข้อมูลอ้างอิงของแพลตฟอร์ม
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/platform/master-data/machine-types"
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            Machine Types
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ประเภทเครื่องจักร
          </p>
        </Link>

        <Link
          href="/platform/master-data/sensor-types"
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            Sensor Types
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ประเภทเซนเซอร์
          </p>
        </Link>

        <Link
          href="/platform/master-data/units"
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            Units
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            หน่วยวัด
          </p>
        </Link>

        <Link
          href="/platform/master-data/resource-categories"
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            Resource Categories
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            หมวดหมู่ทรัพยากร
          </p>
        </Link>

        <Link
          href="/platform/master-data/resource-types"
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            Resource Types
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ประเภททรัพยากร
          </p>
        </Link>

        <Link
          href="/platform/master-data/emission-factors"
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            Emission Factors
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ปัจจัยการปล่อยคาร์บอน
          </p>
        </Link>
      </div>
    </main>
  );
}