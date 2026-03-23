---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-18'
project_name: 'poc-bmad'
user_name: 'Chirath.vandabona'
date: '2026-03-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Availability & slots (FR1–FR4, FR14–FR16):** The system must present date-based availability and enforce the core invariant: **one reservation per slot per date**.
- **Reservations lifecycle (FR5–FR8, FR18–FR19, FR24):** Users can reserve/cancel and see their reservations; errors (like “already reserved”) must be clear and recoverable.
- **Identity & access (FR9, FR11–FR13, FR21):** All actions are tied to **SSO-derived employee identity**; ownership rules prevent cross-user cancellation except where explicitly allowed for support/admin.
- **Audit & compliance (FR10, FR25):** Reservation lifecycle events require an auditable record (who/what/when) suitable for dispute resolution.
- **Admin/support operations (FR26–FR30):** A privileged role can search reservations, view lifecycle/audit history, and perform controlled corrections (cancel/reassign) with operator identity + reason recorded.

**Non-Functional Requirements:**
- **Performance (NFR-P1–P3):** Availability + reserve/cancel and initial load complete within **5 seconds** under normal office-hour load.
- **Security (NFR-S1–S3):** Strong ownership enforcement for actions; internal-only data handling; access limited to intended audience.
- **Accessibility (NFR-A1–A4):** Keyboard operability, accessible names/labels, error message accessibility, and reasonable contrast.
- **Reliability (NFR-R1–R2):** **99.9% uptime during business hours** for reservation flows; failure modes must avoid inconsistent states.
- **Scalability (NFR-X1–X2):** Support **200 concurrent users** and **20 reservation mutations/sec burst** while meeting performance targets.

**Scale & Complexity:**
- Primary domain: internal full-stack web app (UI + API + persistence + authn/authz)
- Complexity level: medium
- Estimated architectural components: 6–9 (user UI, admin/support UI, API surface, identity integration boundary, persistence layer, concurrency control around reservations, audit trail, observability/ops concerns)

### Technical Constraints & Dependencies

- **SSO is mandatory** for employee identity (Phase 1 production release).
- **Durable database persistence is required** (no in-memory-only persistence in production).
- **No double-booking invariant** (slot+date uniqueness) must hold under concurrent attempts.
- **Admin/support corrective actions** must be controlled and auditable (operator + reason).

### Cross-Cutting Concerns Identified

- **Authorization/RBAC:** employee vs admin/support capabilities, and strict ownership rules.
- **Auditability:** capture reservation lifecycle + support overrides with traceability.
- **Consistency under concurrency:** enforce uniqueness and predictable outcomes under races.
- **Operability:** support lookup/investigation workflows; define safe failure behavior.
- **Accessibility & UX feedback:** accessible controls and error states for primary flows.

## Starter Template Evaluation

### Primary Technology Domain

Internal full-stack web application (Next.js App Router) with server-side APIs, database persistence, authentication/authorization, and admin/support workflows.

### Starter Options Considered

#### Option A — Official Next.js starter (`create-next-app`) [minimal baseline]

- **Why consider it:** Minimizes opinionated tooling; we explicitly decide auth, DB, RBAC, audit, and testing architecture.
- **Trade-off:** More early setup work; higher risk of drift unless we lock conventions immediately.

**Initialization Command (official, 2026):**

```bash
npx create-next-app@latest poc-bmad --typescript --tailwind --eslint --app
```

#### Option B — Create T3 App [opinionated full-stack baseline]

- **Why consider it:** Quickly establishes consistent conventions and scaffolds auth + DB integration paths; good for CI-friendly, repeatable project creation.
- **Trade-off:** Adds stack opinions; we must treat chosen modules (auth/db approach) as **locked decisions** to avoid churn.

**Initialization Command (verified pattern, 2026):**

```bash
pnpm dlx create-t3-app@latest --CI --appRouter --nextAuth --tailwind --prisma --dbProvider postgres
```

### Recommended Selection Approach

Both options are acceptable for this PRD. Choose based on how much opinionated scaffolding you want:

