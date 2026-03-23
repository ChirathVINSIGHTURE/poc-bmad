# Story 2.3: Availability states in grid (available vs reserved)

Status: review

## Story
As an employee,
I want to see which slots are available vs reserved for a selected date,
So that I can choose an open spot quickly.

## Implements
FR2, FR3, FR15

## Acceptance Criteria
1. **Given** a selected date  
   **When** availability loads  
   **Then** each slot is shown as Available or Reserved for that date
2. **Given** a slot is reserved  
   **When** I view the grid  
   **Then** the slot is clearly non-selectable and its state is communicated without relying on color alone
3. **Given** availability fails to load  
   **When** the dashboard is shown  
   **Then** I see an actionable error state with a retry option

## Tasks / Subtasks
- [x] Task 1: Implement reserved/available state computation
  - [x] Subtask 1.1: Update the availability endpoint used by the dashboard to accept the selected date (`GET /api/slots?date=YYYY-MM-DD`)
  - [x] Subtask 1.2: Compute per-slot `state` as `available` or `reserved` by checking `Reservation` rows for the selected date
  - [x] Subtask 1.3: Ensure the API returns consistent slot items with both identity and state (at minimum: `slotId`, `state`)

- [x] Task 2: Update UI grid rendering for states + non-selectable behavior
  - [x] Subtask 2.1: Replace the current baseline slot list with a grid that displays each slot’s state as text (e.g., “Available” / “Reserved”)
  - [x] Subtask 2.2: Make reserved slots non-selectable (no selection + no misleading click targets)
  - [x] Subtask 2.3: Ensure accessibility: communicate state via text and/or `aria` (not color-only)

- [x] Task 3: Error + retry UX
  - [x] Subtask 3.1: If the availability fetch fails, show an actionable error state (not blank UI)
  - [x] Subtask 3.2: Provide a “Retry” control that re-fetches for the currently active date

- [x] Task 4: Validation (CI baseline)
  - [x] Subtask 4.1: `npm run lint` passes
  - [x] Subtask 4.2: `npm run build` passes

## Dev Notes
- `Reservation` schema includes `slotId` and `date` (`@db.Date`) with `@@unique([slotId, date])`.
- This story should not implement conflict handling on reserve (reserved vs available display only); that happens in later stories.
- This story complements Story `2-2` (date selection) by making the grid state date-dependent.

## Dev Agent Record
N/A

