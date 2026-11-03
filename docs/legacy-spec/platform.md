# Legacy Spec — PLATFORM ADMIN module (condensed for the rewrite)

> Source: `/Users/teerathap/GreenFactory-legacy`. Most `/api/platform/*` routes had NO auth (live data leak). Platform admin signs in with `PLATFORM_ACCESS_CODE` as organization code and has no company.

## Nav
ภาพรวมระบบ · บริษัท · โรงงาน · ผู้ใช้งาน · บทบาทและสิทธิ์ · ข้อมูลมาตรฐาน (ประเภทเครื่องจักร, ประเภทเซนเซอร์, ประเภททรัพยากร, หมวดหมู่ทรัพยากร, หน่วยวัด, Emission Factor) · การดำเนินงานระบบ (Audit Log, Login Log, สำรองและกู้คืนข้อมูล, ตั้งค่าระบบ, คำร้องขอความช่วยเหลือ).

## Dashboard
- Cards: บริษัททั้งหมด, ผู้ใช้งานทั้งหมด (active), อัตราการใช้งาน %, จำนวนบทบาท. Users by role bar. Latest 5 companies. Recent activity (from audit log in rewrite). Recent logins (real LoginLog in rewrite; old showed newest users). System status must be real (DB ping) not hardcoded.

## Companies
- List: search (code, name, email, phone, province, industry, user names), industry, status ACTIVE (ใช้งานอยู่) / PENDING (รอตรวจสอบ) / SUSPENDED (ระงับใช้งาน); 8 per page; columns company (+email), code, industry, plan, factories, users, machines/sensors (real counts), status; actions view, suspend/activate, delete (409 with counts when referenced). Export CSV `greenfactory-companies.csv`.
- Create: code (UPPER, unique), name, email (lower, unique), phone, province, industry, plan TRIAL|STANDARD|ENTERPRISE, + first COMPANY_ADMIN user (rewrite: create the admin with the company — old form had contactName that was never saved). Defaults country Thailand, timezone Asia/Bangkok, currency THB, language th, carbonStandard TGO.
- Detail: header, counts (factories, buildings, users), info (email, phone, province, website, carbon standard, timezone, address), setup checklist (company info / main factory / users), factory cards. Rewrite adds edit form.
- Factory detail (read-only): info, coordinates, map link, 5-point checklist, buildings table. Platform admin does not see energy/carbon data.

## Factories (all companies)
- List with search, company, status ACTIVE/INACTIVE/SUSPENDED, counts (buildings, users, records). Create: company (ACTIVE), code, name, province, postalCode, phone, email, lat, lng, address, googleMapUrl. Old demo rule "1 company = 1 factory" — drop it.

## Users (all)
- Stats: total, active, suspended (LOCKED), inactive, new in 30 days. Filters: search, company, role, status. Columns: name, email, company, role, position/department, office/factory, registered, status.
- Create (old UI posted to a missing endpoint): firstName*, lastName*, username*, email*, phone, employeeCode, role*, status, company* (none for PLATFORM_ADMIN), factory, department, password* ≥ 8 + confirm.
- Rewrite adds: edit, suspend/activate, reset password, view login history.

## Roles & permissions
- Matrix: permission groups × roles, levels FULL (เข้าถึงและใช้งานได้) / VIEW (ดูอย่างเดียว) / NONE. Save via transaction. Old matrix was never enforced.
- Permission codes: OPERATION (DASHBOARD 10, CARBON_RESULT 20, KPI 30, ALERT 40, AI_RECOMMENDATION 50, REPORT_EXPORT 60), ORGANIZATION (COMPANY 110, USER 120, ROLE_PERMISSION 130, FACTORY 140, BUILDING 150, DEPARTMENT 160, PRODUCTION_LINE 170 — all *_MANAGEMENT), ASSET_IOT (MACHINE 210, SENSOR 220, QR_CODE 230, CHECKPOINT 240), ENVIRONMENT (RESOURCE_USAGE 310, RESOURCE_MASTER_DATA 320, EMISSION_FACTOR 330), GOVERNANCE (AUDIT_LOG 410, LOGIN_LOG 420, BACKUP_RESTORE 430, SYSTEM_SETTINGS 440).

