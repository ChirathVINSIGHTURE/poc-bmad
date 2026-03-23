# Story 2.1: Slot inventory baseline + list/legend (employee-visible)

Status: review

## Story
As an employee,
I want to see the list of parking slots,
So that I understand what I can reserve.

## Acceptance Criteria
1. **Given** I am signed in
   **When** I open the dashboard
   **Then** I can see the list of configured parking slots (e.g., P01–P24)
2. **Given** slot inventory is configured
   **When** the dashboard loads
   **Then** slots display a consistent identifier and an accessible label
3. **Given** slot inventory is persisted in the system of record
   **When** the app is deployed/restarted
   **Then** the same slot set remains available (seeded/configured via DB-backed mechanism; not in-memory only)
4. **Given** slot inventory is empty or misconfigured
   **When** I open the dashboard
   **Then** I see a clear empty state explaining that no slots are available

## Tasks / Subtasks
- [x] Task 1: Implement DB-backed slot inventory retrieval
  - [x] Subtask 1.1: Implement/upgrade `src/app/api/slots/route.ts` to return `{ data: { slots: [...] } }` for `GET`.
  - [x] Subtask 1.2: Ensure the slots come from Prisma `Slot` table (not in-memory).
  - [x] Subtask 1.3: Define and enforce a consistent slot shape/fields used by the UI (at minimum `slotId` and `id`).
  - [x] Subtask 1.4: Ensure unauthenticated requests are rejected (401) consistently with existing API error contract.

- [x] Task 2: Ensure slot inventory persistence (seeding/config)
  - [x] Subtask 2.1: Add a DB-backed seeding/config mechanism that ensures a default slot set exists (if DB is empty).
  - [x] Subtask 2.2: Make seeding idempotent (running multiple times does not duplicate slots).
  - [x] Subtask 2.3: Prefer a server-side helper invoked by the slot read path (or an initial migration/seed step if already supported).

- [x] Task 3: Update dashboard to render slot list + empty states
  - [x] Subtask 3.1: Update `src/app/page.tsx` (server component) to render the slot list when signed in.
  - [x] Subtask 3.2: Add accessible labeling (e.g., `aria-label` or accessible text) for each slot row/item.
  - [x] Subtask 3.3: When slot list is empty, render a clear empty state and include a way to retry/reload if data fetch fails.

- [ ] Task 4: Validation (CI baseline)
  - [x] Subtask 4.1: `npm run lint` passes
  - [x] Subtask 4.2: `npm run build` passes

## Dev Notes
### Architecture + project constraints
- Project uses Next.js App Router with server-first reads.
- Authorization enforcement is server-side (do not rely only on UI hiding).
- Slot inventory is persisted in the system of record (DB-backed seed/config), not in-memory.
- Error UX for empty/misconfigured data should be clear and actionable.

### Anti-patterns to avoid
- Do not hardcode slots in the UI only.
- Do not create slots on every request without idempotency.
- Do not return ad-hoc API response shapes; use `{ data: ... }` and `{ error: { code, message } }`.

### References
- Story requirements: `epics.md` “Story 2.1: Slot inventory baseline + list/legend (employee-visible)”
- Error contract: `src/server/api/errors.ts` and `src/server/api/responses.ts`
- Auth/session guard pattern: `src/app/page.tsx` (server-enforced redirect)

## Dev Agent Record
### Agent Model Used
N/A

### Debug Log References

### Completion Notes List
N/A

### File List
N/A

