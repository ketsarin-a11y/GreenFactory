# Legacy Spec — OPERATOR module

> Source: `/Users/teerathap/GreenFactory-legacy`. Scope: `app/operator/**`, `app/scan/**`, `components/operator/**`, `app/api/operator/**`, `app/api/qr/**`, `app/api/records/**`, `app/api/uploads/**` and the lib files they use.
> This is what the OLD app does, including its bugs (§6). The rewrite keeps the behavior and fixes the bugs.

## 0. Session (shared)

- JWT HS256 (`jose`) in cookie `greenfactory_session` (httpOnly, sameSite=lax, secure in prod). Lifetime 8h, or 7d with rememberMe. Secret: `SESSION_SECRET`.
- Payload: `{ userId, email, roleName, companyId|null, companyCode|null, factoryId|null, firstName, lastName }`.
- Roles: `PLATFORM_ADMIN | COMPANY_ADMIN | MANAGER | OPERATOR`. OPERATOR lands on `/operator`.
- Operator layout: no session → `/login`. Other role → its own home (`/platform/dashboard`, `/company/dashboard`, `/manager/dashboard`, else `/`).

## 1. Pages

### 1.1 Shell
- Sidebar main: `/operator` ภาพรวมระบบ, `/operator/record` บันทึกข้อมูล, `/operator/scan` สแกน QR Code, `/operator/history` ประวัติการบันทึก. Other: `/operator/profile` โปรไฟล์ของฉัน, `/operator/help` ศูนย์ช่วยเหลือ.
- Header: live clock + Thai date. Greeting by hour: 05–11 สวัสดีตอนเช้า, 12–16 สวัสดีตอนบ่าย, 17–19 สวัสดีตอนเย็น, else สวัสดีรอบดึก. Profile dropdown with ออกจากระบบ.
- Logout: `POST /api/auth/logout` marks latest LoginLog as logged out, clears cookie.
- Old mocks: bell badge hardcoded 3; "ระบบพร้อมใช้งาน" box static.

### 1.2 `/operator` dashboard
- Quick actions: บันทึกการใช้ทรัพยากร → record; สแกน QR Code → scan.
- Live block polls `GET /api/operator/dashboard` every 5s (skip when tab hidden):
  - การบันทึกวันนี้: today's count, top 4 resource categories with counts. Empty: "ยังไม่มีการบันทึกวันนี้".
  - บันทึกล่าสุดของคุณ: last 5 own records (equipment, "line • department", date, status กำลังประมวลผล/บันทึกแล้ว). Empty: "ยังไม่มีรายการบันทึก".
- Tip: "บันทึกข้อมูลให้ถูกต้องและครบถ้วน เพื่อให้การวิเคราะห์และคำนวณคาร์บอนเป็นไปอย่างแม่นยำ".

### 1.3 `/operator/scan`
- Camera `getUserMedia({video:{facingMode:{ideal:"environment"}}})`, decode with jsQR (`inversionAttempts:"attemptBoth"`) per animation frame. Torch toggle when supported. Fallback: pick an image file.
- Camera errors by name: NotAllowedError, NotFoundError, NotReadableError, other.
- Decoded text: if URL path matches `^/scan/([^/?#]+)/?$` → go to `/scan/<token>`. Legacy: match machineCode case-insensitively → record page. Else "ไม่พบข้อมูล QR Code".

### 1.4 `/scan/[token]` (outside operator layout)
- Calls `GET /api/qr/scan/<token>`. 401 → `/login?returnTo=/scan/<token>` (login accepts returnTo only if it starts with `/scan/` and not `//`). 403 → "บัญชีนี้ไม่มีสิทธิ์เข้าถึง QR Code ของโรงงานนี้".
- Success card: "Verified QR", target type MACHINE/CHECKPOINT, name, code, status pill (NORMAL/ACTIVE = สถานะปกติ), scan id, factory/building/department/line, buttons: บันทึกการใช้ทรัพยากร → `/operator/record?machineId=<id>&scanId=<scanId>` (or `checkpointId`), กลับหน้าหลัก, สแกนอีกครั้ง.
- Error card: "ใช้ QR Code นี้ไม่ได้" with retry and back-to-scan.

