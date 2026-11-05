import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { requireUser } from "@/server/auth/current-user";
import { permissionMatrix } from "@/server/queries/platform/roles";
import { PermissionMatrix } from "./_components/permission-matrix";

export default async function Page() {
  await requireUser("PLATFORM_ADMIN");
  const m = await permissionMatrix();
  return (
    <>
      <PageHeader
        title="บทบาทและสิทธิ์"
        description="ระดับสิทธิ์ของแต่ละบทบาทต่อกลุ่มเมนู ผู้ดูแลแพลตฟอร์มมีสิทธิ์เต็มเสมอ การเข้าถึงหน้าจริงยังตรวจตามบทบาทของผู้ใช้"
      />
      {m.permissions.length === 0 || m.roles.length === 0 ? (
        <EmptyState icon={KeyRound} title="ยังไม่มีข้อมูลสิทธิ์" description="รัน seed ของ permission และ role ก่อน (npx prisma db seed)" />
      ) : (
        <PermissionMatrix roles={m.roles} permissions={m.permissions} levels={m.levels} />
      )}
    </>
  );
}
