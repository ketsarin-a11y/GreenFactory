"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronRight, Factory, Layers, MapPin, Pencil, Plus, Search, Trash2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { Nameplate } from "@/components/data/nameplate";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { FormSheet } from "@/components/company/form-sheet";
import { ConfirmDialog, type Confirm } from "@/components/company/confirm-dialog";
import { SelectField } from "@/components/company/select-field";
import { STATUS_OPTIONS } from "@/components/company/labels";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { deleteStructureNode, saveBuilding, saveCheckpoint, saveDepartment, saveLine } from "@/server/actions/company/structure";

type Kind = "factory" | "building" | "department" | "line" | "checkpoint";
export type TreeNode = {
  kind: Kind; id: number; code: string; name: string; status: string; parentId: number | null;
  info: Record<string, string | number | null>; children: TreeNode[];
};
type Editable = Exclude<Kind, "factory">;

const META: Record<Kind, { label: string; icon: typeof Factory; child?: Editable }> = {
  factory: { label: "โรงงาน", icon: Factory, child: "building" },
  building: { label: "อาคาร", icon: Building2, child: "department" },
  department: { label: "แผนก", icon: Layers, child: "line" },
  line: { label: "สายการผลิต", icon: Workflow, child: "checkpoint" },
  checkpoint: { label: "จุดตรวจวัด", icon: MapPin },
};
const INFO_LABEL: Record<string, string> = {
  buildingType: "ประเภทอาคาร", floorCount: "จำนวนชั้น", description: "รายละเอียด", users: "ผู้ใช้", machines: "เครื่องจักร", checkpointType: "ประเภทจุดตรวจวัด",
};
const keyOf = (n: { kind: Kind; id: number }) => `${n.kind}:${n.id}`;

/** Keeps nodes that match, plus every ancestor of a match. */
function filterTree(nodes: TreeNode[], q: string, status: string): TreeNode[] {
  const needle = q.trim().toLowerCase();
  const hit = (n: TreeNode) => (!needle || `${n.code} ${n.name}`.toLowerCase().includes(needle)) && (!status || n.status === status);
  return nodes.flatMap((n) => {
    const children = filterTree(n.children, q, status);
    return hit(n) || children.length ? [{ ...n, children }] : [];
  });
}