### 1.5 `/operator/record`
- Params: `machineId`, `scanId`, (legacy `equipment`, `category`). Old app ignored `checkpointId` (bug).
- Today summary: up to 4 resource totals (label, total th-TH, unit).
- Step 1 choose machine: QR flow locks machine and shows banner "เครื่องจักรถูกเลือกจาก QR Code / Scan ID". Otherwise searchable grid (name, code, type, line, department, building, factory), 6 per page.
- Form: ประเภททรัพยากร (select "resourceName — categoryName"), หน่วยวัด read-only (default unit of resource type), ปริมาณการใช้ (number > 0, step 0.01), วันที่ + เวลา, ผู้บันทึก (current user), หมายเหตุ (≤1000 chars with counter), หลักฐาน (1 file, jpeg/png/pdf, ≤10MB). Buttons ล้างข้อมูล / ตรวจสอบข้อมูล.
- Validation messages: "กรุณาเลือกเครื่องจักร", "กรุณาเลือกประเภททรัพยากร", "ปริมาณการใช้ทรัพยากรต้องมากกว่า 0", "กรุณาระบุวันที่และเวลา".
- Review step "ตรวจสอบก่อนบันทึก" then ยืนยันและบันทึก: upload file, `POST /api/records`, success "บันทึกเรียบร้อย • <usageReference>", go to history.

### 1.6 `/operator/history`
- Old: loaded ALL company records, filtered on client (bug: no pagination).
- Filters: date from (default 1st of month) / to (default today), resource type, production line, department, unit, recorder (own name suffixed " (คุณ)"), search "ชื่อ รหัส หรือ USG-...". Shows "พบ N รายการ".
- Metric cards: รายการทั้งหมด, บันทึกผ่าน QR, มีหลักฐาน.
- Table: วันที่และเวลา, เครื่องจักร / จุดตรวจ, ตำแหน่ง, ทรัพยากร, ปริมาณ, ผู้บันทึก, QR, หลักฐาน, actions (detail, delete own only).
- Delete modal "ลบรายการบันทึกนี้?" → soft delete (status INACTIVE).
- Export CSV with BOM: `Reference,DateTime,Machine/Checkpoint,Code,Resource,Quantity,Unit,Recorder,QR Scan ID,Evidence,Remark`, file `resource-usage-history-YYYY-MM-DD.csv`.

### 1.7 `/operator/profile`
- Avatar upload (jpeg/png/webp ≤5MB).
- Editable: ชื่อ, นามสกุล, เบอร์โทรศัพท์. Read-only: username, email, รหัสพนักงาน, ตำแหน่ง, บริษัท, เข้าสู่ระบบล่าสุด, สร้างบัญชีเมื่อ.
- Change password: current/new/confirm; rules: all required, new == confirm, ≥8 chars, new ≠ current, verify current.

### 1.8 `/operator/help`
- Static guides (บันทึกด้วย QR, บันทึกแบบเลือกเครื่อง, ตรวจสอบประวัติ) and FAQ with category tabs and search.
- แจ้งปัญหา modal: subject, category `GENERAL|RECORD|ACCOUNT|HISTORY|SYSTEM` (ทั่วไป/การบันทึกข้อมูล/บัญชีผู้ใช้/ประวัติการบันทึก/ระบบผิดปกติ), priority `LOW|NORMAL|HIGH|URGENT` (ต่ำ/ปกติ/สูง/เร่งด่วน, default NORMAL), pageUrl, description → `SupportTicket`, reference `SUP-YYYYMMDD-XXXXXX`.

## 2. API rules worth keeping

