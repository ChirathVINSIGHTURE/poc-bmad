# Story 1.1: Set up initial project from starter baseline (Next.js + Auth.js + Prisma + Postgres)

Status: review

## Story

As a developer,
I want the initial project scaffolded with the agreed baseline stack,
so that all subsequent stories can be implemented consistently and deployed reliably.

## Acceptance Criteria

1. Given the repository is initialized
   1. When the project is set up
   2. Then the Next.js App Router project builds and runs locally with TypeScript and Tailwind configured
2. Given the baseline stack is required (Auth.js + Prisma + Postgres)
   1. When dependencies and configuration are added
   2. Then Prisma is configured to connect to Postgres and can run an initial migration, and Auth.js is wired into the app router (provider details may be placeholder)
3. Given the app is run locally after setup
   1. When a developer executes the standard dev command
   2. Then the app starts successfully without runtime errors and is ready for feature implementation
4. Given the project is set up
   1. When a developer runs `npm run lint` and `npm run build`
   2. Then both complete successfully (CI baseline signal)

## Tasks / Subtasks

- [x] Task 1: Scaffold Next.js App Router + baseline tooling
  - [x] Subtask 1.1: Create the Next.js project with App Router, TypeScript, Tailwind, and ESLint
  - [x] Subtask 1.2: Ensure `npm run dev`, `npm run lint`, and `npm run build` work in a clean local environment
  - [x] Subtask 1.3: Add `.env.example` capturing required env vars (no secrets committed)
  - [x] Subtask 1.4: Add initial `src/app/layout.tsx` + `src/app/page.tsx` placeholders (server components by default)

- [x] Task 2: Add Prisma + Postgres baseline (schema-ready)
  - [x] Subtask 2.1: Install `prisma` and `@prisma/client`
  - [x] Subtask 2.2: Create `prisma/schema.prisma`
  - [x] Subtask 2.3: Add initial migration scaffolding (even if models are minimal at first)
  - [x] Subtask 2.4: Verify `prisma migrate dev` can run locally against configured Postgres

- [x] Task 3: Wire Auth.js (NextAuth) into the Next.js app router
  - [x] Subtask 3.1: Install Auth.js / NextAuth dependencies compatible with Next.js App Router
  - [x] Subtask 3.2: Add Auth.js configuration wrapper under `src/server/auth/auth.ts` (or equivalent)
  - [x] Subtask 3.3: Add NextAuth route handler at `src/app/api/auth/[...nextauth]/route.ts`
  - [x] Subtask 3.4: Use placeholder provider configuration if IdP credentials are not available yet
  - [x] Subtask 3.5: Ensure authenticated routes can be protected in later stories (at minimum, auth session retrieval works end-to-end)

- [x] Task 4: Prepare architecture-required folder structure and conventions
  - [x] Subtask 4.1: Create `src/app/api/` route handler directories for later work:
    - `src/app/api/auth/` (Auth.js route)
    - `src/app/api/slots/route.ts`
    - `src/app/api/reservations/route.ts` and `[id]/route.ts`
    - `src/app/api/admin/reservations/route.ts`
    - `src/app/api/admin/audit/route.ts`
  - [x] Subtask 4.2: Create stubs for `src/actions/` and `src/server/` modules referenced by architecture:
    - `src/actions/reservations.ts`
    - `src/actions/admin.ts`
    - `src/server/db/prisma.ts`
    - `src/server/auth/rbac.ts`
    - `src/server/domain/reservations.ts`
    - `src/server/domain/slots.ts`
    - `src/server/domain/audit.ts`
    - `src/server/api/errors.ts` and `src/server/api/responses.ts`
    - `src/server/validation/*` schemas placeholders

- [x] Task 5: Lint/build baseline
  - [x] Subtask 5.1: Run and fix issues until `npm run lint` and `npm run build` succeed

## Dev Notes

### Relevant architecture patterns and constraints

- Use REST-style APIs via Next.js Route Handlers (no tRPC). This story mostly sets up the skeleton so later stories can implement endpoints.  
  [Source: `architecture.md` API & communication patterns]
- Use standard REST response and error contract everywhere later:
  - Success: `{ data: ... }`
  - Error: `{ error: { code: string, message: string } }`
  - HTTP status codes, including `409` for “slot already reserved for date”
  [Source: `architecture.md` "API response format (REST)" section]
- Prefer server-first App Router:
  - Server Components default; add `"use client"` only for interactive widgets.
  [Source: `architecture.md` "Frontend Architecture" section]
- Auth.js integration boundary:
  - Add NextAuth route handler at `src/app/api/auth/[...nextauth]/route.ts`
  [Source: `architecture.md` "Project Structure & Boundaries" mapping]

### Source tree components to touch (create stubs where needed)

- Project root: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `.env.example`
  [Source: `architecture.md` "Complete Project Directory Structure"]
- App Router:
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  [Source: `architecture.md` "Complete Project Directory Structure"]
- Auth:
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/server/auth/auth.ts`
  [Source: `architecture.md` "Complete Project Directory Structure"]
- Prisma:
  - `prisma/schema.prisma`
  - `prisma/migrations/*` via `prisma migrate`
  [Source: `architecture.md` "Complete Project Directory Structure" + "Data Architecture"]
- Server modules (stubs are sufficient in this story):
  - `src/server/db/prisma.ts`
  - `src/server/auth/rbac.ts`
  - `src/server/domain/*`
  - `src/server/api/*`
  - `src/server/validation/*`
  [Source: `architecture.md` "Project Structure & Boundaries"]

### Testing standards summary

- For this story, the only explicit acceptance test is `npm run lint` and `npm run build` passing successfully.
  [Source: `epics.md` Story 1.1 acceptance criteria]
- Later stories must add DB-backed integration tests for uniqueness/conflict flows, but that is out of scope for this setup story.
  [Source: `epics.md` Story 3.1]

### Project Structure Notes

- Because the repository may not already include `src/` and Prisma/Auth scaffolding, this story must create the directories and skeleton files required by `architecture.md` so later stories can implement features without relocating files.
  [Source: `architecture.md` "Complete Project Directory Structure"]

## References

- Story definition and acceptance criteria: `_bmad-output/planning-artifacts/epics.md` (Epic 1 → Story 1.1)
- Baseline stack and starter expectations: `_bmad-output/planning-artifacts/prd.md` (Phase 1 posture) and `_bmad-output/planning-artifacts/architecture.md` (Data/API/Auth decisions)
- Required directory structure and API response contract: `_bmad-output/planning-artifacts/architecture.md` ("Project Structure & Boundaries" and "API response format (REST)")

## Dev Agent Record

### Agent Model Used

N/A

### Completion Notes List

- Ensure the repo is runnable locally and builds cleanly (`npm run build` succeeded).
- Ensure lint baseline passes (`npm run lint` succeeded via ESLint 9 flat config).
- Ensure Prisma can migrate locally (`prisma migrate dev` succeeded against Docker Postgres).
- Ensure Auth route wiring exists (`src/app/api/auth/[...nextauth]/route.ts` compiles with placeholder Credentials provider).

### File List

- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- `.env.example`
- `src/app/layout.tsx`, `src/app/page.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`
- `prisma/schema.prisma` (+ migrations after `prisma migrate dev`)
- required stubs under `src/server/**`, `src/actions/**`, and `src/app/api/**` directories

