# GreenFactory Insight Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild GreenFactory Insight from scratch with the same features as the legacy app, real data everywhere, and authorization on every read and write.

**Architecture:** Next.js 16 App Router (Cache Components off, per-request rendering). Reads happen in Server Components through `src/server/queries/*`; writes are Server Actions in `src/server/actions/*` that always run `zod parse → requireUser(role) → tenant scope → write → audit → revalidatePath`. Route handlers only where HTTP is required: file downloads (evidence, exports, backups) and the AI chat. Business rules live as pure, tested functions in `src/server/domain/*`.

**Tech Stack:** Next.js 16.4, React 19.3, TypeScript, Tailwind v4, shadcn/ui (Radix), Prisma 7 + MariaDB adapter on MySQL 8, jose (JWT), bcryptjs, zod, Recharts, exceljs, qrcode/jsQR, Vitest. Claude API for the G-FAY assistant.

**Spec:** `docs/legacy-spec/{operator,manager,company,platform,public-auth-design-data}.md` (what the old app did, its mocks and bugs) + `DESIGN.md` (visual system).

## Global Constraints
- Every page and action calls `requireUser(...roles)` / `requireTenantUser(...)`. Every query for tenant data filters by `user.companyId` (and `factoryId` for MANAGER/OPERATOR). No exceptions.
- All business dates are Asia/Bangkok days via `src/lib/time.ts`. Never `toISOString().slice(0,10)` on a Date.
- Never sum quantities with different units. Group by unit.
- No mock or hardcoded figures in any view. Empty state instead.
- UI copy in Thai. Numbers `th-TH`, tabular figures. Colors only from DESIGN.md tokens. One primary button per view.
- Charts: legend for 2+ series, hover tooltip, table view, one y-axis, fixed series colors per resource.
- bcrypt cost 12. Session = JWT `{uid, ver}`; user state re-read from DB each request; `sessionVersion` bumped on suspend and password change.
- Audit log row for every create/update/delete.
- Uploads stored outside `public/` and served through an authorized route; type checked by magic bytes.

## Review Focus
1. **Cross-tenant ids:** a user of company A posts an id that belongs to company B (machine, QR, user, alert, report) → must get "not found", never data. Test in Task 4 for each action family.
2. **Bangkok day boundaries:** a reading at 00:30 Bangkok belongs to that Bangkok day in every chart, filter and KPI. Covered by `time.test.ts`; add a query test in Task 6.
3. **Mixed units:** water types recorded in m³ and L must not be added. Aggregations group by unit (Task 6 test).
4. **Suspended user keeps a cookie:** after suspend or password change, the next request is logged out (Task 4 test on `getCurrentUser`).
5. **QR scan reuse:** a scan id is valid for 30 minutes, for that user and target only, and can be used once (Task 5 test).

---

### Task 1: Foundation ✅
Scaffold, DESIGN.md tokens in `globals.css`, IBM Plex Sans Thai, Prisma schema cleanup (+`User.sessionVersion`, unique `CarbonResult.usageId`), Docker MySQL, `src/server/db.ts`, session/lockout/roles/password/login, `current-user.ts`, `proxy.ts`, domain `carbon`, `anomaly`, `kpi`, `process-usage`, `lib/time`. 29 unit tests green.

### Task 2: Seed
**Files:** `prisma/seed.ts`, `prisma/seed/{client,master-data,permissions,role-permissions,demo}.ts`
- Roles with `roleCode = roleName`; SystemSetting row; master data and permissions from legacy; role-permission defaults mapped to MANAGER/OPERATOR.
- Demo (fictional): company VOLTERA (Chonburi electronics plant, 2 buildings, 3 departments, 4 lines, ~11 machines, 1 water checkpoint, sensors, QR for every target), company SIAMPACK (empty), users for all roles, demo emission factors labelled "ค่าตัวอย่าง — ตรวจสอบกับ อบก. ก่อนใช้งานจริง", 120 days of daily readings with weekday pattern, slow efficiency trend and 4 injected anomalies, processed through `processUsage`, KPIs + results.
- Verify: `npx prisma db seed` twice (idempotent), counts printed.

