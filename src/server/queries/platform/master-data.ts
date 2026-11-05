import "server-only";
import { db } from "@/server/db";
import { bkkDay, fmtDate, startOfBkkDay } from "@/lib/time";

const bkkDate = (day: string) => fmtDate(startOfBkkDay(day));
import { fmtNum } from "@/lib/format";
import { factorUnitFor, isExpired } from "@/server/domain/emission-factor";
import type { MasterKind } from "@/components/platform/master-data/config";
import { oneOf, str, type SP } from "./common";

type Val = string | number | boolean | null;
export type MasterRow = {
  id: number;
  status: string;
  /** Values for the edit form, keyed by field name. */
  values: Record<string, Val>;
  /** Text for the table cells, keyed by column key. */
  display: Record<string, string>;
  refs: { label: string; count: number }[];
};
export type Option = { value: string; label: string };

/** DATE columns come back as UTC midnight, so the UTC day is the stored day. */
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

function filters(sp: SP) {
  const q = str(sp, "q");
  const status = oneOf(sp, "status", ["ACTIVE", "INACTIVE"] as const);
  return { q, status };
}

const simple = (id: number, code: string, name: string, description: string | null, status: string, refs: MasterRow["refs"]): MasterRow => ({
  id,
  status,
  values: { code, name, description },
  display: { code, name, description: description ?? "—" },
  refs,
});