- Choose **Option A** if you want “boring minimal Next.js” and prefer to define auth/DB/RBAC/audit explicitly in this architecture doc before scaffolding.
- Choose **Option B** if you want a faster full-stack baseline and are willing to lock the starter’s major choices early to prevent implementation drift.

### Architectural Decisions the Starter Does *Not* Solve (must still be decided)

Regardless of starter, we still need explicit decisions for:

- **SSO integration boundary** (IdP/provider details and claim mapping)
- **RBAC model** (employee vs admin/support permissions, and enforcement points)
- **Audit trail design** (what events, retention, queryability)
- **Reservation concurrency control** (how we guarantee slot+date uniqueness under races)
- **Testing strategy** (unit/integration/e2e + DB-backed CI strategy)

## Core Architectural Decisions (In Progress)

### Data Architecture

**Baseline (from selected starter):**
- **Database**: PostgreSQL (starter baseline)
- **ORM**: Prisma (starter baseline)
- **Migration tooling**: Prisma Migrate (starter baseline)

**Decisions captured for this project:**
- **Double-booking prevention (critical)**: Enforce the invariant “one reservation per slot per date” using a **database-level unique constraint** on `(slot_id, date)` (or equivalent), so concurrent reservation attempts cannot create duplicates.
  - **Behavior on conflict**: Reservation attempts that violate the unique constraint return a clear “slot already reserved for this date” outcome (maps to FR6/FR19).
- **Slots source of truth (critical)**: Store slots in a **`Slot` table** as the operational source of truth; seed initial slots (e.g., P01–P24) via migrations/seed scripts so support/admin evolution is possible without code redeploy.
- **Audit trail (critical)**: Persist an append-only **`AuditEvent` table** to support dispute resolution and corrective actions (maps to FR10/FR25/FR27/FR30).
  - **Minimum fields**: `id`, `timestamp`, `actor_type` (employee/support/admin), `actor_id`, `action` (reserve/cancel/override/reassign), `reservation_id`/`slot_id`/`date`, `reason` (required for admin/support corrections), and optional structured metadata.

**Note (collaboration)**: These choices were saved as the default production-safe interpretation of the PRD when explicit preferences were not provided at decision time.

### API & Communication Patterns

**Decision (critical):** Use **REST-style HTTP APIs** implemented via Next.js Route Handlers for all application interactions (no tRPC).

**API surface (logical):**
- **Availability**: read availability for a given date (slots + reservation status)
- **Reservations**: create reservation, list “my reservations”, cancel reservation
- **Admin/Support**: search reservations (by employee/date/slot), view audit trail, perform corrective actions (cancel/reassign) with reason

**Standards:**
- **AuthN/AuthZ**: Every endpoint requires authenticated identity; role checks enforced server-side for admin/support endpoints.
- **Errors**: Use consistent error shape and clear conflict semantics for double-book attempts (maps to FR19).
- **Idempotency**:
  - Cancel is idempotent (repeating cancel does not create inconsistent state).
  - Reserve relies on DB uniqueness; conflict returns a deterministic “already reserved” response.
- **Audit hooks**: Each mutation emits an audit event (reserve/cancel/override/reassign) with actor + timestamp + reason where required.
### Authentication & Security

**Baseline (from selected starter):**
- **Auth framework**: Auth.js (NextAuth) (starter baseline)
- **DB adapter**: Prisma adapter (starter baseline)

**Decisions captured for this project:**
- **SSO approach (critical)**: Use **OAuth/OIDC via Auth.js provider(s)** as the SSO integration boundary (maps to FR11–FR13).
  - **Identity mapping**: Treat the IdP subject/identifier as the stable user key; store employee display attributes for UI and auditing.
- **Session strategy (critical)**: Use **database-backed sessions** (vs JWT sessions) to support centralized invalidation and operational control suitable for an internal production app.
- **RBAC source of truth (critical)**: Store a `role` (or equivalent) on the user record in the database with the minimum roles: `employee`, `support`, `admin` (maps to FR29).
  - IdP claims may be used to *provision* or *sync* roles, but **authorization decisions** are enforced from the app’s DB role state for consistency.