### QR scan
- Token = `crypto.randomUUID()` in `QRCode.qrToken`; image encodes `${APP_URL}/scan/<token>`. `qrStatus ∈ ACTIVE|SUSPENDED|REVOKED`; only ACTIVE scans.
- Errors: 400 bad token, 404 "ไม่พบ QR Code นี้ในระบบ หรือ QR Code ถูกระงับ/ยกเลิกแล้ว", 422 not bound, 403 other company/factory.
- Success writes `QRScanLog { qrId, userId, scanResult:"SUCCESS", ipAddress, userAgent }` and returns `scanId` + target + organization.

### Create resource usage
- Body `{ machineId? | checkpointId? (exactly one), resourceTypeId, unitId, quantity>0, usageAt ISO, qrScanId?, evidence?, remark≤1000 }`.
- Resource type must be ACTIVE with an ACTIVE default unit, and `unitId` must equal that default unit ("หน่วยวัดไม่ตรงกับประเภททรัพยากร").
- Machine/checkpoint must be ACTIVE and inside the user's company; org ids (factory, building, department, line) are resolved on the server, never trusted from the client.
- qrScanId must belong to this user and this target.
- `usageReference = "USG-" + Date.now() + "-" + 10 hex chars uppercase`.
- `scopeType` MACHINE|CHECKPOINT, `sourceType` QR|MANUAL, `processingStatus` PENDING → COMPLETED|FAILED, `status` ACTIVE|INACTIVE.
- After create: carbon engine, then anomaly engine.

### Carbon engine (`CARBON-V2`, unit `kgCO2e`)
- Skip if resource type `carbonCalculable=false` (`RESOURCE_NOT_CARBON_CALCULABLE`).
- Factor: same resource type, ACTIVE, `effectiveDate <= usageAt`, `expiryDate` null or `>= usageAt`, region `TH` preferred over null; latest effective first. None → `NO_ACTIVE_EMISSION_FACTOR`.
- Unit check: normalized unit symbol must equal the part after the last "/" of `factorUnit` (lowercase, no spaces, ₂→2, ³→3). Else `INCOMPATIBLE_FACTOR_UNIT`.
- `carbonValue = quantity × factor`, scope = factor scope or UNKNOWN. Idempotent per usage.

### Anomaly engine
- History: same company, resource type and target, earlier than this usage, last 30; needs ≥3; mean > 0.
- `dev% = (cur-avg)/avg*100`, `z = (cur-avg)/sd` (population sd; null if 0).
- Anomaly if history < 5: `|dev| >= 60`; else `|dev| >= 30 && |z| >= 2`.
- Severity: `|dev|>=100 || |z|>=4` CRITICAL; `>=50 || >=3` HIGH; else MEDIUM.
- `alertCode = "ANOM-<usageId>-<SPIKE|DROP>"`, `alertType RESOURCE_USAGE_SPIKE|DROP`, status OPEN, threshold = avg, actual = cur. Plus an `AIRecommendation` (type ANOMALY_RESPONSE, priority CRITICAL=1/HIGH=2/MEDIUM=3, reviewStatus PENDING).

### Upload
- jpeg/png/pdf ≤10MB, stored under `public/uploads/records/` (public, ext from client — fix).

### Help ticket, profile, password — see §1.7–1.8.

## 3. Resource icons
ELECTRICITY zap, WATER droplet, DI_WATER droplets, CHILLED_WATER snowflake, COMPRESSED_AIR wind, NITROGEN atom, GAS/LPG flame, STEAM waves, DIESEL fuel.

## 6. Legacy bugs to fix in the rewrite
1. Checkpoint QR unusable (record page ignores `checkpointId`).
2. Timezone: default dates used UTC; "today" used server tz. Use Asia/Bangkok everywhere.
3. scanId never expires and can be reused; record API did not check factory.
4. Evidence path not verified; uploads public; orphan files on failure.
5. Engines run synchronously; response returned stale PENDING.
6. Soft delete left carbon results and alerts active; no audit log.
7. History loaded the whole company without pagination.
8. Machine list scoped by company, not the operator's factory.
9. Dead code: `/api/operator/readings`, `/api/operator/machines/[id]` (no auth, `factory_id = 3` hardcoded), a page inside `app/api/`.