export function StructureView({ nodes }: { nodes: TreeNode[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  // Factories and buildings start expanded so the first view shows departments.
  const [open, setOpen] = useState<Set<string>>(() => new Set(nodes.flatMap((f) => [keyOf(f), ...f.children.map(keyOf)])));
  const [selectedKey, setSelectedKey] = useState<string | null>(nodes[0] ? keyOf(nodes[0]) : null);
  const [form, setForm] = useState<{ kind: Editable; parentId: number; node?: TreeNode } | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const del = useAction(deleteStructureNode, { success: (r) => r.message });

  const shown = useMemo(() => filterTree(nodes, q, status), [nodes, q, status]);
  const filtering = q.trim() !== "" || status !== "";
  const index = useMemo(() => {
    const m = new Map<string, { node: TreeNode; path: TreeNode[] }>();
    const walk = (xs: TreeNode[], path: TreeNode[]) => xs.forEach((n) => { m.set(keyOf(n), { node: n, path }); walk(n.children, [...path, n]); });
    walk(nodes, []);
    return m;
  }, [nodes]);
  const selected = selectedKey ? index.get(selectedKey) : undefined;

  const toggle = (k: string) => setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const countsOf = (n: TreeNode) => {
    const parts: string[] = [];
    const child = META[n.kind].child;
    if (child && n.children.length) parts.push(`${n.children.length} ${META[child].label}`);
    if (n.kind === "line" && Number(n.info.machines)) parts.push(`${n.info.machines} เครื่องจักร`);
    return parts;
  };

  const renderNode = (n: TreeNode, depth: number) => {
    const k = keyOf(n);
    const expanded = filtering || open.has(k);
    const Icon = META[n.kind].icon;
    const counts = countsOf(n);
    return (
      <li key={k} role="treeitem" aria-expanded={n.children.length ? expanded : undefined} aria-selected={selectedKey === k}>
        <div className={cn("group flex items-center gap-1 rounded-md pr-2 hover:bg-muted", selectedKey === k && "bg-accent text-accent-foreground")}>
          <button type="button" className={cn("flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground", !n.children.length && "invisible")} onClick={() => toggle(k)} aria-label={expanded ? "ยุบ" : "ขยาย"}>
            <ChevronRight className={cn("size-4 transition-transform motion-reduce:transition-none", expanded && "rotate-90")} />
          </button>
          <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm" onClick={() => setSelectedKey(k)}>
            <Icon className={cn("size-4 shrink-0", depth === 0 ? "text-primary" : "text-muted-foreground")} aria-hidden />
            <span className={cn("truncate", depth === 0 && "font-semibold", depth === 1 && "font-medium")}>{n.name}</span>
            <Nameplate className="shrink-0">{n.code}</Nameplate>
          </button>
          {counts.length > 0 && (
            <span className="hidden shrink-0 gap-3 text-xs text-muted-foreground tabular sm:flex">{counts.map((c) => <span key={c}>{c}</span>)}</span>
          )}
          {n.status !== "ACTIVE" && <Status map={RECORD_STATUS} value={n.status} />}
        </div>
        {expanded && n.children.length > 0 && (
          <ul role="group" className="ml-3.5 border-l pl-2">{n.children.map((c) => renderNode(c, depth + 1))}</ul>
        )}
      </li>
    );
  };

  if (nodes.length === 0)
    return <EmptyState icon={Factory} title="ยังไม่มีโรงงาน" description="เพิ่มโรงงานที่หน้า “โรงงาน” ก่อน แล้วกลับมาสร้างอาคาร แผนก และสายการผลิต" />;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="rounded-[10px] border bg-card p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหารหัสหรือชื่อ" aria-label="ค้นหารหัสหรือชื่อ" className="h-9 pl-8" />
          </div>
          <div className="w-40">
            <SelectField id="status-filter" name="status-filter" value={status || "ALL"} onChange={(v) => setStatus(v === "ALL" ? "" : v)}
              options={[{ value: "ALL", label: "ทุกสถานะ" }, ...STATUS_OPTIONS]} />
          </div>
        </div>
        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">ไม่พบรายการที่ตรงกับตัวกรอง</p>
        ) : (
          <ul role="tree" aria-label="โครงสร้างโรงงาน">{shown.map((n) => renderNode(n, 0))}</ul>
        )}
      </section>

      <aside className="h-fit rounded-[10px] border bg-card p-5 lg:sticky lg:top-20">
        {!selected ? (
          <p className="text-sm text-muted-foreground">เลือกรายการในโครงสร้างเพื่อดูรายละเอียด</p>
        ) : (
          <Inspector
            node={selected.node}
            path={selected.path}
            onAdd={(kind) => setForm({ kind, parentId: selected.node.id })}
            onEdit={() => setForm({ kind: selected.node.kind as Editable, parentId: selected.node.parentId!, node: selected.node })}
            onDelete={() =>
              setConfirm({
                title: `ลบ${META[selected.node.kind].label}`,
                description: `ลบ “${selected.node.name}” ถ้ามีข้อมูลเชื่อมโยงอยู่ ระบบจะปิดใช้งานแทนการลบ`,
                confirmLabel: "ลบ",
                destructive: true,
                run: async () => {
                  const r = await del.run({ kind: selected.node.kind, id: selected.node.id });
                  if (r.ok && r.data.mode === "DELETED") setSelectedKey(selected.path.length ? keyOf(selected.path[selected.path.length - 1]) : null);
                },
              })
            }
          />
        )}
      </aside>
      <NodeSheet key={form ? `${form.kind}:${form.node?.id ?? "new"}:${form.parentId}` : "none"} form={form} onClose={() => setForm(null)} />
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} pending={del.pending} />
    </div>
  );
}