- **Authorization enforcement (critical)**: Defense-in-depth:
  - **Server-side enforcement** in all mutation endpoints (reserve/cancel/override/reassign) and admin/support queries.
  - **Route protection** for admin/support UI routes.
  - UI hides unauthorized actions, but UI is not relied on for security.
- **Admin/support controls (critical)**:
  - All corrective actions require capturing `operator_id` and `reason` (maps to FR30).
  - All employee actions are tied to the authenticated identity (maps to FR12/FR21).

**Note (collaboration)**: These choices were saved as the default production-safe interpretation of the PRD when explicit preferences were not provided at decision time.

### Frontend Architecture

**Decision (critical):** Use a **server-first Next.js App Router** approach.

- **Reads (availability, my reservations, admin/support search views):**
  - Prefer **Server Components** for rendering pages with server-side data access.
  - Avoid unnecessary client-side fetching for primary screens.

- **Writes (reserve/cancel/override/reassign):**
  - Prefer **Server Actions** for mutations triggered from the UI where practical.
  - Route Handlers remain the REST surface (already decided), but UI mutations should avoid extra client→API boilerplate when Server Actions suffice.

- **Consistency after mutations:**
  - After successful mutations, trigger **cache invalidation / UI refresh** using `revalidatePath()` (or tags) so the dashboard and “my reservations” reflect the server-authoritative state.

- **Client components:**
  - Use Client Components only for interactive widgets (e.g., date picker), keeping business logic server-side.

- **Error UX requirements:**
  - Conflict on reserve (already reserved) must surface as a clear UI error and allow quick recovery (pick another slot), without risking inconsistent state.

### Infrastructure & Deployment

**Decision (critical):** Deploy the Next.js application on **Vercel**, with a managed **PostgreSQL** instance and environment-managed secrets.

- **Environments**: `dev` / `staging` / `prod` with separate DBs and separate Auth.js credentials/secrets.
- **CI/CD**: Git-based deploys with preview deployments for PRs; production deploys from main branch with required checks.
- **Database migrations**:
  - Dev: `prisma migrate dev`
  - Deploy: `prisma migrate deploy` as part of the deployment pipeline before serving traffic.
- **Secrets management**: Store `AUTH_SECRET`, DB URL, and IdP client secrets in Vercel environment variables (never in repo).
- **Observability (recommended)**: Instrument with **OpenTelemetry** using Next.js instrumentation hook; ship traces/logs to the chosen provider.
- **Operational safeguards**:
  - Rate limit / request limits on mutation endpoints as appropriate for internal use.
  - Clear failure mode if DB/Auth dependencies are unavailable (maps to NFR-R2).

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical conflict points identified:** naming, API formats, time handling, auth/RBAC enforcement, audit writes, and test organization.

### Naming Patterns

**Database naming (Prisma):**
- Models: `PascalCase` (e.g., `User`, `Slot`, `Reservation`, `AuditEvent`)
- Fields: `camelCase` (e.g., `userId`, `slotId`, `reservedDate`)
- Tables: default Prisma mapping (avoid manual mapping unless required)
- Constraints/indexes: name explicitly only when needed; otherwise rely on Prisma defaults

**API naming (Route Handlers):**
- Routes: plural nouns where it reads naturally (`/api/reservations`, `/api/slots`, `/api/admin/reservations`)
- Query params: `camelCase`
- IDs: opaque `id` strings; do not expose internal sequential IDs if avoidable

**Code naming:**
- Components: `PascalCase` (`SlotGrid`, `ReservationList`)
- Files: `PascalCase.tsx` for components, `kebab-case` for route segments (Next.js convention)
- Functions/vars: `camelCase`

### Structure Patterns

**Project organization:**
- Keep “domain logic” in server-side modules (e.g., `src/server/**`) so UI and APIs share the same invariants.
- Keep UI components in `src/components/**`, with feature grouping allowed when it reduces coupling.

**Tests:**
- Unit tests colocated as `*.test.ts`/`*.test.tsx` near the module under test when practical.
- Integration tests (DB-backed) under a dedicated `tests/integration/**` (or equivalent single folder) so CI can run them distinctly.

### Format Patterns

