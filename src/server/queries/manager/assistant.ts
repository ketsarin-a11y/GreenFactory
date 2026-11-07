import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { ownedWhere } from "@/server/scope";
import { addDays, bkkDay } from "@/lib/time";
import { anomalyBand, dailyTotals, dayList, pctChange, previousRange, sumByResourceUnit } from "@/server/domain/analytics";
import { kpiWhere, defaultEndDay, loadUsageRows, sortGroups, loadPreviousRows } from "./common";
import { factoryLabel } from "@/server/queries/context";

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Compact, tenant-scoped facts for G-FAY. Only the manager's own factory. */
export async function assistantContext(user: CurrentUser) {
  const to = await defaultEndDay(user);
  const from = addDays(to, -29);
  const prev = previousRange(from, to);
  const [rows, prevRows, alerts, kpis, recs, factory] = await Promise.all([
    loadUsageRows(user, from, to),
    loadPreviousRows(user, prev),
    db.alert.findMany({
      where: { ...ownedWhere(user), status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      orderBy: { triggeredAt: "desc" },
      take: 15,
      select: { title: true, message: true, severity: true, status: true, triggeredAt: true, actualValue: true, thresholdValue: true, machine: { select: { machineName: true } } },
    }),
    db.kPI.findMany({
      where: { ...kpiWhere(user), status: "ACTIVE" },
      select: { kpiName: true, targetValue: true, targetOperator: true, periodType: true, unit: { select: { symbol: true } }, results: { orderBy: { periodEnd: "desc" }, take: 1 } },
    }),
    db.aIRecommendation.findMany({ where: { ...ownedWhere(user), status: "ACTIVE", alert: { status: { in: ["OPEN", "ACKNOWLEDGED"] } } }, orderBy: { priority: "asc" }, take: 8, select: { title: true, description: true } }),
    factoryLabel(user),
  ]);

  const prevBy = new Map(sumByResourceUnit(prevRows).map((g) => [g.key, g.total]));
  const resources = sortGroups(sumByResourceUnit(rows)).map((g) => ({
    resource: g.resourceName, code: g.resourceCode, unit: g.unit, total: r2(g.total), records: g.count,
    previousTotal: r2(prevBy.get(g.key) ?? 0), changePct: pctChange(g.total, prevBy.get(g.key) ?? 0),
  }));
  const elec = rows.filter((r) => r.resourceCode === "ELECTRICITY" && r.unit === "kWh");
  const band = anomalyBand(dayList(from, to), dailyTotals(elec, "kWh"));
  const byMachine = new Map<string, number>();
  for (const r of elec) byMachine.set(r.target, (byMachine.get(r.target) ?? 0) + r.quantity);
  const elecTotal = elec.reduce((a, r) => a + r.quantity, 0);
  const carbonKg = rows.reduce((a, r) => a + (r.carbon?.kg ?? 0), 0);
  const scope = new Map<string, number>(), cres = new Map<string, number>();
  for (const r of rows) if (r.carbon) {
    scope.set(r.carbon.scope, (scope.get(r.carbon.scope) ?? 0) + r.carbon.kg);
    cres.set(r.resourceName, (cres.get(r.resourceName) ?? 0) + r.carbon.kg);
  }

  return {
    factory: factory.primary,
    period: { from, to, days: 30, previous: prev, timezone: "Asia/Bangkok" },
    records: rows.length,
    resources,
    electricity: {
      unit: "kWh",
      dailyMean: r2(band.mean),
      dailySd: r2(band.sd),
      normalBand: [r2(band.lower), r2(band.upper)],
      anomalyDays: band.points.filter((p) => p.anomaly).map((p) => ({ day: p.day, value: r2(p.value!), z: r2(p.z!) })),
      topMachines: [...byMachine.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([machine, kwh]) => ({ machine, kWh: r2(kwh), sharePct: elecTotal ? r2((kwh / elecTotal) * 100) : 0 })),
    },
    carbon: {
      unit: "kgCO2e",
      totalKg: r2(carbonKg),
      previousTotalKg: r2(prevRows.reduce((a, r) => a + (r.carbon?.kg ?? 0), 0)),
      byScope: Object.fromEntries([...scope].map(([k, v]) => [k, r2(v)])),
      byResource: Object.fromEntries([...cres].map(([k, v]) => [k, r2(v)])),
      note: "ค่าประมาณจาก Emission Factor ตัวอย่าง ยังไม่ผ่านการทวนสอบ",
    },
    openAlerts: alerts.map((a) => ({
      title: a.title, severity: a.severity, status: a.status, at: bkkDay(a.triggeredAt), machine: a.machine?.machineName ?? null,
      actual: a.actualValue === null ? null : r2(Number(a.actualValue)), baselineMean: a.thresholdValue === null ? null : r2(Number(a.thresholdValue)),
    })),
    recommendations: recs.map((r) => r.title),
    kpis: kpis.map((k) => ({
      name: k.kpiName, period: k.periodType, target: `${k.targetOperator} ${Number(k.targetValue)} ${k.unit.symbol}`,
      latest: k.results[0] ? { start: bkkDay(k.results[0].periodStart), end: bkkDay(k.results[0].periodEnd), actual: r2(Number(k.results[0].actualValue)), status: k.results[0].resultStatus } : null,
    })),
  };
}
export type AssistantContext = Awaited<ReturnType<typeof assistantContext>>;

/** Follow-up questions built from the facts (same input → same questions), most specific first. */
export function followUps(ctx: AssistantContext): string[] {
  const out: string[] = [];
  const alert = ctx.openAlerts[0];
  if (alert) out.push(`การแจ้งเตือน "${alert.title}" ควรตรวจอะไรต่อ?`);
  const moved = ctx.resources.filter((r) => r.changePct !== null).sort((a, b) => Math.abs(b.changePct!) - Math.abs(a.changePct!))[0];
  if (moved && Math.abs(moved.changePct!) >= 2) out.push(`${moved.resource} (${moved.unit}) ${moved.changePct! > 0 ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(moved.changePct!).toLocaleString("th-TH", { maximumFractionDigits: 1 })}% มาจากไหน?`);
  const top = ctx.electricity.topMachines[0];
  if (top) out.push(`${top.machine} ใช้ไฟ ${Math.round(top.sharePct)}% ของโรงงาน ลดได้อย่างไร?`);
  const day = ctx.electricity.anomalyDays[0];
  if (day) out.push(`วันที่ ${day.day} ไฟฟ้าผิดปกติหรือไม่?`);
  const failed = ctx.kpis.find((k) => k.latest?.status === "FAIL");
  if (failed) out.push(`KPI ${failed.name} ไม่ผ่านเป้า ควรทำอะไร?`);
  if (ctx.carbon.totalKg > 0) out.push("คาร์บอน 30 วันล่าสุดมาจากแหล่งไหนมากที่สุด?");
  return out;
}

export type ChatMessage = { role: "user" | "assistant"; content: string; at: string };
export type Conversation = { id: string; title: string; updatedAt: string; messages: ChatMessage[] };

export async function loadConversations(user: CurrentUser): Promise<Conversation[]> {
  const row = await db.managerChatHistory.findUnique({ where: { userId_companyId: { userId: user.id, companyId: user.companyId! } } });
  const t = (row?.transcript ?? {}) as { conversations?: Conversation[] };
  return Array.isArray(t.conversations) ? t.conversations : [];
}

const n = (v: number) => v.toLocaleString("th-TH", { maximumFractionDigits: v >= 100 ? 0 : 2 });
const pct = (v: number | null) => (v === null ? "ไม่มีข้อมูลเทียบ" : `${v > 0 ? "+" : ""}${v.toLocaleString("th-TH", { maximumFractionDigits: 1 })}%`);
const kg = (v: number) => (v >= 1000 ? `${n(v / 1000)} tCO₂e` : `${n(v)} kgCO₂e`);

/** Deterministic answer from the same facts, used when no Claude API key is configured. */
export function fallbackAnswer(ctx: AssistantContext, question: string) {
  const q = question.toLowerCase();
  const has = (...w: string[]) => w.some((x) => q.includes(x));
  const p = ctx.period;
  const out: string[] = [`**สรุป** (${p.from} ถึง ${p.to}, ${ctx.factory})`];
  if (!ctx.records) return `${out[0]}\n\nยังไม่มีข้อมูลการใช้ทรัพยากรในช่วงนี้ จึงยังสรุปไม่ได้\n\nหมายเหตุ: ยังไม่ได้เปิดใช้ AI (ต้องมี ANTHROPIC_API_KEY และผู้ดูแลแพลตฟอร์มเปิด AI Recommendations) คำตอบนี้สร้างจากข้อมูลในระบบโดยตรง`;
  const e = ctx.electricity;

  if (has("carbon", "คาร์บอน", "co2")) {
    out.push(`คาร์บอนรวม ${kg(ctx.carbon.totalKg)} (${pct(pctOf(ctx.carbon.totalKg, ctx.carbon.previousTotalKg))} เทียบ 30 วันก่อนหน้า)`);
    out.push("**ข้อเท็จจริง**", ...Object.entries(ctx.carbon.byResource).sort((a, b) => b[1] - a[1]).map(([r, v]) => `- ${r}: ${kg(v)}`));
    out.push(...Object.entries(ctx.carbon.byScope).map(([s, v]) => `- ${s}: ${kg(v)}`));
    out.push(`หมายเหตุ: ${ctx.carbon.note}`);
  } else if (has("เครื่อง", "machine", "สัดส่วน")) {
    out.push("เครื่องจักรที่ใช้ไฟฟ้ามากที่สุด (kWh):", ...e.topMachines.map((m, i) => `${i + 1}. ${m.machine}: ${n(m.kWh)} kWh (${n(m.sharePct)}%)`));
  } else if (has("ผิดปกติ", "แจ้งเตือน", "alert", "anomal")) {
    out.push(`ไฟฟ้ารายวันเฉลี่ย ${n(e.dailyMean)} kWh ช่วงปกติ ${n(e.normalBand[0])}–${n(e.normalBand[1])} kWh`);
    out.push(e.anomalyDays.length ? `**ความผิดปกติ**\n${e.anomalyDays.map((d) => `- ${d.day}: ${n(d.value)} kWh (z = ${d.z})`).join("\n")}` : "ไม่พบวันที่ยอดไฟฟ้ารวมอยู่นอกช่วงปกติ");
    if (ctx.openAlerts.length) out.push(`**การแจ้งเตือนที่ยังไม่ปิด ${ctx.openAlerts.length} รายการ**`, ...ctx.openAlerts.slice(0, 5).map((a) => `- [${a.severity}] ${a.title} (${a.at})`));
    out.push("ข้อมูลปัจจุบันยังไม่เพียงพอที่จะยืนยันสาเหตุโดยตรง ควรตรวจสอบหน้างานและแผนการผลิตของวันดังกล่าว");
  } else if (has("kpi", "เป้า")) {
    out.push(...ctx.kpis.map((k) => `- ${k.name} (เป้า ${k.target}): ${k.latest ? `${n(k.latest.actual)} งวด ${k.latest.start}–${k.latest.end} ${k.latest.status === "PASS" ? "ผ่านเป้า" : "ไม่ผ่านเป้า"}` : "ยังไม่มีผล"}`));
  } else {
    out.push("**ข้อเท็จจริง** (ยอดรวมแยกตามหน่วย ไม่รวมข้ามหน่วย)", ...ctx.resources.map((r) => `- ${r.resource}: ${n(r.total)} ${r.unit} (${pct(r.changePct)})`));
    out.push(`- คาร์บอน: ${kg(ctx.carbon.totalKg)}`);
    out.push(`- วันที่ไฟฟ้าผิดปกติ: ${e.anomalyDays.length} วัน`, `- การแจ้งเตือนค้าง: ${ctx.openAlerts.length} รายการ`);
    if (e.topMachines[0]) out.push(`- ใช้ไฟมากที่สุด: ${e.topMachines[0].machine} (${n(e.topMachines[0].sharePct)}%)`);
  }
  out.push("", "หมายเหตุ: ยังไม่ได้เปิดใช้ AI (ต้องมี ANTHROPIC_API_KEY และผู้ดูแลแพลตฟอร์มเปิด AI Recommendations) คำตอบนี้สร้างจากข้อมูลในระบบโดยตรง");
  return out.join("\n");
}
const pctOf = (cur: number, prev: number) => pctChange(cur, prev);
