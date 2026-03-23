# Story 2.8: Cancel reservation (happy path + idempotent feel)

Status: review

## Story
As an employee,
I want to cancel my reservation,
So that the slot becomes available to others.

## Implements
FR7, FR18

## Acceptance Criteria
1. **Given** I own a reservation  
   **When** I cancel it  
   **Then** the reservation is removed and I see clear success feedback

2. **Given** cancellation succeeds  
   **When** the UI refreshes  
   **Then** the slot shows as available for that date and the receipt list updates

3. **Given** I retry cancel (double click / refresh)  
   **When** the system treats it as already cancelled or not found  
   **Then** the UI does not end in a confusing state and communicates the outcome safely

## Tasks / Subtasks
- [x] Task 1: Implement cancel backend (domain + DELETE API)
  - [x] Subtask 1.1: Implement `cancelReservation()` in `src/server/domain/reservations.ts`
    - Must delete the reservation for the provided `reservationId` and authenticated `employeeId`
    - Must treat “not found” as **idempotent success** (already cancelled) rather than a confusing error
    - Must return a response object shaped like existing `createReservation()`:
      - success: `{ ok: true, message?: string }` (message optional but preferred for UI idempotent copy)
      - failure: `{ ok: false, code: string, message: string }`
  - [x] Subtask 1.2: Implement `DELETE /api/reservations/:id` in `src/app/api/reservations/[id]/route.ts`
    - Authenticate via `getServerSession(authOptions)` and derive `employeeId` from `session.user`
    - If unauthenticated, return `401` with safe error payload via `apiError(...)`
    - If `cancelReservation()` returns:
      - conflict/idempotent success: return `200` with `{ data: { ok: true, message } }`
      - forbidden (non-owner) or other errors: map to safe HTTP status + payload using existing conventions (use `apiError`)
    - Ensure response JSON matches the UI contract used by `CancelReservationButton`
- [x] Task 2: Update cancel UI for success + idempotent outcomes
  - [x] Subtask 2.1: Update `src/app/reservations/CancelReservationButton.tsx`
    - On API success (`json.data.ok === true`), set the message from `json.data.message` when present; otherwise fall back to `"Reservation cancelled."`
    - Preserve the current “Cancelling...” in-progress state and keep `aria-live="polite"` for announcements
    - Ensure the button calls `router.refresh()` after successful cancellation to update the receipt list
  - [x] Subtask 2.2: Preserve existing error mapping behavior for placeholder/unimplemented backend:
    - `501` with `{ data: { message: "Not implemented" } }` must still produce the safe placeholder message from `getCancelErrorMessage()`
- [ ] Task 3: Ensure slot availability reflects cancellation
  - [x] Subtask 3.1: Verify `getAvailabilityForDate()` reads from the reservations source of truth so deleted reservations immediately remove the slot’s reserved state
  - [x] Subtask 3.2: Manually verify the end-to-end: cancel -> navigate back to dashboard -> select the same date -> slot is available
- [x] Task 4: Regression and quality gates
  - [x] Subtask 4.1: Run `npm run lint` passes
  - [x] Subtask 4.2: Run `npm run build` passes
- [x] Task 5: Add minimal automated tests (recommended)
  - [x] Subtask 5.1: Add unit tests for any new UI message extraction/success mapping helper introduced to support idempotent copy
  - [x] Subtask 5.2: Prefer JS wrappers/helpers for domain logic if DB-backed unit tests are not available in this repo (keep `node --test` approach)

## Dev Notes
### Prior story context (Story 2.7)
- Story 2.7 added the cancel entry point per reservation row:
  - `src/app/reservations/page.tsx` now renders `CancelReservationButton` for each reservation row
  - `src/app/reservations/CancelReservationButton.tsx` already:
    - shows in-progress state (“Cancelling...”)
    - calls `DELETE /api/reservations/:id`
    - shows safe error messages via `getCancelErrorMessage()`
    - treats success only when `json.data.ok === true`

### Current backend reality (before this story)
- `src/app/api/reservations/[id]/route.ts` DELETE is a `501 Not implemented` placeholder
- `cancelReservation()` in `src/server/domain/reservations.ts` is also a placeholder returning `{ ok: false, message: "Not implemented" }`

### What this story must add
- A real backend cancellation path that:
  - deletes reservations for the authenticated employee
  - updates the availability query path by removing the reservation row
  - returns idempotent success for retries (already cancelled / not found)
- A UI adjustment so the client can show:
  - `"Reservation cancelled."` on first cancel
  - `"Reservation already cancelled."` (or similar) on retries

### Technical guardrails
- Keep date-only semantics (`YYYY-MM-DD`) as already established.
- Keep error payload shape consistent with existing conventions (`apiError(code, message)`).
- Avoid “fake success”: only set success message after the API indicates success (`json.data.ok === true`).

## Dev Agent Record

### Agent Model Used
gpt-5.3-codex-low

### Debug Log References

- `node --test tests/unit/*.test.js`
- `npm run lint`
- `npm run build`

### Completion Notes List

- Implemented idempotent cancellation backend:
  - `cancelReservation()` deletes matching reservation rows for the authenticated `employeeId`
  - not-found / already-cancelled maps to idempotent success with a safe message
- Implemented `DELETE /api/reservations/:id` to return `{ data: { ok: true, message } }` on success
- Updated `CancelReservationButton` to show API-provided success message (including idempotent “already cancelled”)
- Added JS helper unit tests for:
  - idempotent success message selection from delete count
  - UI success message extraction behavior

### File List

- `src/server/domain/cancelReservationResultFromCount.js`
- `src/server/domain/cancelReservationResultFromCount.d.ts`
- `src/lib/cancelReservationSuccessUiMessages.js`
- `src/lib/cancelReservationSuccessUiMessages.d.ts`
- `src/server/domain/reservations.ts`
- `src/app/api/reservations/[id]/route.ts`
- `src/app/reservations/CancelReservationButton.tsx`
- `tests/unit/cancelReservationResultFromCount.test.js`
- `tests/unit/cancelReservationSuccessUiMessages.test.js`

