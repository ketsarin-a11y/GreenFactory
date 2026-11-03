import { PageHeader } from "@/components/app/page-header";
import { requireTenantUser } from "@/server/auth/current-user";
import { Scanner } from "./_components/scanner";

export default async function Page() {
  await requireTenantUser("OPERATOR");
  return (
    <>
      <PageHeader title="สแกน QR Code" description="หันกล้องไปที่ QR Code บนเครื่องจักรหรือจุดตรวจ ระบบจะเปิดหน้าบันทึกให้อัตโนมัติ" />
      <Scanner />
    </>
  );
}
