# Story 2.7: My reservations list + cancel entry point

Status: review

## Story
As an employee,
I want to view my upcoming reservations,
So that I can manage plans and cancel if needed.

## Implements
FR8, FR17

## Acceptance Criteria
1. **Given** I have one or more reservations  
   **When** I navigate to “My reservations”  
   **Then** I see a list of my upcoming reservations (date + slot) with a cancel action

2. **Given** I have no reservations  
   **When** I navigate to “My reservations”  
   **Then** I see a clear empty state and a link back to the dashboard

3. **Given** I am not authenticated  
   **When** I attempt to access “My reservations”  
   **Then** I’m redirected to sign-in

## Tasks / Subtasks
- [x] Task 1: Add cancel entry point to each “My reservations” row (AC 1)
  - [x] Subtask 1.1: Update `src/app/reservations/page.tsx` so each reservation row includes an explicit **Cancel** action (button/link) for that reservation.
  - [x] Subtask 1.2: If the cancel action requires client-side interaction, introduce a small client component (for example `src/app/reservations/CancelReservationButton.tsx`) and keep `page.tsx` as a server component.
  - [x] Subtask 1.3: Implement the cancel click flow to call `DELETE /api/reservations/:id` and show:
    - an in-progress state (e.g., “Cancelling…”),
    - and a safe error message if the request fails.
  - [x] Subtask 1.4: Do not claim cancellation succeeded unless the API returns success; handle the current backend placeholder response shape safely (see Dev Notes).
  - [x] Subtask 1.5: Ensure the cancel action is accessible (visible label, keyboard reachable, clear focus/announcement behavior; do not rely on color-only state).

- [x] Task 2: Preserve existing empty state + auth redirect behavior (AC 2, AC 3)
  - [x] Subtask 2.1: Do not regress the existing empty state copy and “Back to dashboard” link in `src/app/reservations/page.tsx`.
  - [x] Subtask 2.2: Keep unauthenticated behavior as-is: redirect to `/api/auth/signin?callbackUrl=%2Freservations`.

- [x] Task 3: Regression and quality gates
  - [x] Subtask 3.1: Run `npm run lint` passes
  - [x] Subtask 3.2: Run `npm run build` passes

## Dev Notes
### Existing state (what is already implemented)
- `src/app/reservations/page.tsx` already:
  - redirects unauthenticated users to the sign-in flow,
  - loads reservations via `listReservationsForEmployee(employeeId)`,
  - renders an empty state with a link back to `/` when `reservations.length === 0`,
  - and renders a list of reservation rows showing `slotId` and `date`.
- What’s missing for Story 2.7: each reservation row currently does **not** include a **cancel action**.

### Important backend/UX constraint for this story boundary
- `DELETE /api/reservations/:id` is currently a **placeholder** that returns HTTP `501` with `{ data: { ok: false, message: "Not implemented" } }`.
- Therefore, for Story 2.7 the cancel entry point must:
  - exist in the UI (AC 1),
  - attempt the API call,
  - and show safe, non-misleading feedback when cancel is not implemented yet.
- Story 2.8 will complete the cancel mutation + success + idempotent feel; this story should not “fake” success.

### UI wiring guidance
- The cancel action should be placed on each list item so the employee can cancel a specific upcoming reservation.
- Prefer a lightweight client component for click handling so the server-rendered page remains simple.
- Error parsing should be tolerant of both:
  - API-safe error shape: `{ error: { code, message } }`,
  - and placeholder shape: `{ data: { message } }`.

### Technical guardrails (implementation consistency)
- Keep date-only semantics: display `date` as returned by `listReservationsForEmployee()` (already slice-normalized).
- Reuse the existing source of truth for reservations list: `listReservationsForEmployee(employeeId)`.

## Change Log
- Added a cancel entry point for each reservation row (Story 2.7 UI boundary).
- Implemented `CancelReservationButton` (client) to call `DELETE /api/reservations/:id` and:
  - show “Cancelling...” in-progress state,
  - show a safe error message for placeholder `501 Not implemented`,
  - only show success when backend returns `data.ok === true`.
- Added a small user-safe message mapper for cancel-flow errors (unit tested).

## Dev Agent Record

### Agent Model Used
gpt-5.3-codex-low

### Debug Log References
- `node --test tests/unit/*.test.js`
- `npm run lint`
- `npm run build`

### Completion Notes List
- Implemented Story 2.7 cancel entry point:
  - Frontend: cancel button + in-progress + aria-live safe error messaging
  - Backend contract handling: placeholder `501`/`data.message="Not implemented"` is mapped to user-safe copy

### File List
- `_bmad-output/implementation-artifacts/2-7-my-reservations-list-cancel-entry-point.md`
- `src/app/reservations/page.tsx`
- `src/app/reservations/CancelReservationButton.tsx`
- `src/lib/cancelReservationUiMessages.js`
- `src/lib/cancelReservationUiMessages.d.ts`
- `tests/unit/cancelReservationUiMessages.test.js`