function Inspector({ node, path, onAdd, onEdit, onDelete }: { node: TreeNode; path: TreeNode[]; onAdd: (k: Editable) => void; onEdit: () => void; onDelete: () => void }) {
  const meta = META[node.kind];
  const childKind = meta.child;
  return (
    <>
      {path.length > 0 && <p className="text-xs text-muted-foreground">{path.map((p) => p.name).join(" › ")}</p>}
      <div className="mt-1 flex items-start justify-between gap-2">
        <h2 className="font-semibold">{node.name}</h2>
        <Status map={RECORD_STATUS} value={node.status} />
      </div>
      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Nameplate>{node.code}</Nameplate>{meta.label}</p>
      <dl className="mt-4 divide-y border-y text-sm">
        {childKind && (
          <div className="flex justify-between gap-3 py-2"><dt className="text-muted-foreground">{META[childKind].label}</dt><dd className="tabular">{node.children.length}</dd></div>
        )}
        {Object.entries(node.info).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 py-2"><dt className="shrink-0 text-muted-foreground">{INFO_LABEL[k] ?? k}</dt><dd className="min-w-0 text-right">{v ?? "—"}</dd></div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        {childKind && <Button className="h-10" onClick={() => onAdd(childKind)}><Plus /> เพิ่ม{META[childKind].label}</Button>}
        {node.kind !== "factory" ? (
          <>
            <Button variant="outline" className="h-10" onClick={onEdit}><Pencil /> แก้ไข</Button>
            <Button variant="ghost" className="h-10 text-destructive" onClick={onDelete}><Trash2 /> ลบ</Button>
          </>
        ) : (
          <p className="w-full text-xs text-muted-foreground">แก้ไขข้อมูลโรงงานได้ที่หน้า “โรงงาน”</p>
        )}
      </div>
    </>
  );
}

const FORM: Record<Editable, { action: typeof saveBuilding; parent: string; code: string; name: string; extra?: [string, string, "text" | "number"][] }> = {
  building: { action: saveBuilding, parent: "factoryId", code: "buildingCode", name: "buildingName", extra: [["buildingType", "ประเภทอาคาร", "text"], ["floorCount", "จำนวนชั้น", "number"]] },
  department: { action: saveDepartment, parent: "buildingId", code: "departmentCode", name: "departmentName" },
  line: { action: saveLine, parent: "departmentId", code: "lineCode", name: "lineName" },
  checkpoint: { action: saveCheckpoint, parent: "lineId", code: "checkpointCode", name: "checkpointName", extra: [["checkpointType", "ประเภทจุดตรวจวัด", "text"]] },
};

function NodeSheet({ form, onClose }: { form: { kind: Editable; parentId: number; node?: TreeNode } | null; onClose: () => void }) {
  const cfg = FORM[form?.kind ?? "building"];
  const label = META[form?.kind ?? "building"].label;
  const n = form?.node;
  const { run, pending, errors } = useAction(cfg.action, { success: n ? "บันทึกการแก้ไขแล้ว" : `เพิ่ม${label}แล้ว` });
  return (
    <FormSheet
      open={form !== null}
      onOpenChange={(o) => !o && onClose()}
      title={n ? `แก้ไข${label}` : `เพิ่ม${label}`}
      pending={pending}
      onSubmit={async (fd) => {
        fd.set(cfg.parent, String(form!.parentId));
        if (n) fd.set("id", String(n.id));
        return (await run(fd)).ok;
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="n-code" label={`รหัส${label}`} error={errors[cfg.code]} hint="ไม่ซ้ำในระดับเดียวกัน" required>
          <Input id="n-code" name={cfg.code} defaultValue={n?.code} className="h-10" required />
        </Field>
        <Field id="n-name" label={`ชื่อ${label}`} error={errors[cfg.name]} required>
          <Input id="n-name" name={cfg.name} defaultValue={n?.name} className="h-10" required />
        </Field>
      </div>
      {cfg.extra?.map(([name, l, type]) => (
        <Field key={name} id={`n-${name}`} label={l} error={errors[name]}>
          <Input id={`n-${name}`} name={name} type={type} min={type === "number" ? 1 : undefined} defaultValue={n?.info[name] ?? ""} className="h-10" />
        </Field>
      ))}
      <Field id="n-description" label="รายละเอียด" error={errors.description}>
        <Textarea id="n-description" name="description" defaultValue={(n?.info.description as string) ?? ""} rows={3} maxLength={500} />
      </Field>
      <Field id="n-status" label="สถานะ">
        <SelectField id="n-status" name="status" defaultValue={n?.status ?? "ACTIVE"} options={STATUS_OPTIONS} />
      </Field>
    </FormSheet>
  );
}
