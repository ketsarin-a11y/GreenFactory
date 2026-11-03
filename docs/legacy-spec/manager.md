# Legacy Spec — MANAGER module (condensed for the rewrite)

> Source: `/Users/teerathap/GreenFactory-legacy`. Activity data = `ResourceUsage` with status ACTIVE. All dates Asia/Bangkok (+07:00) — the old app mixed UTC/local (bug).

## Nav
Home `/manager` · Analytics: Resource Analytics, Carbon Intelligence, Performance & KPI, Compare · Operations: Machines · Alerts · Reports · AI (G-FAY) · History · Profile. Bell polls alerts (OPEN/ACK), acknowledge one / all.

## Home `/manager`
- Range `?from&to` (YYYY-MM-DD, +07). Default: 7 days ending at the latest day that has data ("แสดง 7 วันล่าสุดที่มีข้อมูล").
- KPI cards: พลังงานไฟฟ้า (kWh, Δ% vs previous equal-length period), คาร์บอน (kgCO₂e, ≥1000 → tCO₂e), เครื่องจักร (ACTIVE count, + resource type count), สัญญาณผิดปกติ (days with electricity |z| ≥ 2).
- Resource cards (priority ELECTRICITY, WATER, COMPRESSED_AIR, NATURAL_GAS, NITROGEN, DIESEL; max 6): total, unit, record count. Footer: data quality %, total records, resource types, QR count (QR share %), manual count.
- Recent 5 records → history. "คุยกับ G-FAY สรุปภาพรวม".

## Shared formulas
- Previous period: same number of days immediately before `from`.
- pctChange = prev == 0 ? null (show "—") : round1((cur − prev) / prev × 100). (old app returned 100/0 or "null%")
- Data quality = round(Σ[machineId, departmentId, buildingId, unit, resource present] / (n × 5) × 100).
- Daily anomaly band (dashboard/analytics): daily totals; μ, population σ over days with data; upper = μ+2σ, lower = max(0, μ−2σ); z = (x−μ)/σ (σ=0 → 0); anomaly |z| ≥ 2.
- Never sum quantities across different units (old bug).

## Resource Analytics `/manager/overview`
- Filters: from/to, building → department → line → machine (cascade). Metric switcher:
  energy ELECTRICITY kWh · water (WATER, DI_WATER, CHILLED_WATER, TAP_WATER…) m³ · compressed air m³ · gas m³ · steam kg · nitrogen m³ · diesel L.
- Panels: daily trend line + μ±2σ band + anomaly dots; breakdown by department (value, %); statistics (avg/min/max/σ/anomaly days/max |z|).
- Forecast 7 days: last ≤14 daily points (≥3), OLS on index; predicted = max(0, a + b·(n−1+step)); band ±1.96·σ_res·√(1+step/n); next7Total vs mean(last 7)×7 → Δ%; confidence = round(clamp(95 − min(1, σres/ȳ)·55, 55, 95)).
- Smart findings per metric: Δ% ≥ 25 attention, ≥ 10 watch; top department ≥ 60% concentration (≥ 75 attention); anomaly days → attention. Max 4, else "ยังไม่พบสัญญาณผิดปกติ".
- Click a day → evidence drawer: observed, μ, σ, z, top contributing machines (total, %, records), records; conclusion text; "ถาม G-FAY".

## Carbon Intelligence `/manager/overview/carbon`
- Total kgCO₂e (≈ tCO₂e), top source + its scope, Δ% vs previous period (only if previous has data).
- Per resource formula card: activity (Σ quantity unit) × emission factor (factor unit, "หลายค่า" if mixed) = carbon; factor source.
- Scope distribution (normalize SCOPE_1/"Scope 1"/scope-1 → Scope 1/2/3) and hotspots by resource. Presets 7/30 days.
- Disclaimer: emission factors are estimates, not audited.

## Performance & KPI `/manager/overview/oee`
- Resource cards (electricity, water, compressed air, nitrogen): total, Δ%, down/stable/up counts.
- KPI: definitions active in range with results. Summary: total results, PASS, FAIL, pass rate. Gauge per KPI (latest result). Results table: date, KPI, actual, target (operator), variance, achievement, status.
- KPI calculation (old code never ran it — rewrite must): actual = Σ quantity of the KPI's resource type + unit within KPI scope (factory/building/department/line/machine) per period (DAILY default, WEEKLY Mon–Sun, MONTHLY, QUARTERLY, YEARLY). variance = actual − target. Operators `<=`/LTE, `>=`/GTE, `<`/LT, `>`/GT, `=`/EQ. Achievement: `<=`,`<`: a=0 ? 100 : t/a×100; `>=`,`>`: t=0 ? 100 : a/t×100; `=`: max(0,(1−|a−t|/|t|)×100). PASS/FAIL by operator. Upsert KPIResult(kpiId, periodStart, periodEnd).
- No real OEE exists. Don't call it OEE.

