# Story 1.2: Configure SSO authentication (Auth.js) + session strategy

Status: review

## Story

As an employee,
I want to sign in using corporate SSO,
So that I can access the parking reservation app securely without managing a separate password.

## Acceptance Criteria

1. **Given** a user is not authenticated
   **When** they access the app
   **Then** they are redirected to SSO sign-in
2. **Given** the user successfully authenticates via SSO
   **When** they return to the app
   **Then** they have an active session and can access employee pages
3. **Given** authentication fails or is cancelled
   **When** the user returns to the app
   **Then** they see a clear, actionable error state (retry) without exposing sensitive details

## Tasks / Subtasks

- [x] Task 1: Align Auth.js implementation + dependency versions
  - [x] Subtask 1.1: Confirmed legacy NextAuth v4 setup (repo uses `next-auth@4`); aligned to `@next-auth/prisma-adapter`
  - [x] Subtask 1.2: Updated `package.json` dependencies to a consistent set (`@next-auth/prisma-adapter` + `next-auth@4`)
  - [x] Subtask 1.3: Confirmed `npm run build` compiles after dependency changes

- [x] Task 2: Configure Prisma-backed sessions (database session strategy)
  - [x] Subtask 2.1: Updated `src/server/auth/auth.ts` to use `PrismaAdapter` and the Prisma client
  - [x] Subtask 2.2: Set session strategy to `database` (not JWT-only)
  - [x] Subtask 2.3: Verified server-side session retrieval via `getServerSession` (used in `src/app/page.tsx`)

- [x] Task 3: Add/adjust required Prisma models for Auth.js adapter
  - [x] Subtask 3.1: Updated `prisma/schema.prisma` to include adapter-required models (`Account`, `Session`, `VerificationToken`)
  - [x] Subtask 3.2: Extended `User` model with adapter-required fields (`email`, `accounts`, `sessions`, etc.) while keeping `employeeId` and app role model
  - [x] Subtask 3.3: Applied schema changes to the DB (non-interactive environment: used `prisma db push` + `prisma generate`)

- [x] Task 4: Wire Auth.js route handler correctly
  - [x] Subtask 4.1: Verified `src/app/api/auth/[...nextauth]/route.ts` exports the NextAuth handler wired to the updated `authOptions`
  - [x] Subtask 4.2: Redirect target exists (`/api/auth/signin`) and is handled via guard + NextAuth sign-in route

- [x] Task 5: Protect app access + implement redirect-to-SSO behavior
  - [x] Subtask 5.1: Implemented server-side guard in `src/app/page.tsx` to redirect unauthenticated users to sign-in
  - [x] Subtask 5.2: Ensured authenticated access returns the employee landing content
  - [x] Subtask 5.3: Guard is server-enforced via `getServerSession` + `redirect()`

- [x] Task 6: Failure/cancel behavior + safe error messaging
  - [x] Subtask 6.1: Implemented user-safe retry messaging when `searchParams.error` is present
  - [x] Subtask 6.2: Error UI is rendered in `src/app/page.tsx` without leaking provider internals

- [x] Task 7: Update `.env.example` for SSO + Auth.js
  - [x] Subtask 7.1: Confirmed `.env.example` already contains `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `DATABASE_URL` required for this scaffold
  - [x] Subtask 7.2: No secrets were added/committed; placeholders remain

- [x] Task 8: Validation
  - [x] Subtask 8.1: `npm run lint` passes
  - [x] Subtask 8.2: `npm run build` passes

## Dev Notes

### Developer guidance from architecture + project context

- Architecture requires DB-backed sessions and Prisma integration for admin/support security posture.
  - [Source: `architecture.md` "Authentication & Security" + "Session strategy" sections]
- Use REST-style APIs via Route Handlers for application interactions. For auth, the route handler is the Auth.js boundary.
  - [Source: `architecture.md` "API & Communication Patterns"]
- Keep auth enforcement server-side:
  - [Source: `architecture.md` "Authorization enforcement (critical)"]
- Date format and API response contract rules continue to apply; do not introduce timezone mixing in identity/date logic.
  - [Source: `project-context.md` "Date format" + "API contract (current)"]

### Anti-patterns to avoid (from earlier review findings)

- Do not keep `session: { strategy: "jwt" }` while claiming database-backed sessions.
- Do not mix NextAuth v4 APIs with `@auth/prisma-adapter` v5 expectations.
- Ensure `[...nextauth]` route path exists with correct folder naming and exports.

### Current repo assumptions (so implementer doesn’t guess)

- Repo currently contains scaffolded Auth/Auth route files:
  - `src/server/auth/auth.ts`
  - `src/app/api/auth/[...nextauth]/route.ts`
- Repo currently has a Prisma schema with app-specific models (`User`, `Slot`, `Reservation`, `AuditEvent`).

## Project Structure Notes

- Prefer `src/server/**` for auth/domain helpers.
- Update only what this story requires:
  - `src/server/auth/auth.ts`
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `prisma/schema.prisma` (and migrations created during dev)
  - `.env.example`
  - (Optional) a guard/middleware file if required for redirect behavior

## Dev Agent Record

### Agent Model Used

N/A

### Completion Notes List

- Updated authentication to use PrismaAdapter + **database-backed sessions**.
- Implemented server-side redirect guard in `src/app/page.tsx` to send unauthenticated users to `/api/auth/signin`.
- Added safe retry messaging when returning with `?error=...` (no sensitive details exposed).
- Updated Prisma schema with adapter-required models and applied changes to the DB (via `prisma db push` + `prisma generate`).
- Verified locally: `npm run lint` and `npm run build` both succeed.

### File List

- Modified/required for this story:
  - `package.json` (swap to `@next-auth/prisma-adapter`)
  - `prisma/schema.prisma` (adapter-required models)
  - `src/server/auth/auth.ts` (PrismaAdapter + `session: { strategy: "database" }`)
  - `src/app/page.tsx` (server-side guard + error retry UI)
  - `src/app/api/auth/[...nextauth]/route.ts` (verified wiring; no functional changes needed beyond updated authOptions)