**API response format (REST):**
- Success: `{ data: ... }`
- Error: `{ error: { code: string, message: string } }`
- Use HTTP status codes consistently:
  - `200/201` success
  - `400` validation errors
  - `401` unauthenticated
  - `403` unauthorized (RBAC/ownership)
  - `404` not found
  - `409` conflict (slot already reserved for date)

**Date/time formats:**
- Treat reservation date as a **date-only** concept; represent as ISO `YYYY-MM-DD` at the API boundary.
- Store internally in a consistent form (e.g., date column or normalized UTC date), but never mix timezones in business logic.

### Communication Patterns

**Audit event writing:**
- Every mutation that changes reservation state MUST append an `AuditEvent`.
- Admin/support corrections MUST include `reason` and operator identity.

### Process Patterns

**Validation:**
- Validate inputs at the boundary (Route Handler / Server Action) using a single shared schema per endpoint.

**Error handling:**
- Never leak internal exception details in API responses.
- Log internal error details server-side; return a stable `error.code` + user-safe `error.message`.

### Enforcement Guidelines

**All AI Agents MUST:**
- Enforce RBAC/ownership checks server-side on every mutation.
- Enforce no-double-booking via the DB unique constraint (never app-only checks).
- Emit `AuditEvent` for all reservation/admin mutations.
- Use the standard REST error format and status codes above.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
poc-bmad/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.* (or .eslintrc.*)
├── .gitignore
├── .env.example
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Dashboard (date + availability)
│   │   ├── globals.css
│   │   ├── (employee)/
│   │   │   ├── my-reservations/
│   │   │   │   └── page.tsx              # My reservations (server-rendered)
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── reservations/
│   │   │   │   │   └── page.tsx          # Support/admin search & actions
│   │   │   │   └── audit/
│   │   │   │       └── page.tsx          # Audit trail views (optional)
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── slots/
│   │   │   │   └── route.ts              # GET slots + availability by date
│   │   │   ├── reservations/
│   │   │   │   ├── route.ts              # POST create, GET list (scoped)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts          # DELETE/POST cancel by id
│   │   │   └── admin/
│   │   │       ├── reservations/route.ts # Search + corrective actions
│   │   │       └── audit/route.ts        # Audit query endpoints
│   │   ├── actions/
│   │   │   ├── reservations.ts           # Server Actions (reserve/cancel)
│   │   │   └── admin.ts                  # Server Actions (override/reassign)
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SlotGrid.tsx
│   │   │   └── ui/                       # shared UI primitives
│   │   ├── server/
│   │   │   ├── auth/
│   │   │   │   ├── auth.ts               # Auth.js config wrapper
│   │   │   │   └── rbac.ts               # role checks, helpers
│   │   │   ├── db/
│   │   │   │   ├── prisma.ts             # Prisma client singleton
│   │   │   │   └── transactions.ts       # transaction helpers (optional)
│   │   │   ├── domain/
│   │   │   │   ├── reservations.ts        # invariants + workflows
│   │   │   │   ├── slots.ts
│   │   │   │   └── audit.ts
│   │   │   ├── api/
│   │   │   │   ├── responses.ts          # {data}/{error} helpers + status mapping
│   │   │   │   └── errors.ts             # typed error codes (409,403, etc.)
│   │   │   └── validation/
│   │   │       ├── reservations.ts        # shared schemas per endpoint/action
│   │   │       ├── slots.ts
│   │   │       └── admin.ts
│   │   └── types/
│   │       └── domain.ts                 # shared TS types (if needed)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                           # initial slots + admin bootstrap (if used)
├── tests/
│   ├── integration/
│   │   ├── reservations.test.ts          # DB-backed: uniqueness, cancel idempotency
│   │   └── admin-corrections.test.ts     # DB-backed: audit + RBAC
│   └── e2e/
│       └── smoke.test.ts                 # reserve/cancel happy path (optional)
└── public/
    └── (static assets)
