# Story 2.2: Date selection for availability

Status: review

## Story
As an employee,
I want to select a date,
So that I can view parking availability for that day.

## Implements
FR14

## Acceptance Criteria
1. **Given** I am on the dashboard  
   **When** I change the selected date  
   **Then** the availability view refreshes for that date
2. **Given** I am using keyboard only  
   **When** I interact with the date control  
   **Then** I can change dates and continue to the grid without keyboard traps
3. **Given** an invalid date is entered (if editable)  
   **When** I attempt to apply it  
   **Then** I see a clear validation message and the previous date remains active

## Tasks / Subtasks
- [x] Task 1: Add accessible date picker / date control UI
  - [x] Subtask 1.1: Add a date control on the dashboard with an accessible label
  - [x] Subtask 1.2: Ensure keyboard-only interaction works (no traps, visible focus)
  - [x] Subtask 1.3: Define “previous/active date” state semantics for invalid inputs

- [x] Task 2: Refresh availability when selected date changes
  - [x] Subtask 2.1: When a valid date is entered/changed, trigger a refresh of the availability view
  - [x] Subtask 2.2: Fetch availability via `GET /api/slots?date=YYYY-MM-DD` (baseline endpoint for this story)
  - [x] Subtask 2.3: Wire the fetched response into the slot list UI

- [x] Task 3: Date validation + user-safe messaging
  - [x] Subtask 3.1: Validate input format (YYYY-MM-DD) and enforce valid calendar dates
  - [x] Subtask 3.2: If invalid, show a clear message and keep the previous date active

- [x] Task 4: Validation (CI baseline)
  - [x] Subtask 4.1: `npm run lint` passes
  - [x] Subtask 4.2: `npm run build` passes

## Dev Notes
- Story 2.3 will implement reserved/available state computation; for 2.2, focus on date selection and refresh behavior.
- If an endpoint is temporarily scoped to return slot inventory only, still ensure the UI refresh flow is correctly triggered and validated.
- Avoid relying solely on color for state communication (handled in 2.3/2.10).

## Dev Agent Record
N/A

