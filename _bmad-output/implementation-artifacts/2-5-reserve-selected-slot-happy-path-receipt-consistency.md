# Story 2.5: Reserve selected slot (happy path) + receipt consistency

Status: review

## Story
As an employee,
I want to reserve my selected slot for the chosen date,
So that I have a confirmed parking commitment.

## Implements
FR5, FR8, FR17, FR18, FR24

## Acceptance Criteria
1. **Given** I have selected an available slot  
   **When** I confirm reservation  
   **Then** the system creates the reservation and I see a clear success confirmation
2. **Given** reservation succeeds  
   **When** the UI updates  
   **Then** the dashboard shows I have a reservation for that date and the slot is marked reserved
3. **Given** reservation succeeds  
   **When** I open “My reservations”  
   **Then** the new reservation is listed (receipt consistency)

## Tasks / Subtasks
- [x] Task 1: Implement reserve (create reservation) for employee
  - [x] Subtask 1.1: Implement `createReservation()` in `src/server/domain/reservations.ts` using Prisma `Reservation` model
  - [x] Subtask 1.2: Implement `POST /api/reservations` to create the reservation from `{ slotId, date }` (uses session for employee identity)
  - [x] Subtask 1.3: Handle unique constraint conflicts as `409 CONFLICT` (future UI handling covered by Story 2.6)

- [x] Task 2: Reserve selected slot from the dashboard UI
  - [x] Subtask 2.1: Add a “Reserve slot” button when an available slot is selected
  - [x] Subtask 2.2: After success, show a clear success confirmation
  - [x] Subtask 2.3: After success, refresh availability so the slot becomes marked reserved
  - [x] Subtask 2.4: Add a link to open “My reservations” after success

- [x] Task 3: Dashboard reserved-state update
  - [x] Subtask 3.1: Ensure availability refresh recomputes `state` using reservations for the active date

- [x] Task 4: “My reservations” list shows the new reservation
  - [x] Subtask 4.1: Add `src/app/reservations/page.tsx` to list upcoming reservations for the signed-in employee

- [ ] Task 5: Validation (CI baseline)
  - [x] Subtask 5.1: `npm run lint` passes
  - [x] Subtask 5.2: `npm run build` passes

## Dev Notes
- Slot availability uses DB-backed availability computation (`GET /api/slots?date=...`) by checking `Reservation` rows for that date.
- Conflict UI for “Someone else reserved it just before you…” is handled in Story 2.6.

## Dev Agent Record
N/A