## Master data (shared rules)
- Code trim + UPPER, `^[A-Z0-9_]+$`, ≤ 50. Name ≤ 150. Description ≤ 500. Duplicate ACTIVE code → 409; existing INACTIVE code → reactivate. Delete blocked (409) when referenced; suggest deactivating instead. Click status pill to toggle.
- Units: unitCode, unitName, symbol (≤30), unitType (Energy, Power, Volume, Mass, Temperature, Pressure, Ratio, Count, Time). symbol+type unique. Reference counts.
- Resource categories: code, name, description; count of resource types.
- Resource types: code, name, description, category*, default unit*, carbonCalculable. Counts of factors/usages.
- Machine types (24 seeded), sensor types (16 seeded): code, name, description; usage counts.
- Emission factors: resource type* (ACTIVE + carbonCalculable), scope (Scope 1/2/3), region (TH), source, factor ≥ 0, factorUnit (autofill `kgCO₂e/{symbol}`), effectiveDate*, expiryDate ≥ effective. Reject overlapping ACTIVE period for same resource+scope+region ("กรุณากำหนดวันสิ้นสุดของ Factor เดิมก่อน"). Delete blocked when carbon results reference it. Stats: total, active, referenced, expired.

## Audit log
- Rows: time, user (or System), role, action (CREATE/UPDATE/DELETE/LOGIN/RESTORE…), module (table), reference `table#id`, description, IP, user agent, old/new JSON. Filters: search, role, action, module; server-side pagination in rewrite; CSV `greenfactory-audit-log.csv`.
- Rewrite: write audit for every create/update/delete across all roles.

## Login log
- Rows: time, user/attempted email, role, company ("แพลตฟอร์มส่วนกลาง" for admin), status SUCCESS/FAILED, IP, OS, browser, device (Desktop/Mobile/Tablet from UA), reason (Thai text for failure codes). Summary: total, success, failed, success rate. CSV `greenfactory-login-log.csv`.

## Backups
- mysqldump `--single-transaction --quick --routines --triggers --events --hex-blob --set-gtid-purged=OFF --default-character-set=utf8mb4 --databases <db>`, password via MYSQL_PWD env, to `BACKUP_DIR/BKP{YYYYMMDD}-{HHmmss}.sql`. Restore = `mysql` with the file on stdin, requires typing RESTORE + reason, audit RESTORE. Download streams the file.
- BackupRecord: code, type MANUAL/AUTOMATIC, scope, storage LOCAL, file name/path/size, status RUNNING/COMPLETED/FAILED, verified, timings, created by, error, restoredAt/by.
- Old: verification was fake, Windows paths hardcoded, no scheduler. Rewrite: verify = file non-empty and ends with the dump-complete marker; mysqldump path from env; hide feature on hosts without mysqldump (e.g. Vercel) with a clear message.

## System settings (single row)
maintenanceMode, forceMfa, ipProtection, anomalyDetection, autoBlock, sessionTimeoutMinutes (60), maxLoginAttempts (5), auditRetentionDays (365), loginRetentionDays (180), backupFrequency DAILY|WEEKLY|MONTHLY, carbonAnalyticsEnabled, sensorMonitoringEnabled, aiRecommendationsEnabled, machineQrEnabled, reportBuilderEnabled, updatedBy. Old app saved them but nothing read them; old PUT was mass assignment. Rewrite: whitelist + validate, and actually use maintenanceMode, maxLoginAttempts, anomalyDetection, aiRecommendationsEnabled.

## Support tickets
- List (search ref/subject/category/priority/status), status select OPEN / IN_PROGRESS / RESOLVED / CLOSED. Tickets come from operator/company help forms; reference `SUP-YYYYMMDD-XXXXXX`.

## Old mock/hardcoded data to drop
roles/mock.ts (dead), company list zeros (machines, sensors, alerts, storage), user stats helper text, dashboard system status, settings health/service cards, backup service card and policy modal, login log location "ไม่ระบุ", buttons without handlers (user actions, add role, date filters, header search, notifications link).
