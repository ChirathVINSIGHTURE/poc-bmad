# Story 2.4: Select slot + progressive disclosure selection summary

Status: review

## Story
As an employee,
I want to select an available slot,
So that I can confirm I’m reserving the correct one before committing.

## Implements
FR16

## Acceptance Criteria
1. **Given** I see available slots  
   **When** I select one  
   **Then** it becomes the current selection and a selection summary appears (slot + date)
2. **Given** I change my mind  
   **When** I select a different available slot  
   **Then** the selection updates and the summary reflects the new selection
3. **Given** I try to select a reserved slot  
   **When** I click/tap it  
   **Then** nothing is selected and the UI remains stable (no “phantom selection”)

## Tasks / Subtasks
- [x] Task 1: Slot selection UI state
  - [x] Subtask 1.1: Add client-side selection state to the availability UI
  - [x] Subtask 1.2: Ensure selecting an “available” slot updates selection reliably
  - [x] Subtask 1.3: Ensure reserved slots do not create selection (no phantom selection)

- [x] Task 2: Progressive disclosure summary
  - [x] Subtask 2.1: Render a selection summary (slot + selected date) only when a valid slot is selected
  - [x] Subtask 2.2: Update the summary when the user changes their selection

- [x] Task 3: Accessibility and stability
  - [x] Subtask 3.1: Use accessible text for selection state (not color-only)
  - [x] Subtask 3.2: Prevent reserved slots from being focusable/clickable affordances if the UI uses interactive controls

- [x] Task 4: Validation (CI baseline)
  - [x] Subtask 4.1: `npm run lint` passes
  - [x] Subtask 4.2: `npm run build` passes

## Dev Notes
- Story 2.3 already includes reserved/available states; this story adds selection.
- Reserved slots must remain non-selectable and must not update summary.

## Dev Agent Record
N/A

