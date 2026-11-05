import { PageHeader } from "@/components/app/page-header";
import { SummaryStrip } from "@/components/company/summary-strip";
import { requireTenantUser } from "@/server/auth/current-user";
import { companyTree } from "@/server/queries/company/tree";
import { fmtNum } from "@/lib/format";
import { StructureView, type TreeNode } from "./_components/structure-view";

export default async function Page() {
  const user = await requireTenantUser("COMPANY_ADMIN");
  const tree = await companyTree(user);
  const nodes: TreeNode[] = tree.map((f) => ({
    kind: "factory", id: f.factoryId, code: f.factoryCode, name: f.factoryName, status: f.status, parentId: null,
    info: { users: f._count.users },
    children: f.buildings.map((b) => ({
      kind: "building", id: b.buildingId, code: b.buildingCode, name: b.buildingName, status: b.status, parentId: f.factoryId,
      info: { buildingType: b.buildingType, floorCount: b.floorCount, description: b.description },
      children: b.departments.map((d) => ({
        kind: "department", id: d.departmentId, code: d.departmentCode, name: d.departmentName, status: d.status, parentId: b.buildingId,
        info: { description: d.description, users: d._count.users },
        children: d.productionLines.map((l) => ({
          kind: "line", id: l.lineId, code: l.lineCode, name: l.lineName, status: l.status, parentId: d.departmentId,
          info: { description: l.description, machines: l.machines.length },
          children: l.checkpoints.map((c) => ({
            kind: "checkpoint", id: c.checkpointId, code: c.checkpointCode, name: c.checkpointName, status: c.status, parentId: l.lineId,
            info: { checkpointType: c.checkpointType, description: c.description }, children: [],
          })),
        })),
      })),
    })),
  }));
  const all = (k: TreeNode["kind"]) => {
    let n = 0;
    const walk = (xs: TreeNode[]) => xs.forEach((x) => { if (x.kind === k) n++; walk(x.children); });
    walk(nodes);
    return n;
  };
  const machines = tree.flatMap((f) => f.buildings.flatMap((b) => b.departments.flatMap((d) => d.productionLines.flatMap((l) => l.machines)))).length;
  return (
    <>
      <PageHeader title="โครงสร้างโรงงาน" description="ลำดับชั้นจากโรงงานถึงจุดตรวจวัด เลือกรายการเพื่อดูรายละเอียด เพิ่ม หรือแก้ไข" />
      <SummaryStrip
        items={[
          { label: "โรงงาน", value: fmtNum(nodes.length) },
          { label: "อาคาร", value: fmtNum(all("building")) },
          { label: "แผนก", value: fmtNum(all("department")) },
          { label: "สายการผลิต", value: fmtNum(all("line")) },
          { label: "จุดตรวจวัด", value: fmtNum(all("checkpoint")) },
          { label: "เครื่องจักร", value: fmtNum(machines) },
        ]}
      />
      <StructureView nodes={nodes} />
    </>
  );
}
