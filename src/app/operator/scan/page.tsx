import { PageHeader } from "@/components/app/page-header";
import { requireTenantUser } from "@/server/auth/current-user";
import { Scanner } from "./_components/scanner";

export default async function Page() {
  await requireTenantUser("OPERATOR");
  return (
    <>
      <PageHeader title="สแกน QR Code" description="หันกล้องไปที่ป้าย QR บนเครื่องจักรหรือจุดตรวจ" />
      <Scanner />
    </>
  );
}
