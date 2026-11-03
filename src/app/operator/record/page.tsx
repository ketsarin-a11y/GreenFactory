import { PageHeader } from "@/components/app/page-header";
import { requireTenantUser } from "@/server/auth/current-user";
import { recordOptions, scanForRecord } from "@/server/queries/operator";
import { bkkLocalInput } from "@/server/domain/qr-scan";
import { RecordForm } from "./_components/record-form";

export default async function Page({ searchParams }: PageProps<"/operator/record">) {
  const user = await requireTenantUser("OPERATOR");
  const sp = await searchParams;
  const scanParam = typeof sp.scan === "string" ? sp.scan : null;
  const [options, scan] = await Promise.all([recordOptions(user), scanParam ? scanForRecord(user, scanParam) : null]);

  return (
    <>
      <PageHeader title="บันทึกการใช้ทรัพยากร" description="กรอกค่าที่อ่านได้จากมิเตอร์ ตรวจสอบ แล้วกดบันทึก" />
      <RecordForm
        targets={options.targets}
        resources={options.resources}
        scan={scan?.ok ? scan : null}
        scanError={scan && !scan.ok ? scan.error : null}
        defaultUsageAt={bkkLocalInput(new Date())}
        recorder={`${user.firstName} ${user.lastName}`}
      />
    </>
  );
}