## Compare `/manager/overview/compare`
- Current vs previous period for 7 resources: previous, current, Δ%, movement bar, signal; counts down/up/unchanged; biggest change.

## Machines `/manager/overview/equipment` and `/[machineId]`
- List: ACTIVE machines with sensor/QR/usage/open-alert counts, latest usage, open-alert badge. Summary: total, with sensor (coverage %), with QR, with open alert, no data yet.
- operationalStatus: NORMAL ปกติ, WARNING เฝ้าระวัง, MAINTENANCE บำรุงรักษา, STOPPED/OFFLINE ไม่พร้อมใช้งาน, ERROR/CRITICAL ผิดปกติ.
- Detail: identity + location, sensor/QR/alert/usage counts, 12 recent usages, sensors with latest reading, QR codes, 8 recent alerts.

## Alerts `/manager/alerts`
- Tabs: ทั้งหมด / เปิดอยู่ / Critical / High / Medium / ปิดแล้ว. Search title/message/code/location/machine. Summary open/critical/resolved.
- Detail: actual vs baseline (old app stored mean as "threshold"), Δ, location, machine link, linked recommendation.
- Lifecycle OPEN → ACKNOWLEDGED → RESOLVED (rewrite adds resolve + who did it).

## History `/manager/history`
- Server-side pagination 20/page; filters from/to, q (reference, machine, department, building, resource), source QR|MANUAL. Columns: date time, machine/location, resource, quantity, source, processing status, reference.

## Reports `/manager/reports`
- Report history (12 latest): name, status, format, type, downloads, period, download link.
- Create: from/to (default last 30 days), format XLSX | PDF | CSV. Generates a stored Report row; download regenerates from filterScope.
- CSV columns: Reference, Date Time (Bangkok), Resource Code, Resource Name, Quantity, Unit, Machine Code, Machine Name, Building, Department, Production Line, Source, Processing Status, Remark. BOM + CRLF.
- XLSX sheets: Executive Summary (records, machines with data, resource types, QR vs manual, top resources, top machines — per unit), Resource Summary, Machine Summary, Raw Data. Carbon sheet with disclaimer.
- PDF: summary, top resources/machines, carbon by resource, disclaimer, page footer "หน้า x จาก n" (Thai font required).

## AI assistant G-FAY `/manager/ai` + drawer
- Old provider: Google Gemini (JSON output) with deterministic fallback when no key. Rewrite: Claude API (Anthropic SDK), same deterministic fallback.
- Context given: 7-day (or page range) dashboard summary, resources, energy intelligence, carbon totals/breakdown/scope, open alerts (15), recommendations (8), recent records, methodology. Intent-specific compact context.
- System rules: answer in Thai, never invent numbers, don't claim root cause from an anomaly, don't add different units, say "ข้อมูลปัจจุบันยังไม่เพียงพอที่จะยืนยันสาเหตุโดยตรง" when evidence is missing, carbon is not audited. Sections: สรุป / ข้อเท็จจริง / การคำนวณ / ความผิดปกติ / ข้อสันนิษฐาน / คำแนะนำ / ควรตรวจต่อ. Returns answer + up to 3 follow-up questions.
- Suggested prompts: "สรุปสถานการณ์โรงงาน 7 วันล่าสุด", "มีอะไรผิดปกติในการใช้ไฟฟ้า?", "เครื่องไหนมีสัดส่วนการใช้ไฟสูงสุด?", "สรุป Carbon Footprint ล่าสุด".
- History: ManagerChatHistory (one row per user+company, JSON transcript with conversations: id, title (first user message ≤ 80), updatedAt, messages). Image attachments optional (jpeg/png/webp).
- G-Fay mascot: white 3D robot with glowing green face screen and a leaf (public/images/g-fay.gif).

## Old mock data to NOT port
MOCK_WASTE/CARBON/OEE/AQI/FACILITIES/SCOPE_CARBON/KPI_RATIOS/ALERTS/NEWS in Managerdashboardpage.tsx, MOCK_REPORT_HISTORY in ReportsPage.tsx, factory-layout placeholder, OEE simulator defaults, orphan overview/*.tsx files.

## Legacy bugs to fix
Timezone mix; oee page lacked role check; "gas" metric was compressed air; cross-unit sums; line filter dropped checkpoint usages; anomaly ignored unit; notifications missing fields and no resolve; KPIResult never written; whole-table loads; CarbonResult not unique per usage; error responses with HTTP 200.