### Task 3: UI kit, app shell, auth pages
**Files:** `src/components/app/{app-shell,nav,user-menu,page-header}.tsx`, `src/components/data/{stat-tile,data-table,empty-state,status-badge,chart-card,filters}.tsx`, `src/app/(auth)/login|forgot-password|reset-password`, `src/server/actions/auth.ts`.
- Shell: forest sidebar per role (nav config per role), mobile sheet, topbar with company/factory name, alerts bell (manager), user menu with logout.
- Login form: organization code, email, password, remember; useActionState; returnTo via `safeReturnTo`.
- Password reset: sha256 token, 30 min, single use; email via Resend when `RESEND_API_KEY` set, else link printed to server log in dev only.
- Verify: log in as each demo role lands on its home; wrong password 5× locks.

### Task 4: Authorization helpers, audit, integration tests
**Files:** `src/server/scope.ts`, `src/server/audit.ts`, `src/server/actions/_action.ts`, `tests/integration/*.test.ts`, `vitest.integration.config.ts`
- `scope.ts`: `machineWhere(user)`, `usageWhere(user)`, … one function per entity returning the Prisma `where` that limits to the user's company (and factory for MANAGER/OPERATOR).
- `audit(user, table, id, action, oldData?, newData?)`.
- `action(schema, roles, fn)` wrapper returning `{ ok: true, data } | { ok: false, message, fieldErrors? }`.
- Integration tests on a `greenfactory_test` DB: tenant isolation per action family; suspended-user cookie rejected.

### Task 5: Operator
Dashboard (today summary, my recent records, polling 15s), scan (camera + file, jsQR), `/scan/[token]` (server component, creates QRScanLog, handles machine and checkpoint), record (step flow, unit locked to default unit, evidence upload, review, Bangkok date/time defaults), history (server pagination + filters + CSV route), help + ticket, profile + password + avatar.
- Tests: scan id expiry/single-use/ownership; record with foreign machine id rejected; checkpoint record works.

### Task 6: Manager
Home, Resource analytics (band, forecast, findings, evidence drawer), Carbon, KPI (and KPI recalculation action), Compare, Machines list/detail, Alerts (ack/resolve), History, Reports (XLSX/CSV/PDF), G-FAY AI (Claude API, deterministic fallback, chat history).
- Tests: aggregation groups by unit; previous-period math; forecast/OLS pure function; anomaly band pure function.

### Task 7: Company admin
Dashboard readiness, factories, structure tree (+checkpoints), machines, sensors (connection status), QR codes (create/edit/rotate/suspend/revoke/print A4 2×3/download), users (create/edit/suspend/reset), roles (view permission matrix for MANAGER/OPERATOR), resource usage (real data), reports, settings (company profile), help + ticket, profile.
- Tests: delete-or-deactivate rule; code uniqueness per parent; user creation rules.

### Task 8: Platform admin
Dashboard, companies (+first admin), factories, users, roles matrix editor, master data ×6 (+factor overlap rule), audit log, login log, backups (mysqldump from env, real verify), settings (whitelist), support tickets.
- Tests: factor overlap; settings whitelist; master data reactivate rule.

### Task 9: Public site
Home, features (energy, water, carbon, AI, platform), about, contact (form stores a SupportTicket-like lead or mails), pricing (simple, honest tiers or "ติดต่อฝ่ายขาย"), privacy, terms. Uses real copy from the legacy spec; no fake stats or testimonials.

### Task 10: Quality gate & delivery
`.env.example`, README (setup, demo accounts, deploy to Vercel + managed MySQL), GitHub Actions (lint, typecheck, unit, build), lighthouse/a11y pass on key pages, final whole-branch review, browser walkthrough per role at 375 / 1440 px.
