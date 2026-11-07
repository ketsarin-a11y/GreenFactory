# Legacy Spec — COMPANY ADMIN module

> Source: `/Users/teerathap/GreenFactory-legacy`. Scope: `app/company/**`, `components/company/**`, `app/api/company/**`, `app/api/organization/**`, `app/api/master-data/**`.
> 7 pages had real data (dashboard, factories, structure, machines, sensors, users, profile). 5 were mock (settings, roles, reports, help, resource-usage in localStorage). The rewrite makes all of them real.

## 0. Shared
- Guard: session, role COMPANY_ADMIN, companyId set, Company.status ACTIVE.
- Nav groups: ภาพรวม (แดชบอร์ด) · จัดการองค์กร (ข้อมูลบริษัท, โรงงาน, ผู้ใช้งาน) · ข้อมูลโรงงาน (เครื่องจักร, เซนเซอร์, QR Code) · การตั้งค่า (ตั้งค่าบริษัท). Add โครงสร้างโรงงาน, บทบาทและสิทธิ์, รายงาน, ศูนย์ช่วยเหลือ.
- Hierarchy: Company → Factory → Building → Department → ProductionLine → {Machine, Checkpoint}; Machine → {Sensor → SensorData, QRCode}; Checkpoint → QRCode.
- Unique codes: Factory(companyId, code), Building(factoryId, code), Department(buildingId, code), Line(departmentId, code), Machine(lineId, code), Checkpoint(lineId, code), Sensor(machineId, code). Codes are trimmed + uppercased. QR code unique per company (API check).
- Status strings ACTIVE | INACTIVE.
- Delete rule for building/department/line/machine/sensor: if anything references it → set INACTIVE ("มีข้อมูลเชื่อมโยง ระบบจึงปิดใช้งานแทนการลบ"); else hard delete. Factory: no delete, only toggle.
- Legacy security holes: `/api/organization/*` had no company scope (IDOR); 500 leaked error.message; no audit log.

## 1. Dashboard formulas (`pct(v,t)= t>0 ? round(v/t*100) : 0`)
- Per factory: structureScore = 100 if building+dept+line exist / 60 if only building / 20. readiness = round(structure×0.35 + pct(machinesWithSensor)×0.35 + pct(machinesWithQr)×0.30).
- Company: organizationScore 100 / 65 / 20; userScore = pct(active users); assetScore = pct(ACTIVE machines); sensorCoverage; qrCoverage. readiness = round(org×0.25 + user×0.20 + asset×0.20 + sensor×0.20 + qr×0.15), clamped 0–100.
- Stat cards: ผู้ใช้งานทั้งหมด, โรงงานในสังกัด, เครื่องจักรทั้งหมด, เซนเซอร์ IoT (use real connection status in rewrite).
- Governance: #Managers, #Operators, inactive accounts, users without factory.
- Factory coverage table; Setup attention links: เครื่องไม่มี Sensor, เครื่องไม่มี QR, ผู้ใช้ไม่มีโรงงาน, Operator ไม่มีแผนก. Recent 5 users.

## 2. Factories
- Cards: name, code, province/country (else "ยังไม่ระบุพื้นที่"), #buildings/departments/lines/users/machines/sensors, location chip, readiness. Summary: total, active, ready (readiness ≥ 75), users.
- readiness = % of 9 checks: code, name, address, province, phone||email, (lat&lng || googleMapUrl), buildings>0, departments>0, lines>0.
- Form: factoryCode*, factoryName*, address, province, postalCode, country (Thailand), latitude [-90,90], longitude [-180,180], googleMapUrl, phone, email (lowercased), timezone (Asia/Bangkok). mapZoom default 16.
- Errors: 400 "กรุณากรอกรหัสโรงงานและชื่อโรงงาน", 409 "รหัสโรงงานนี้มีอยู่ในบริษัทแล้ว".

## 3. Structure (โครงสร้างโรงงาน)
- Tree Factory > Building > Department > Line with search (keeps ancestors of matches) and status filter. Inspector per node. Summary: factories, buildings, departments, lines, machines.
- Building: factoryId*, code*, name*, buildingType, floorCount (int > 0), description, status.
- Department: buildingId*, code*, name*, description, status. Line: departmentId*, code*, name*, description, status. 409 on duplicate code in parent ("รหัสสายการผลิตนี้มีอยู่ในแผนกแล้ว").
- Rewrite adds Checkpoint management (no UI before).

## 4. Machines
- Stats: เครื่องทั้งหมด, เปิดใช้งาน, บำรุงรักษา, Sensor, QR Ready. Filters: search (code, name, type, manufacturer, model, serial, location), factory, status.
- operationalStatus NORMAL=ปกติ, MAINTENANCE=บำรุงรักษา, WARNING=ตรวจสอบ, STOPPED=หยุดทำงาน; status INACTIVE=ปิดใช้งาน.
- readiness = % of 11 checks: code, name, type, line, manufacturer, model, serial, installationDate, locationNote, sensors>0, qr>0.
- Form (cascading ACTIVE hierarchy): factory → building → department → line*, machineCode* (upper), machineName*, machineTypeId* (ACTIVE master), manufacturer, model, serialNumber, installationDate, locationNote, operationalStatus, status.
- Empty state: "ต้องมี โรงงาน → อาคาร → แผนก → Production Line ก่อน".
- Old: POSTing an existing INACTIVE code revived it; GET hid INACTIVE (bug — rewrite lists all with filter).