export async function listMaster(kind: MasterKind, sp: SP): Promise<{ rows: MasterRow[]; options: Record<string, Option[]>; stats?: Record<string, number> }> {
  const { q, status } = filters(sp);
  const st = status ? { status } : {};
  switch (kind) {
    case "machine-types": {
      const rows = await db.machineType.findMany({
        where: { ...st, ...(q ? { OR: [{ machineTypeCode: { contains: q } }, { machineTypeName: { contains: q } }] } : {}) },
        orderBy: { machineTypeCode: "asc" },
        include: { _count: { select: { machines: true } } },
      });
      return { options: {}, rows: rows.map((r) => simple(r.machineTypeId, r.machineTypeCode, r.machineTypeName, r.description, r.status, [{ label: "เครื่องจักร", count: r._count.machines }])) };
    }
    case "sensor-types": {
      const rows = await db.sensorType.findMany({
        where: { ...st, ...(q ? { OR: [{ sensorTypeCode: { contains: q } }, { sensorTypeName: { contains: q } }] } : {}) },
        orderBy: { sensorTypeCode: "asc" },
        include: { _count: { select: { sensors: true } } },
      });
      return { options: {}, rows: rows.map((r) => simple(r.sensorTypeId, r.sensorTypeCode, r.sensorTypeName, r.description, r.status, [{ label: "เซนเซอร์", count: r._count.sensors }])) };
    }
    case "resource-categories": {
      const rows = await db.resourceCategory.findMany({
        where: { ...st, ...(q ? { OR: [{ categoryCode: { contains: q } }, { categoryName: { contains: q } }] } : {}) },
        orderBy: { categoryCode: "asc" },
        include: { _count: { select: { resourceTypes: true } } },
      });
      return { options: {}, rows: rows.map((r) => simple(r.categoryId, r.categoryCode, r.categoryName, r.description, r.status, [{ label: "ประเภททรัพยากร", count: r._count.resourceTypes }])) };
    }
    case "units": {
      const rows = await db.unit.findMany({
        where: { ...st, ...(q ? { OR: [{ unitCode: { contains: q } }, { unitName: { contains: q } }, { symbol: { contains: q } }, { unitType: { contains: q } }] } : {}) },
        orderBy: [{ unitType: "asc" }, { unitCode: "asc" }],
        include: { _count: { select: { resourceTypes: true, resourceUsages: true, sensorData: true, kpis: true } } },
      });
      return {
        options: {},
        rows: rows.map((r) => ({
          id: r.unitId,
          status: r.status,
          values: { code: r.unitCode, name: r.unitName, symbol: r.symbol, unitType: r.unitType },
          display: { code: r.unitCode, name: r.unitName, symbol: r.symbol, unitType: r.unitType },
          refs: [
            { label: "ประเภททรัพยากร", count: r._count.resourceTypes },
            { label: "รายการบันทึก", count: r._count.resourceUsages },
            { label: "ข้อมูลเซนเซอร์", count: r._count.sensorData },
            { label: "KPI", count: r._count.kpis },
          ],
        })),
      };
    }
    case "resource-types": {
      const [rows, categories, units] = await Promise.all([
        db.resourceTypeMaster.findMany({
          where: { ...st, ...(q ? { OR: [{ resourceCode: { contains: q } }, { resourceName: { contains: q } }] } : {}) },
          orderBy: { resourceCode: "asc" },
          include: {
            category: { select: { categoryName: true } },
            defaultUnit: { select: { symbol: true } },
            _count: { select: { emissionFactors: true, resourceUsages: true, kpis: true } },
          },
        }),
        db.resourceCategory.findMany({ where: { status: "ACTIVE" }, orderBy: { categoryName: "asc" }, select: { categoryId: true, categoryName: true } }),
        db.unit.findMany({ where: { status: "ACTIVE" }, orderBy: [{ unitType: "asc" }, { unitName: "asc" }], select: { unitId: true, unitName: true, symbol: true } }),
      ]);
      return {
        options: {
          categoryId: categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName })),
          defaultUnitId: units.map((u) => ({ value: String(u.unitId), label: `${u.unitName} (${u.symbol})` })),
        },
        rows: rows.map((r) => ({
          id: r.resourceTypeId,
          status: r.status,
          values: {
            code: r.resourceCode,
            name: r.resourceName,
            description: r.description,
            categoryId: String(r.categoryId),
            defaultUnitId: String(r.defaultUnitId),
            carbonCalculable: r.carbonCalculable,
          },
          display: { code: r.resourceCode, name: r.resourceName, category: r.category.categoryName, unit: r.defaultUnit.symbol, carbon: r.carbonCalculable ? "ใช่" : "ไม่" },
          refs: [
            { label: "Emission Factor", count: r._count.emissionFactors },
            { label: "รายการบันทึก", count: r._count.resourceUsages },
            { label: "KPI", count: r._count.kpis },
          ],
        })),
      };
    }
    case "emission-factors": {
      const today = bkkDay(new Date());
      const [rows, resources, all] = await Promise.all([
        db.emissionFactor.findMany({
          where: {
            ...st,
            ...(q ? { OR: [{ resourceType: { resourceName: { contains: q } } }, { resourceType: { resourceCode: { contains: q } } }, { source: { contains: q } }, { region: { contains: q } }] } : {}),
          },
          orderBy: [{ resourceTypeId: "asc" }, { effectiveDate: "desc" }],
          include: { resourceType: { select: { resourceName: true, resourceCode: true } }, _count: { select: { carbonResults: true } } },
        }),
        db.resourceTypeMaster.findMany({
          where: { status: "ACTIVE", carbonCalculable: true },
          orderBy: { resourceName: "asc" },
          select: { resourceTypeId: true, resourceName: true, defaultUnit: { select: { symbol: true } } },
        }),
        db.emissionFactor.findMany({ select: { status: true, expiryDate: true, _count: { select: { carbonResults: true } } } }),
      ]);
      return {
        options: {
          resourceTypeId: resources.map((r) => ({ value: String(r.resourceTypeId), label: `${r.resourceName} (${r.defaultUnit.symbol})` })),
          "resourceTypeId:autofill": resources.map((r) => ({ value: String(r.resourceTypeId), label: factorUnitFor(r.defaultUnit.symbol) })),
        },
        stats: {
          total: all.length,
          active: all.filter((f) => f.status === "ACTIVE").length,
          referenced: all.filter((f) => f._count.carbonResults > 0).length,
          expired: all.filter((f) => isExpired(day(f.expiryDate), today)).length,
        },
        rows: rows.map((r) => {
          const from = day(r.effectiveDate)!;
          const to = day(r.expiryDate);
          return {
            id: r.factorId,
            status: r.status,
            values: {
              resourceTypeId: String(r.resourceTypeId),
              scope: r.scope,
              region: r.region,
              factor: r.factor.toString(),
              factorUnit: r.factorUnit,
              effectiveDate: from,
              expiryDate: to,
              source: r.source,
            },
            display: {
              resource: r.resourceType.resourceName,
              scope: r.scope?.replace("SCOPE", "Scope") ?? "—",
              region: r.region ?? "—",
              factor: fmtNum(Number(r.factor), 4),
              factorUnit: r.factorUnit,
              period: `${bkkDate(from)} – ${to ? bkkDate(to) : "ปัจจุบัน"}${isExpired(to, today) ? " (หมดอายุ)" : ""}`,
              source: r.source ?? "—",
            },
            refs: [{ label: "ผลคำนวณคาร์บอน", count: r._count.carbonResults }],
          };
        }),
      };
    }
  }
}
