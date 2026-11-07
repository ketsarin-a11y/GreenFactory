# GreenFactory Insight — how code is written here

Read `DESIGN.md` (visual rules) and `docs/superpowers/plans/2026-11-03-greenfactory-rewrite.md` (Global Constraints) first.
Next.js 16: `params`/`searchParams` are Promises; use the global `PageProps<"/route">`, `LayoutProps<"/route">`, `RouteContext<"/route">` types (run `npx next typegen` after adding a route). Middleware is `src/proxy.ts`. Cache Components is OFF.

## Layout of the code
| Where | What |
|---|---|
| `src/app/<role>/**/page.tsx` | Server Components. First line: `const user = await requireTenantUser("MANAGER")` (or `requireUser("PLATFORM_ADMIN")`). |
| `src/app/<role>/**/_components/*.tsx` | Client pieces for that page only (`"use client"`). |
| `src/server/queries/<area>.ts` | Read functions (`import "server-only"`). Take `user` and ALWAYS filter with `src/server/scope.ts`. |
| `src/server/actions/<area>.ts` | `"use server"` mutations built with `action(roles, zodSchema, fn)` from `_action.ts`. Inside: re-check ownership with a scoped `findFirst`, write, `audit(...)`, `revalidatePath(...)`. Throw `fail("ข้อความไทย")` for user errors. |
| `src/server/domain/*.ts` | Pure business rules with unit tests (`*.test.ts` next to them). |
| `src/app/api/**/route.ts` | Only for downloads/exports/streams. Check `getCurrentUser()` + scope inside. |

## Security rules (non-negotiable)
- Every query of tenant data includes the matching scope helper: `ownedWhere(user)`/`usageWhere(user)` for rows with companyId/factoryId; `machineWhere`, `checkpointWhere`, `lineWhere`, `departmentWhere`, `buildingWhere`, `factoryWhere`, `sensorWhere`, `qrWhere`, `companyUserWhere` for the hierarchy.
- An id from the client is looked up with `findFirst({ where: { id, ...scope } })`; not found → `fail("ไม่พบข้อมูล")`.
- Never return passwordHash, tokens or other tenants' data. Exception: QR tokens go to COMPANY_ADMIN pages of their own company, because the QR image is drawn in the browser. BigInt → string before sending to client components.
- Uploads: `saveFile(...)` from `src/server/storage.ts`; serve through an authorized route.

## Shared UI (use these, don't re-invent)
- Shell/page: `PageHeader` (`@/components/app/page-header`).
- Numbers: `StatTile` (`goodWhen="down"` for consumption/carbon), `fmtNum`, `fmtPct`, `fmtCarbon`, `num` (`@/lib/format`).
- Status: `Status` + maps `RECORD_STATUS`, `MACHINE_STATUS`, `SEVERITY`, `ALERT_STATUS`, `PROCESSING`, `CONNECTION`, `QR_STATUS` (`@/components/data/status-badge`). Icon + label, never color alone.
- Charts: `ChartCard` (always pass `table` for the table view), `TrendChart`, `BarList`; colors via `resourceColor(code)`, icons via `resourceIcon(code)` (`@/lib/resources`). One y-axis. Never mix units in one series.
- Lists: `UrlFilters` (filters in the URL; the server filters), `Pagination` + `pageParam`, shadcn `Table`.
- Empty states: `EmptyState` with what to do next. No mock numbers anywhere.
- Forms: `Field` + shadcn inputs, `useAction(action, { success })` (`@/hooks/use-action`), Dialog/Sheet for create/edit, toast via sonner.
- Shared pages: `ProfilePage` (`@/components/account/profile-page`), `HelpCenter` (`@/components/account/help-center`).
- Dates: `@/lib/time` only (`bkkDay`, `startOfBkkDay`, `endOfBkkDayExclusive`, `addDays`, `daysBetween`, `isDay`, `fmtDate`, `fmtDateTime`). Range filters are `gte: startOfBkkDay(from), lt: endOfBkkDayExclusive(to)`.

## Copy & look
Thai UI, short and concrete. Tabular numbers (`tabular` class). One primary button per view. Buttons/inputs: shadcn defaults; `h-10` for main form controls; operator screens use `size="lg"` and ≥44px touch targets. Cards = `rounded-xl border bg-card p-5`. No gradients, no shadows on cards, no purple, no emoji icons.

## Verify before saying done
1. `npx tsc --noEmit` clean, `npx eslint <your files>` clean.
2. `npx vitest run` green.
3. Integration tests in `tests/integration/<area>*.test.ts`, run with your own DB name:
   `TEST_DATABASE_URL=mysql://greenfactory:greenfactory@127.0.0.1:3306/gf_<area>_test npm run test:integration -- tests/integration/<area>`
4. The dev server is already running on http://localhost:3000 (don't start another, don't run `next build`). Check each page renders:
   `C=$(npx tsx scripts/dev-session.mts manager@voltera.example); curl -s -b "gf_session=$C" localhost:3000/manager | grep -c "Application error"` → 0, HTTP 200.
   Demo users (password from seed): admin@greenfactory.dev (PLATFORM_ADMIN, org code GFPLATFORM), admin@voltera.example, manager@voltera.example, operator@voltera.example, operator2@voltera.example, admin@siampack.example.
