import { requireTenantUser } from "@/server/auth/current-user";
import { qrByIds } from "@/server/queries/company/qr";
import { EmptyState } from "@/components/data/empty-state";
import { PrintSheet } from "./print-sheet";

export default async function Page({ searchParams }: PageProps<"/company/qr-codes/print">) {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const raw = (await searchParams).ids;
  const ids = (typeof raw === "string" ? raw.split(",") : []).filter((s) => /^\d{1,18}$/.test(s)).slice(0, 120).map(BigInt);
  const rows = (await qrByIds(user, ids)).filter((r) => r.status !== "REVOKED");
  if (rows.length === 0) return <EmptyState title="ไม่มี QR ที่พิมพ์ได้" description="เลือก QR ที่ยังไม่ถูกยกเลิกจากหน้า QR Code แล้วกดพิมพ์อีกครั้ง" />;
  return <PrintSheet rows={rows} />;
}
