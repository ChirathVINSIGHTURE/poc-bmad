---
project_name: "poc-bmad"
user_name: "Chirath.vandabona"
date: "2026-03-18"
sections_completed: ["discovery_initialization", "technology_stack_versions", "language_specific_rules", "framework_specific_rules", "testing_rules", "code_quality_style_rules"]
existing_patterns_found: 6
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

## Technology Stack & Versions

- **Framework**: Next.js `^14.2.35` (App Router)
- **UI**: React `^18.3.1`, React DOM `^18.3.1`
- **Language**: TypeScript `^5` (`strict: true`, `moduleResolution: "bundler"`, `@/*` → `src/*`)
- **Styling**: Tailwind CSS `^3.4.15` + PostCSS `^8.4.49` + Autoprefixer `^10.4.20`
- **Linting**: ESLint `^8` + `eslint-config-next` `^16.1.6`

## Existing Patterns Found

- **App Router layout/pages**: `src/app/layout.tsx`, `src/app/page.tsx`
- **Route Handlers for REST-ish APIs**: `src/app/api/**/route.ts`
- **Path aliasing**: `@/*` → `./src/*` (from `tsconfig.json`)
- **In-memory data store (current POC)**: `src/lib/store.ts` holds reservations/slots in module-level state
- **Date is a date-only string**: `Reservation.date` is `YYYY-MM-DD` (see `src/lib/types.ts`)
- **Tailwind theme tokens**: custom `lot.*` colors in `tailwind.config.ts`

## Critical Implementation Rules (current codebase)

### Language-Specific Rules (TypeScript)

- TypeScript is `strict: true`; do not “fix” types with `any`—define/extend proper types.
- Prefer the `@/*` alias for imports within `src/` (avoid deep relative paths).
- Keep reservation `date` values as `YYYY-MM-DD` strings at API/module boundaries.
- In Route Handlers, prefer `NextResponse.json(...)` and keep error payload shapes consistent within this API.

### Framework-Specific Rules (Next.js App Router / React)

- Keep `src/app/page.tsx` (and other route files) as **Server Components by default**. Add `"use client"` only when you need client-only APIs (hooks, `localStorage`, DOM events).
- Client components in this repo use **client-side fetch** against Route Handlers (e.g. `fetch("/api/slots?date=...")`). If you change response shapes, update all callers.
- Route Handlers are the API boundary (`src/app/api/**/route.ts`). Keep them small: validate inputs, call domain/store functions, return JSON with proper status codes.
- Current identity is a **POC localStorage “employee”** (`parking-employee-id`, `parking-employee-name`) in `Dashboard.tsx`. Do not treat it as secure; future SSO work should replace this mechanism, not extend it.
- UI style conventions:
  - Tailwind classNames inlined in components
  - Use the `lot.*` theme colors defined in `tailwind.config.ts`
  - Prefer accessible form controls (`label htmlFor=...`) and clear error text blocks

### Testing Rules

- No test framework is currently configured in the repo (no Jest/Vitest/Playwright configs found). Do not add a new framework silently as part of unrelated changes.
- If you introduce non-trivial behavior changes, add the smallest practical test coverage once a testing stack is agreed (keep tests deterministic; avoid time-based flakiness).

### Code Quality & Style Rules

- Use the existing code style conventions:
  - Double quotes (`"..."`)
  - Semicolons
  - `import ... from "..."` (ESM)
- File organization conventions:
  - App Router under `src/app/**`
  - Shared UI components under `src/components/**`
  - Shared domain/data helpers under `src/lib/**`
- Naming conventions:
  - React components use `PascalCase` and export named functions (e.g. `export function Dashboard()`)
  - Component files use `PascalCase.tsx` (e.g. `Dashboard.tsx`)
- Linting is run via `npm run lint` (`next lint`). Keep code lint-clean; don’t introduce lint disables unless unavoidable.
- Prettier/formatting is not explicitly configured in the repo; don’t introduce a formatter config as drive-by change.

- **Date format**: Treat reservation dates as **date-only** strings (`YYYY-MM-DD`). Do not introduce timezones into the domain model unless the system is redesigned.
- **Slot IDs**: Slots are formatted as `P01`..`P24` (see `src/lib/store.ts`).
- **API contract (current)**:
  - `GET /api/slots?date=YYYY-MM-DD` returns `{ slots, date }`; without `date`, returns `{ slots }`
  - `GET /api/reservations?employeeId=...` requires `employeeId` query param
  - `POST /api/reservations` expects `{ slotId, date, employeeId, employeeName }`
  - `DELETE /api/reservations/:id?employeeId=...` requires `employeeId` query param
- **Conflict semantics**: Double-booking returns HTTP `409` with `{ error: "Slot already reserved for this date" }` (from current `createReservation` flow).

## Notes / Gaps (from architecture doc vs current code)

- The architecture doc describes **Postgres + Prisma + Auth.js + audit events**, but the current implementation is a **POC in-memory store** with no SSO/RBAC/audit yet.
- If/when DB persistence is added, preserve the invariant “one reservation per slot per date” as a hard constraint (not just application checks).