## 5. Sensors
- Summary: total, online, offline, maintenance, fault. PAGE_SIZE 7. Filters: search, connection status, type, machine.
- connectionStatus: INACTIVE → MAINTENANCE; latest SensorData.qualityStatus ≠ VALID → FAULT; lastConnectedAt within max(interval×3, 300s) (or 900s if no interval) → ONLINE; else OFFLINE.
- Form: machine* (ACTIVE), sensorType* (ACTIVE master), sensorCode* ("SEN-0001"), sensorName*, serialNumber, manufacturer, protocol (Modbus TCP default; Modbus RTU, MQTT, OPC UA, HTTP API, LoRaWAN, BACnet, Manual), samplingIntervalSeconds (int > 0), connectionAddress ("192.168.1.100:502"), dataTopic, installationDate, lastCalibrationDate, nextCalibrationDate, status.
- Delete: has SensorData → INACTIVE.
- Detail: latest reading (raw/processed, unit, quality, measuredAt).

## 6. QR codes
- Stats: total, ACTIVE (ใช้งานอยู่), SUSPENDED (ระงับ), REVOKED (ยกเลิก). Filters: search, status, department. Bulk select.
- Create: cascade factory → building → department → line → target (MACHINE or CHECKPOINT, ACTIVE), qrCode* (upper, unique per company), status. Token `crypto.randomUUID()`; REVOKED sets revokedAt.
- Scan URL `${APP_URL}/scan/<token>`. QR image client-side (`qrcode`, ECC H, dark #10271d).
- Actions: copy link, download PNG (`QR_{code}_{targetCode}.png`), print one label, batch print A4 (2 columns × 3 rows = 6 labels per page, 37mm QR, asset name, codes, building/department/line, status). Batch download.
- Old app faked edit / rotate token / suspend / delete with alert(); rewrite implements them.

## 7. Users
- Stats: ผู้ใช้งานทั้งหมด, บัญชีใช้งานอยู่, Manager / Operator, ต้องตั้งค่าเพิ่ม (non-admin without factory, or operator without department). PAGE_SIZE 8.
- Create: employeeCode* (upper, unique per company), role* MANAGER|OPERATOR only, firstName*, lastName*, email* (lower, unique globally), password* ≥ 8, factoryId* (company), departmentId* for OPERATOR (must be in that factory). username = email local part `[a-z0-9._-]`, suffixed 1,2… if taken. bcrypt.
- Toggle suspend: ACTIVE ↔ LOCKED; cannot change self or another COMPANY_ADMIN.
- Rewrite adds edit, reset password; sessions of suspended users must stop working.

## 8. Profile
- Editable firstName*, lastName* (≤100), phone (≤30). Read-only employeeCode, position, department, company.
- Old mocks to replace: sessions list, activity timeline, notification prefs, 2FA toggle, avatar preview only, password form not wired.

## 9. Pages that were mock — rewrite with real data
- Settings: company profile (Company model: taxId, industryType, address, province, postalCode, country, phone, email, website, logo, timezone, currency, language).
- Roles: matrix of permission codes × levels FULL | VIEW | NONE per role (Permission / RolePermission tables). Groups: OPERATION (DASHBOARD, CARBON_RESULT, KPI, ALERT, AI_RECOMMENDATION, REPORT_EXPORT), ORGANIZATION (COMPANY_MANAGEMENT, USER_MANAGEMENT, ROLE_PERMISSION_MANAGEMENT, FACTORY_MANAGEMENT, BUILDING_MANAGEMENT, DEPARTMENT_MANAGEMENT, PRODUCTION_LINE_MANAGEMENT), ASSET_IOT (MACHINE_MANAGEMENT, SENSOR_MANAGEMENT, QR_CODE_MANAGEMENT, CHECKPOINT_MANAGEMENT), ENVIRONMENT (RESOURCE_USAGE, RESOURCE_MASTER_DATA, EMISSION_FACTOR), GOVERNANCE (AUDIT_LOG, LOGIN_LOG, BACKUP_RESTORE, SYSTEM_SETTINGS).
- Reports: types รายงานการใช้พลังงาน / การปล่อยคาร์บอน / การใช้น้ำและทรัพยากร / ประสิทธิภาพสายการผลิต; date range; Excel/PDF/CSV.
- Resource usage: list real ResourceUsage for the company with carbon, filters, CSV export.
- Help: FAQ categories account/factory/sensor/report/resource/qr + support ticket form (real SupportTicket).
