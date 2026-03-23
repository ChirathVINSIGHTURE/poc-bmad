# Story 2.9: Ownership enforcement on cancel (employee-only)

Status: review

## Story
As an employee,
I want the app to prevent cancelling reservations that aren’t mine,
So that reservation ownership is respected.

## Implements
FR21

## Acceptance Criteria
1. **Given** I attempt to cancel a reservation I do not own  
   **When** I submit the cancel request  
   **Then** the server rejects it (HTTP `403`) and the UI shows a safe error message.

2. **Given** I do not own the reservation  
   **When** I view the employee UI  
   **Then** I do not see cancel actions for non-owned reservations.

## Tasks / Subtasks
- [x] Task 1: Enforce ownership at the backend cancel boundary
  - [x] Subtask 1.1: Update `cancelReservation()` in `src/server/domain/reservations.ts`
    - Keep existing idempotent success semantics for “not found” (reservation id does not exist) as required by Story 2.8
    - Add explicit non-owner handling:
      - If the reservation exists but `reservation.employeeId !== employeeId` -> return:
        - `{ ok: false, code: "FORBIDDEN", message: "<safe user message>" }`
      - The employee should NOT receive idempotent “already cancelled” for the non-owner case.
    - Use the current data model where `Reservation.employeeId` stores ownership.
  - [x] Subtask 1.2: Update `DELETE /api/reservations/:id` in `src/app/api/reservations/[id]/route.ts`
    - Map `{ code: "FORBIDDEN" }` to HTTP `403` using the existing `apiError(code, message)` shape.
    - Keep existing success response contract expected by `CancelReservationButton`:
      - `{ data: { ok: true, message } }` with HTTP `200`.
  - [x] Subtask 1.3: Ensure the API response keeps payload shape consistent with `CancelReservationButton`
    - The UI should continue to be able to extract `error.message` from `apiError(...)` responses.

- [x] Task 2: Validate cancel UI behavior for 403
  - [x] Subtask 2.1: Verify `src/app/reservations/CancelReservationButton.tsx` displays the safe `apiError` message when it receives HTTP `403`
    - It already uses `getCancelErrorMessage(json)` on `!resp.ok`; confirm the mapper pulls from `error.message` (not from `data.message`).
  - [x] Subtask 2.2: Ensure the in-progress state and aria-live message behavior remains unchanged:
    - “Cancelling...” while the request is in-flight
    - message announced via `aria-live="polite"`

- [x] Task 3: Ensure employee UI never exposes cancel actions for non-owned reservations
  - [x] Subtask 3.1: Confirm `src/server/domain/reservations.ts` `listReservationsForEmployee(employeeId)` always scopes by `employeeId`
  - [x] Subtask 3.2: Confirm `src/app/reservations/page.tsx` renders `CancelReservationButton` only for reservations returned by `listReservationsForEmployee`

- [x] Task 4: Add unit-testable authorization mapping helpers
  - [x] Subtask 4.1: Add a small JS helper (unit-testable with `node --test`) that derives cancel outcomes from:
    - delete count (0 vs >0)
    - “reservation exists” + “reservation owner id” relative to requesting `employeeId`
  - [x] Subtask 4.2: Add unit tests for:
    - not-found -> `{ ok: true, message: "Reservation already cancelled." }`
    - non-owner -> `{ ok: false, code: "FORBIDDEN", message: safe }`
    - owner -> `{ ok: true, message: "Reservation cancelled." }`

- [x] Task 5: Regression and quality gates
  - [x] Subtask 5.1: Run `node --test tests/unit/*.test.js`
  - [x] Subtask 5.2: Run `npm run lint`
  - [x] Subtask 5.3: Run `npm run build`

## Dev Notes
### Prior story context (Story 2.8)
- Story 2.8 implemented cancellation via:
  - `cancelReservation()` using Prisma `deleteMany({ id, employeeId })`
  - `DELETE /api/reservations/:id` returning `{ data: { ok: true, message } }`
  - `CancelReservationButton` mapping errors via `getCancelErrorMessage(...)`
- The current idempotent behavior returns success even when the reservation id exists but belongs to a different employee (because `deleteMany` returns `count=0`).

### What this story changes
- Story 2.9 tightens correctness:
  - Not-found / already cancelled remains idempotent success
  - Non-owner cancellation becomes a `403 FORBIDDEN` with a safe message

### Current implementation realities you must respect
- Current `CancelReservationButton` expects:
  - success: `json.data.ok === true`
  - error: `apiError` payload shape where `error.message` is user-safe
- `Reservation` model includes `employeeId`, so ownership can be enforced reliably by querying reservation ownership by `reservationId`.

### Implementation guardrails
- Avoid leaking internal details in 403 message.
- Do not change cancel success/idempotent copy introduced in Story 2.8.
- Keep date-only semantics unchanged (no date logic required in this ownership enforcement story).

## Dev Agent Record

### Agent Model Used
gpt-5.3-codex-low

### Debug Log References
- N/A

### Completion Notes List
- Implemented `findUnique` + ownership check before delete; non-owners receive `FORBIDDEN` with user-safe copy (no idempotent success).
- Added pure JS helper `getCancelReservationOutcome` in `src/server/domain/cancelReservationOutcome.js` with `node --test` coverage; removed legacy `cancelReservationResultFromCount` module.
- `DELETE /api/reservations/:id` maps `FORBIDDEN` → HTTP 403; success contract unchanged.
- Confirmed `listReservationsForEmployee` scopes by `employeeId` and My Reservations page only renders cancel for listed rows.
- Added UI message test asserting `apiError` / `error.message` path for 403 payloads.
- Quality: `node --test tests/unit/*.test.js`, `npm run lint`, `npm run build` — all passing.

### Implementation Plan
- Red: added outcome unit tests for not-found / non-owner / owner paths.
- Green: domain lookup + `deleteMany` only after owner match; route 403 mapping.
- Refactor: centralized outcome mapping in `cancelReservationOutcome.js`.

### File List
- `src/server/domain/cancelReservationOutcome.js` (new)
- `src/server/domain/cancelReservationOutcome.d.ts` (new)
- `src/server/domain/reservations.ts` (modified)
- `src/app/api/reservations/[id]/route.ts` (modified)
- `tests/unit/cancelReservationOutcome.test.js` (new)
- `tests/unit/cancelReservationUiMessages.test.js` (modified)
- `src/server/domain/cancelReservationResultFromCount.js` (deleted)
- `src/server/domain/cancelReservationResultFromCount.d.ts` (deleted)
- `tests/unit/cancelReservationResultFromCount.test.js` (deleted)
- `_bmad-output/implementation-artifacts/2-9-ownership-enforcement-on-cancel-employee-only.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log
- Created Story 2.9 context for backend ownership enforcement on cancel.
- 2026-03-19: Enforced cancel ownership (403 FORBIDDEN), outcome helper + tests, route mapping; removed `cancelReservationResultFromCount` in favor of `cancelReservationOutcome`.
