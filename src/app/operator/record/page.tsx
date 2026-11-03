import { PageHeader } from "@/components/app/page-header";
import { requireTenantUser } from "@/server/auth/current-user";
import { recordOptions, scanForRecord, targetForRecord, todayChecklist } from "@/server/queries/operator";
import { bkkLocalInput } from "@/server/domain/qr-scan";
import { RecordForm } from "./_components/record-form";

export default async function Page({ searchParams }: PageProps<"/operator/record">) {
  const user = await requireTenantUser("OPERATOR");
  const sp = await searchParams;
  const scanParam = typeof sp.scan === "string" ? sp.scan : null;
  const targetRaw = typeof sp.target === "string" ? sp.target : null;
  const [options, scan, preset, checklist] = await Promise.all([
    recordOptions(user),
    scanParam ? scanForRecord(user, scanParam) : null,
    // ?target=MACHINE:<id> from the home checklist; ids outside my factory resolve to null (ignored).
    scanParam ? null : targetForRecord(user, targetRaw),
    todayChecklist(user),
  ]);

  return (
    <>
      <PageHeader title="บันทึกการใช้ทรัพยากร" description="กรอกค่าที่อ่านได้จากมิเตอร์ ตรวจสอบ แล้วกดบันทึก" />
      <RecordForm
        key={`${scanParam ?? ""}|${preset ? `${preset.kind}:${preset.id}` : ""}`}
        targets={options.targets}
        resources={options.resources}
        scan={scan?.ok ? scan : null}
        scanError={scan && !scan.ok ? scan.error : null}
        preset={preset}
        todo={checklist.todo.map((t) => ({ kind: t.kind, id: t.id, name: t.name, code: t.code }))}
        defaultUsageAt={bkkLocalInput(new Date())}
        recorder={`${user.firstName} ${user.lastName}`}
      />
    </>
  );
}