```

### Architectural Boundaries

**API Boundaries:**
- External API boundary is the Next.js Route Handlers under `src/app/api/**`.
- All mutation endpoints MUST:
  - authenticate via Auth.js
  - enforce RBAC/ownership in server code
  - emit `AuditEvent`
  - enforce no-double-booking via DB unique constraint

**Component Boundaries:**
- UI components are presentation-first; business rules do not live in `src/components/**`.
- Interactive widgets can be client components, but mutations are executed via Server Actions (preferred) and/or Route Handlers.

**Service Boundaries:**
- `src/server/domain/**` owns the reservation invariants and workflows (single source of truth).
- Route Handlers and Server Actions call into domain modules rather than duplicating logic.

**Data Boundaries:**
- Only `src/server/db/**` owns Prisma client access.
- Domain modules perform reads/writes through Prisma and are responsible for transaction boundaries.

### Requirements to Structure Mapping

**Feature mapping (from PRD FR groups):**
- Availability by date (FR1–FR4, FR14–FR16)
  - UI: `src/app/page.tsx`, `src/components/SlotGrid.tsx`
  - API: `src/app/api/slots/route.ts`
  - Domain: `src/server/domain/slots.ts`
- Reservations (FR5–FR8, FR18–FR19, FR24)
  - UI: `src/app/(employee)/my-reservations/page.tsx`
  - Actions: `src/app/actions/reservations.ts`
  - API: `src/app/api/reservations/**`
  - Domain: `src/server/domain/reservations.ts`
- Admin/support operations (FR26–FR30)
  - UI: `src/app/(admin)/admin/**`
  - Actions: `src/app/actions/admin.ts`
  - API: `src/app/api/admin/**`
  - Domain: `src/server/domain/audit.ts` + `reservations.ts`
- Identity & access (FR11–FR13, FR21, FR29)
  - Auth config: `src/server/auth/auth.ts`
  - RBAC helpers: `src/server/auth/rbac.ts`
  - Auth route: `src/app/api/auth/[...nextauth]/route.ts`
- Audit trail (FR10, FR25, FR27, FR30)
  - DB model: `prisma/schema.prisma`
  - Domain: `src/server/domain/audit.ts`
  - API: `src/app/api/admin/audit/route.ts`

### Integration Points

**Internal communication:**
- UI → Server Actions (preferred) → Domain → DB
- UI → Route Handlers (when appropriate) → Domain → DB

**External integrations:**
- SSO/IdP via Auth.js provider configuration (environment-managed secrets)

**Data flow:**
- Dashboard reads availability server-side, mutations write via domain workflows, then UI revalidates affected paths.

### File Organization Patterns

**Configuration files:**
- `.env.example` documents required env vars; secrets live in Vercel env.
- Prisma schema/migrations live under `prisma/`.

**Test organization:**
- DB-backed integration tests live under `tests/integration/`.

## Architecture Validation Results

### Coherence Validation ✅

- Stack and decisions are compatible (Next.js App Router + Auth.js + Prisma/Postgres + Vercel).
- Concurrency, RBAC, and audit patterns align with the production posture.
- Minor doc cleanup: rename “Core Architectural Decisions (In Progress)” once workflow completes; fix section formatting.

### Requirements Coverage Validation ✅ (with gaps)

**Functional coverage:**

- Core reservation flows, conflict handling, and admin/support workflows are architecturally supported.
- **Gap (important):** SSO provider/claim mapping and role provisioning rules are not specified.
- **Gap (important):** Audit retention duration (“per policy”) not specified.

**Non-functional coverage:**

- Performance/security/reliability are addressed at a policy level.
- **Gap (important):** Define timezone/business-hours window for date-only reservations and uptime measurement.
- **Gap (nice-to-have):** Explicit caching/revalidation strategy for availability reads.

### Implementation Readiness Validation ✅ (with gaps)

- Patterns and structure are sufficient for consistent implementation.
- **Gap (important):** Decide test tooling (unit + integration + e2e) so agents don’t diverge.
- **Gap (nice-to-have):** Clarify the default mutation path (Server Actions vs calling REST from UI) to prevent drift.

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (with the gaps above tracked)

**First Implementation Priority:**

Initialize project from the selected starter, configure Auth.js + Prisma + Postgres, and implement the DB schema enforcing slot+date uniqueness plus AuditEvent emission.
