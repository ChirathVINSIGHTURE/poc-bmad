# Story 2.6: Conflict on reserve (already reserved) with in-context recovery

Status: review

## Story
As an employee,
I want a clear message when a slot gets reserved by someone else first,
So that I can quickly choose another slot without confusion.

## Implements
FR6, FR19, FR20

## Acceptance Criteria
1. **Given** I attempt to reserve a slot that became unavailable  
   **When** the server returns a conflict  
   **Then** I see an inline neutral message ("Someone else reserved it just before you. Pick another slot.")
2. **Given** a conflict occurs  
   **When** the UI updates  
   **Then** the slot is shown as Reserved and I remain on the same date and grid
3. **Given** I select another available slot after conflict  
   **When** I confirm  
   **Then** the reservation succeeds (happy path)

## Tasks / Subtasks
- [x] Task 1: Normalize reserve conflict semantics for UI-safe handling (AC: 1, 2)
  - [x] Subtask 1.1: Keep `POST /api/reservations` returning HTTP `409` with stable error shape `{ error: { code, message } }` when `createReservation()` detects Prisma `P2002`
  - [x] Subtask 1.2: Confirm conflict `code` remains `CONFLICT` and message is user-safe and non-leaky
  - [x] Subtask 1.3: Ensure non-conflict failures keep their existing safe error behavior

- [x] Task 2: Add explicit in-context conflict UX on dashboard (AC: 1, 2)
  - [x] Subtask 2.1: In `src/app/components/AvailabilityDateSelection.tsx`, branch on `error.code === "CONFLICT"` in `reserveSelectedSlot()`
  - [x] Subtask 2.2: Show inline neutral conflict copy near the selection/status area: "Someone else reserved it just before you. Pick another slot."
  - [x] Subtask 2.3: Preserve context after conflict: do not navigate away, do not reset `activeDate`, keep grid visible and interactive
  - [x] Subtask 2.4: Keep behavior deterministic for assistive tech by announcing conflict via existing `aria-live` message region

- [x] Task 3: Force post-conflict state reconciliation from server truth (AC: 2)
  - [x] Subtask 3.1: After conflict, call `refreshForDate(activeDate)` to re-fetch availability
  - [x] Subtask 3.2: Ensure newly reserved slot renders as `Reserved` and is non-selectable
  - [x] Subtask 3.3: Preserve date input and selected date state; user remains in the same flow

- [x] Task 4: Validate alternate-slot recovery path (AC: 3)
  - [x] Subtask 4.1: After conflict, user can select another available slot and submit without full-page reload
  - [x] Subtask 4.2: On success after retry, preserve Story 2.5 behavior: success confirmation + refreshed grid + receipt link to `My reservations`
  - [x] Subtask 4.3: Ensure stale selection is cleared if selected slot is now reserved after refresh

- [x] Task 5: Regression and quality checks
  - [x] Subtask 5.1: Verify Story 2.5 happy path is unchanged
  - [x] Subtask 5.2: Verify date selection behavior from Story 2.2 remains unchanged (invalid date keeps previous active date)
  - [x] Subtask 5.3: Run `npm run lint`
  - [x] Subtask 5.4: Run `npm run build`

## Dev Notes

### Previous Story Intelligence (from Story 2.5)
- Conflict UI was explicitly deferred to Story 2.6; backend conflict mapping already exists and should be reused, not reimplemented.
- Current reserve success path in `AvailabilityDateSelection` already refreshes availability and shows confirmation; keep this path intact.
- `My reservations` route exists and should remain the stable receipt link after successful reserve.

### Technical Guardrails
- Do not introduce new reservation endpoints for this story; extend existing `POST /api/reservations` contract.
- Do not change reservation date model; keep date-only `YYYY-MM-DD`.
- Keep API error payload shape consistent (`{ error: { code, message } }`) and avoid string-only error responses.
- Keep conflict wording neutral (no blame language), aligned with UX guidance.

### Architecture Compliance
- Route Handlers remain API boundary; business logic stays in server domain modules.
- Conflict must remain deterministic (`409` for double-booking), mapped from DB uniqueness constraint.
- Server-authoritative refresh after mutation/error is required to avoid phantom/stale state.
- Avoid leaking internals in error messages.

### Library / Framework Notes
- Prisma known request error handling pattern for unique constraints (`P2002`) remains best-practice for conflict detection.
- Next.js App Router route handlers should return expected API errors as response values (not uncaught throws).

### File Structure Requirements
- Primary implementation file: `src/app/components/AvailabilityDateSelection.tsx`
- Confirm/retain conflict mapping in: `src/app/api/reservations/route.ts`
- Conflict source in domain: `src/server/domain/reservations.ts`
- Do not move dashboard flow out of `src/app/page.tsx` + `AvailabilityDateSelection` in this story.

### Testing Requirements
- Manual scenario 1: two sessions reserve same slot/date; losing session gets conflict message and remains in context.
- Manual scenario 2: after conflict, same user selects another slot and successfully reserves.
- Manual scenario 3: conflict message announced and visible while keyboard flow remains operable.
- Keep lint/build green before moving to code review.

### References
- Epic story definition and ACs: `"_bmad-output/planning-artifacts/epics.md"` (Story 2.6)
- Functional intent and recoverable conflict journey: `"_bmad-output/planning-artifacts/prd.md"` (Journey 3, FR6/FR19/FR20)
- API and error semantics: `"_bmad-output/planning-artifacts/architecture.md"` (API format/status + conflict handling)
- UX conflict copy and in-context recovery pattern: `"_bmad-output/planning-artifacts/ux-design-specification.md"` (feedback patterns + journey flow)
- Project-specific implementation constraints: `"_bmad-output/project-context.md"` (existing API shapes, date format, code style)
- Prior implementation context: `"_bmad-output/implementation-artifacts/2-5-reserve-selected-slot-happy-path-receipt-consistency.md"`

## Change Log
- Extracted Prisma `P2002` -> API-safe `{ code: "CONFLICT", message: "..." }` mapping into a testable helper:
  - `src/server/domain/reservationCreateErrorMapper.js`
- Updated `createReservation()` to use the extracted conflict mapper (behavior unchanged; stable 409 semantics preserved)
- Implemented in-context conflict UX in the dashboard reservation component:
  - Neutral recovery copy on `error.code === "CONFLICT"` (aria-live polite)
  - Re-fetch availability via `refreshForDate(activeDate)` without changing the active date
- Added unit tests (Node built-in runner) for:
  - conflict error mapping helper
  - conflict UI message helper

## Dev Agent Record

### Agent Model Used
gpt-5.3-codex-low

### Debug Log References
- `node --test tests/unit/*.test.js`
- `npm run lint`
- `npm run build`

### Completion Notes List
- Implemented Story 2.6 conflict recovery behavior end-to-end:
  - Backend: stable conflict error semantics for unique constraint violations (HTTP 409)
  - Frontend: neutral in-context message + server-truth reconciliation on conflict

### File List
- `_bmad-output/implementation-artifacts/2-6-conflict-on-reserve-already-reserved-with-in-context-recovery.md`
- `src/app/components/AvailabilityDateSelection.tsx`
- `src/server/domain/reservations.ts`
- `src/server/domain/reservationCreateErrorMapper.js`
- `src/server/domain/reservationCreateErrorMapper.d.ts`
- `src/lib/reservationConflictUiMessages.js`
- `src/lib/reservationConflictUiMessages.d.ts`
- `tests/unit/reservationCreateErrorMapper.test.js`
- `tests/unit/reservationConflictUiMessages.test.js`
