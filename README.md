# poc-bmad — Employee parking reservation (POC)

Internal web app for **reserving office parking slots by date**, viewing **My reservations**, and **cancelling** when plans change. This repository is a **proof-of-concept** built with [BMAD](https://github.com/bmad-code-org/BMAD-METHOD)-style planning artifacts and iterative stories.

## Product snapshot

- **Goal:** Make slot availability visible and reservable so employees get a clear commitment instead of guessing whether a spot exists.
- **Users:** Office employees (primary); admin/support flows are planned for later epics.
- **PRD / UX / architecture:** See `_bmad-output/planning-artifacts/` (`prd.md`, `ux-design-specification.md`, `architecture.md`).

## What’s implemented (so far)

Aligned with **file-based sprint tracking** in `_bmad-output/implementation-artifacts/sprint-status.yaml`:

| Area | Status (high level) |
|------|---------------------|
| **Epic 1** — Baseline app, Auth.js, user profile, RBAC scaffolding | Stories **1-1–1-4** in **review** |
| **Epic 2** — Slot grid, date selection, reserve/cancel, conflicts, **My reservations** | Stories **2-1–2-9** in **review**; **2-10** (UX baseline) **backlog** |
| **Epics 3–4** — Stronger persistence invariants, audit, admin/support | **Backlog** |

Notable behaviors in the current codebase:

- **PostgreSQL + Prisma** for reservations, users, slots, and audit-related models.
- **NextAuth** with a **credentials “SSO placeholder”** (local dev); production SSO is a planned upgrade.
- **Reserve / cancel** flows with **conflict handling**, **idempotent cancel** for missing rows, and **403** when cancelling a reservation **owned by another employee**.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 14** (App Router) |
| UI | **React 18**, **Tailwind CSS** |
| Language | **TypeScript** (strict) |
| Data | **Prisma** + **PostgreSQL** |
| Auth | **NextAuth** + `@next-auth/prisma-adapter` |
| Tests | **Node.js built-in test runner** (`node --test`) for selected unit modules |

## Prerequisites

- **Node.js** (LTS recommended; matches local dev for Next 14)
- **PostgreSQL** reachable via `DATABASE_URL`

## Quick start

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `NEXTAUTH_URL` — e.g. `http://localhost:3000`
   - `NEXTAUTH_SECRET` — strong random string
   - `DATABASE_URL` — PostgreSQL connection string

3. **Database**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in using the placeholder credentials flow (employee id, email, display name as required by your local auth setup).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (zero warnings policy) |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Apply migrations (dev) |
| `node --test tests/unit/*.test.js` | Unit tests (JS modules) |

## Repository layout (abbreviated)

```text
src/
  app/                 # App Router pages & API routes
  server/              # Auth, domain logic, DB access
  lib/                 # Shared helpers (incl. UI message mappers tested with node:test)
prisma/                # Schema & migrations
tests/unit/            # Node unit tests
_bmad-output/          # BMAD outputs (PRD, UX, architecture, stories, sprint status)
.cursor/skills/        # Cursor agent skills for BMAD workflows
```

## AI / agent context

- **`_bmad-output/project-context.md`** — Conventions for this repo (stack, API shapes, style).  
- **`_bmad-output/implementation-artifacts/`** — Story specs and `sprint-status.yaml`.  
- A `docs/` path is reserved in BMAD config for future curated docs; it may not exist yet in this POC.

## Contributing / next steps

1. Pick the next **ready-for-dev** or **backlog** story in `sprint-status.yaml` (or run BMAD `create-story` / sprint workflows).  
2. Keep **PRD-aligned** behavior: no double-booking, clear errors, ownership on cancel.  
3. After substantive changes: `npm run lint`, `npm run build`, and `node --test tests/unit/*.test.js`.

### Optional BMAD follow-ups

- Run workflows in a **fresh chat** when using long-running BMAD skills.  
- For **validation** steps (e.g. PRD/story quality), consider a **different high-quality model** than the one that authored the artifact.

---

**Maintainer context:** Configured in `_bmad/bmm/config.yaml` (`project_name: poc-bmad`). For questions about what to run next in BMAD, use the **`bmad-help`** skill.
