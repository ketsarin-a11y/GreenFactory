"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmAction } from "@/components/platform/confirm-button";
import { deleteCompany, setCompanyStatus } from "@/server/actions/platform/companies";

export function CompanyActions({ id, name, status, showView = true }: { id: number; name: string; status: string; showView?: boolean }) {
  const [dialog, setDialog] = useState<"status" | "delete" | null>(null);
  const router = useRouter();
  const suspend = status === "ACTIVE";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`การจัดการ ${name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showView && (
            <DropdownMenuItem asChild>
              <Link href={`/platform/companies/${id}`}>
                <Eye /> ดูรายละเอียด
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setDialog("status")}>
            {suspend ? <Ban /> : <CheckCircle2 />} {suspend ? "ระงับใช้งาน" : status === "PENDING" ? "อนุมัติและเปิดใช้งาน" : "เปิดใช้งาน"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
            <Trash2 /> ลบบริษัท
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmAction
        open={dialog === "status"}
        onOpenChange={(o) => setDialog(o ? "status" : null)}
        action={setCompanyStatus}
        input={{ companyId: id, status: suspend ? "SUSPENDED" : "ACTIVE" }}
        title={suspend ? `ระงับ ${name}?` : `เปิดใช้งาน ${name}?`}
        description={suspend ? "ผู้ใช้ทุกคนของบริษัทนี้จะถูกออกจากระบบทันทีและเข้าสู่ระบบไม่ได้จนกว่าจะเปิดใช้งานอีกครั้ง" : "ผู้ใช้ของบริษัทนี้จะเข้าสู่ระบบได้ตามปกติ"}
        confirmLabel={suspend ? "ระงับใช้งาน" : "เปิดใช้งาน"}
        success={suspend ? "ระงับบริษัทแล้ว" : "เปิดใช้งานบริษัทแล้ว"}
        destructive={suspend}
      />
      <ConfirmAction
        open={dialog === "delete"}
        onOpenChange={(o) => setDialog(o ? "delete" : null)}
        action={deleteCompany}
        input={{ companyId: id }}
        title={`ลบ ${name}?`}
        description="ลบได้เฉพาะบริษัทที่ยังไม่มีโรงงาน ผู้ใช้ หรือข้อมูลใด ๆ ถ้ามีข้อมูลแล้วให้ใช้การระงับแทน การลบย้อนกลับไม่ได้"
        confirmLabel="ลบบริษัท"
        success="ลบบริษัทแล้ว"
        onSuccess={() => !showView && router.push("/platform/companies")}
        destructive
      />
    </>
  );
}
