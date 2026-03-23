---
stepsCompleted: [1, 2, 3, 4]
workflowType: 'epics-and-stories'
workflow: 'create'
status: 'in_progress'
lastStep: 4
project_name: 'poc-bmad'
user_name: 'Chirath.vandabona'
date: '2026-03-18'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# poc-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for poc-bmad, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: An employee can see the list of parking slots (identifiers and optional zone).
FR2: An employee can see which slots are available for a selected date.
FR3: An employee can see which slots are reserved for a selected date (and optionally by whom, if policy allows).
FR4: The system enforces a single reservation per slot per date (no double-booking).
FR5: An employee can reserve one parking slot for a specific date (today or future).
FR6: The system rejects reservation if the slot is already taken for that date.
FR7: An employee can cancel a reservation they own, freeing the slot for that date.
FR8: An employee can see a list of their own upcoming reservations (slot, date, ability to cancel).
FR9: The system associates each reservation with an employee identity from the corporate identity provider (SSO).
FR10: The system records when a reservation was created (audit trail).
FR11: An employee can authenticate via SSO and access the app using their corporate identity.
FR12: The app restricts reservation and "my reservations" actions to the identified employee (no acting on behalf of others unless explicitly scoped).
FR13: The app derives employee identity attributes from SSO and uses them consistently for reservations.
FR14: An employee can select a date to view availability for that date.
FR15: An employee can see availability (available vs reserved) for the selected date in one view (grid or list).
FR16: An employee can initiate a reservation from the availability view (choose an available slot).
FR17: An employee can navigate to "My reservations" to see and manage their reservations.
FR18: An employee can receive clear feedback after reserve or cancel (success or error).
FR19: The system returns a clear error when an employee attempts to reserve a slot already reserved for that date.
FR20: An employee can complete reserve and cancel flows without support (errors understandable and recoverable).
FR21: The system prevents cancellation of a reservation by someone other than the reserving employee (or an admin/support role if allowed).
FR22: The system supports a configurable set of parking slots (count and identifiers) via config/env/admin.
FR23: The system persists reservations in a durable database so they survive app restarts and support audit/support workflows.
FR24: The system allows querying reservations by date (availability) and by employee ("my reservations").
FR25: The system retains a minimal audit trail for reservations and cancellations (who, what slot, what date, when).
FR26: A support/admin user can search reservations by employee, date, and slot for investigation.
FR27: A support/admin user can view an audit trail for reservation lifecycle events (create, cancel, override/correct).
FR28: A support/admin user can perform controlled corrective actions (cancel invalid reservation, reassign ownership) according to policy.
FR29: The system enforces role-based access control (employee vs admin/support) for administrative capabilities.
FR30: The system records support/admin corrective actions with operator identity, timestamp, and reason.

### NonFunctional Requirements

NFR1 (Performance / NFR-P1): Availability for a selected date returns within 5 seconds under normal load.
NFR2 (Performance / NFR-P2): Reserve and cancel actions complete within 5 seconds under normal load.
NFR3 (Performance / NFR-P3): Initial page load shows main dashboard within 5 seconds on typical office network.
NFR4 (Security / NFR-S1): Reserve/cancel tied to identified employee; cannot cancel another employee’s reservation (ownership enforcement).
NFR5 (Security / NFR-S2): Access limited to intended internal audience (network + identity).
NFR6 (Security / NFR-S3): Reservation data treated as internal-only; storage/access follow company internal-data policies.
NFR7 (Accessibility / NFR-A1): All interactive controls operable via keyboard (no traps; sensible focus order).
NFR8 (Accessibility / NFR-A2): Controls/actions have visible labels or accessible names.
NFR9 (Accessibility / NFR-A3): Error messages are visible and exposed to assistive tech.
NFR10 (Accessibility / NFR-A4): Visual contrast meets minimum readability level (WCAG 2.1 AA recommended).
NFR11 (Reliability / NFR-R1): 99.9% uptime during business hours for reservation flows (monitoring measured).
NFR12 (Reliability / NFR-R2): Clear failure mode when dependencies unavailable; avoid inconsistent reservation states.
NFR13 (Scalability / NFR-X1): Support 200 concurrent users during peak with performance NFRs met (validated via load testing).
NFR14 (Scalability / NFR-X2): Support 20 reservation mutations/sec burst without violating performance NFRs (validated via load testing).

### Additional Requirements

- Starter/stack baseline includes: Next.js App Router full-stack app with Auth.js (NextAuth), Prisma ORM, PostgreSQL database, and deployment on Vercel (greenfield baseline).
- Enforce no-double-booking with a **DB-level unique constraint** on (slot_id, date); return deterministic conflict outcome on violation.
- Persist slots as a first-class entity (Slot table) and seed initial slots (e.g., P01–P24) via migrations/seed scripts.
- Implement an append-only **AuditEvent** table capturing reservation lifecycle actions and admin/support corrections (operator + reason required).
- RBAC: store user role in DB with at least roles: employee, support, admin; enforce on server-side for admin/support endpoints and UI route protection.
- API approach: REST-style Route Handlers with a consistent response format:
  - Success: `{ data: ... }`
  - Error: `{ error: { code: string, message: string } }`
  - Use HTTP 409 for conflicts (slot already reserved).
- Treat reservation "date" as date-only with API boundary format `YYYY-MM-DD`; avoid mixing timezones in business logic.
- Prefer server-first architecture: Server Components for reads; Server Actions preferred for writes (while preserving REST surface); revalidate paths/tags after mutations.
- Operability: define safe failure behavior when Auth/DB unavailable; add observability (OpenTelemetry recommended) and consider rate limiting for mutation endpoints.
- Testing strategy must be chosen (unit/integration/e2e) and made consistent; DB-backed integration tests required for uniqueness/idempotency invariants.

### UX Design Requirements

UX-DR1: Implement Insighture-inspired design tokens (primary blue #0182CB, accent orange #FF8102, slate neutrals, error #EA4747) and semantic mappings (primary/secondary/success/warn/error, slot states).
UX-DR2: Implement typography foundation aligned to brand inspiration (Albert Sans or closest available), with a consistent type scale for headings/body/captions.
UX-DR3: Implement a mobile-first, “airy progressive disclosure” layout (Design Direction 4) with the slot grid as the hero and minimal chrome.
UX-DR4: Implement the “receipt” model (from Design Direction 3): dashboard and “My reservations” must always agree; after reserve/cancel provide clear confirmation and stable receipt.
UX-DR5: Implement SlotGrid and SlotCell components with explicit states: available, reserved, selected, and reserved-by-you (“Yours”) without relying on color alone.
UX-DR6: Implement ReservationStatusBanner (status-first header) showing selected date + reservation summary + next primary action.
UX-DR7: Implement SelectionSummaryCard that appears only after slot selection and presents the single primary action “Confirm reservation”.
UX-DR8: Standardize “change” mental model as **Cancel → rebook** (avoid ambiguous swap in Phase 1).
UX-DR9: Feedback patterns: toast/inline success, inline neutral conflict messaging (“Someone else reserved … just before you”), and actionable error states with retry.
UX-DR10: Loading patterns: skeleton for availability grid; button-level in-progress states (“Reserving…”, “Cancelling…”).
UX-DR11: Responsive grid behavior: 3–4 columns on mobile, 5–6 on tablet, 6–8 on desktop; maintain minimum 44×44px tap targets.
UX-DR12: Accessibility target WCAG 2.1 AA: keyboard navigation across date control and slot grid, visible focus ring, aria-live announcements for success/conflict/error.
UX-DR13: Screen reader semantics for slots: announce slot id + state + selected/yours + date context; ensure messages are announced and focus-managed.
UX-DR14: Navigation patterns: Dashboard is home; “My reservations” accessible consistently; post-action provide quick path to receipt view.
UX-DR15: Optional (Phase 2): “Spot occupied?” support pathway surfaced in reserved state (calm escalation path) as a dedicated component/pattern.

### FR Coverage Map

FR1: Epic 2 - Show parking slots list
FR2: Epic 2 - Show available slots for selected date
FR3: Epic 2 - Show reserved slots for selected date
FR4: Epic 3 - Enforce no double-booking (slot+date uniqueness)
FR5: Epic 2 - Reserve a slot for a date
FR6: Epic 2 - Reject reserve when slot is already taken
FR7: Epic 2 - Cancel own reservation
FR8: Epic 2 - View "My reservations" list
FR9: Epic 3 - Associate reservation with SSO identity
FR10: Epic 3 - Record reservation creation (audit trail)
FR11: Epic 1 - Authenticate via SSO
FR12: Epic 1 - Enforce employee ownership for actions
FR13: Epic 1 - Derive and use identity attributes consistently
FR14: Epic 2 - Select date to view availability
FR15: Epic 2 - One-view availability (grid/list)
FR16: Epic 2 - Initiate reservation from availability view
FR17: Epic 2 - Navigate to "My reservations"
FR18: Epic 2 - Clear feedback after reserve/cancel
FR19: Epic 2 - Clear error when slot already reserved
FR20: Epic 2 - Flows usable without support; recoverable errors
FR21: Epic 2 - Prevent cancellation by non-owner (except privileged roles)
FR22: Epic 2 - Configurable slot inventory (count/identifiers)
FR23: Epic 3 - Durable DB persistence for reservations
FR24: Epic 2 - Query reservations by date and by employee
FR25: Epic 3 - Minimal audit trail for reserve/cancel
FR26: Epic 4 - Support/admin search reservations by employee/date/slot
FR27: Epic 4 - Support/admin view audit trail
FR28: Epic 4 - Support/admin corrective actions (cancel/reassign)
FR29: Epic 1 - RBAC enforcement for admin/support
FR30: Epic 4 - Record corrective actions with operator + reason

## Epic List

### Epic 1: Sign-in & Access (SSO + Roles)
Enable employees and support/admin users to securely access the app with correct permissions and identity attribution.

**FRs covered:** FR11–FR13, FR29

### Epic 2: Reserve Parking (Employee Core Experience)
Enable employees to select a date, see availability, reserve a slot, view “My reservations”, and cancel—reliably and with clear feedback (progressive disclosure UX).

**FRs covered:** FR1–FR3, FR5–FR8, FR14–FR22, FR24

### Epic 3: Trust & Audit Trail (Reservation Integrity)
Make the system trustworthy and supportable by ensuring durable persistence, no-double-booking under concurrency, and auditable lifecycle events for reservations.

**FRs covered:** FR4, FR9–FR10, FR23, FR25

### Epic 4: Support/Admin Operations (Disputes & Corrections)
Enable support/admin staff to investigate issues and correct data safely with traceability.

**FRs covered:** FR26–FR28, FR30

## Epic 1: Sign-in & Access (SSO + Roles)

Enable employees and support/admin users to securely access the app with correct permissions and identity attribution.

### Story 1.1: Set up initial project from starter baseline (Next.js + Auth.js + Prisma + Postgres)

As a developer,
I want the initial project scaffolded with the agreed baseline stack,
So that all subsequent stories can be implemented consistently and deployed reliably.

**Implements:** FR11 (baseline support), FR23 (baseline support)

**Acceptance Criteria:**

**Given** the repository is initialized  
**When** the project is set up  
**Then** the Next.js App Router project builds and runs locally with TypeScript and Tailwind configured

**Given** the baseline stack is required (Auth.js + Prisma + Postgres)  
**When** dependencies and configuration are added  
**Then** Prisma is configured to connect to Postgres and can run an initial migration, and Auth.js is wired into the app router (provider details may be placeholder)

**Given** the app is run locally after setup  
**When** a developer executes the standard dev command  
**Then** the app starts successfully without runtime errors and is ready for feature implementation

**Given** the project is set up  
**When** a developer runs `npm run lint` and `npm run build`  
**Then** both complete successfully (CI baseline signal)

### Story 1.2: Configure SSO authentication (Auth.js) + session strategy

As an employee,
I want to sign in using corporate SSO,
So that I can access the parking reservation app securely without managing a separate password.

**Implements:** FR11, FR12

**Acceptance Criteria:**

**Given** a user is not authenticated  
**When** they access the app  
**Then** they are redirected to SSO sign-in

**Given** the user successfully authenticates via SSO  
**When** they return to the app  
**Then** they have an active session and can access employee pages

**Given** authentication fails or is cancelled  
**When** the user returns to the app  
**Then** they see a clear, actionable error state (retry) without exposing sensitive details

### Story 1.3: Persist user profile from SSO claims (identity mapping)

As the system,
I want to map SSO identity claims into a stable user profile,
So that reservations and audit events are tied to a consistent employee identity.

**Implements:** FR13

**Acceptance Criteria:**

**Given** a user signs in for the first time  
**When** the app receives SSO claims  
**Then** a user record is created with a stable identifier and display attributes

**Given** a returning user signs in  
**When** the app receives SSO claims  
**Then** the existing user record is resolved and updated only for safe display fields

**Given** required identity attributes are missing  
**When** sign-in completes  
**Then** the user is blocked with a clear error and the event is logged server-side

### Story 1.4: Role model + authorization guardrails (employee vs support vs admin)

As a support/admin user,
I want my permissions enforced consistently,
So that only authorized users can access admin/support capabilities.

**Implements:** FR29

**Acceptance Criteria:**

**Given** a signed-in user has role `employee`  
**When** they attempt to access admin/support routes or APIs  
**Then** access is denied with the appropriate status and a safe error message

**Given** a signed-in user has role `support` or `admin`  
**When** they access admin/support routes or APIs  
**Then** access is allowed

**Given** role checks are required for a mutation endpoint  
**When** an unauthorized request is made  
**Then** the request is rejected server-side (UI hiding is not relied on)

## Epic 2: Reserve Parking (Employee Core Experience)

Enable employees to select a date, see availability, reserve a slot, view “My reservations”, and cancel—reliably and with clear feedback (progressive disclosure UX).

### Story 2.1: Slot inventory baseline + list/legend (employee-visible)

As an employee,
I want to see the list of parking slots,
So that I understand what I can reserve.

**Implements:** FR1, FR22

**Acceptance Criteria:**

**Given** I am signed in  
**When** I open the dashboard  
**Then** I can see the list of configured parking slots (e.g., P01–P24)

**Given** slot inventory is configured  
**When** the dashboard loads  
**Then** slots display a consistent identifier and an accessible label

**Given** slot inventory is persisted in the system of record  
**When** the app is deployed/restarted  
**Then** the same slot set remains available (seeded/configured via DB-backed mechanism; not in-memory only)

**Given** slot inventory is empty or misconfigured  
**When** I open the dashboard  
**Then** I see a clear empty state explaining that no slots are available

### Story 2.2: Date selection for availability

As an employee,
I want to select a date,
So that I can view parking availability for that day.

**Implements:** FR14

**Acceptance Criteria:**

**Given** I am on the dashboard  
**When** I change the selected date  
**Then** the availability view refreshes for that date

**Given** I am using keyboard only  
**When** I interact with the date control  
**Then** I can change dates and continue to the grid without keyboard traps

**Given** an invalid date is entered (if editable)  
**When** I attempt to apply it  
**Then** I see a clear validation message and the previous date remains active

### Story 2.3: Availability states in grid (available vs reserved)

As an employee,
I want to see which slots are available vs reserved for a selected date,
So that I can choose an open spot quickly.

**Implements:** FR2, FR3, FR15

**Acceptance Criteria:**

**Given** a selected date  
**When** availability loads  
**Then** each slot is shown as Available or Reserved for that date

**Given** a slot is reserved  
**When** I view the grid  
**Then** the slot is clearly non-selectable and its state is communicated without relying on color alone

**Given** availability fails to load  
**When** the dashboard is shown  
**Then** I see an actionable error state with a retry option

### Story 2.4: Select slot + progressive disclosure selection summary

As an employee,
I want to select an available slot,
So that I can confirm I’m reserving the correct one before committing.

**Implements:** FR16

**Acceptance Criteria:**

**Given** I see available slots  
**When** I select one  
**Then** it becomes the current selection and a selection summary appears (slot + date)

**Given** I change my mind  
**When** I select a different available slot  
**Then** the selection updates and the summary reflects the new selection

**Given** I try to select a reserved slot  
**When** I click/tap it  
**Then** nothing is selected and the UI remains stable (no “phantom selection”)

### Story 2.5: Reserve selected slot (happy path) + receipt consistency

As an employee,
I want to reserve my selected slot for the chosen date,
So that I have a confirmed parking commitment.

**Implements:** FR5, FR8, FR17, FR18, FR24

**Acceptance Criteria:**

**Given** I have selected an available slot  
**When** I confirm reservation  
**Then** the system creates the reservation and I see a clear success confirmation

**Given** reservation succeeds  
**When** the UI updates  
**Then** the dashboard shows I have a reservation for that date and the slot is marked reserved

**Given** reservation succeeds  
**When** I open “My reservations”  
**Then** the new reservation is listed (receipt consistency)

### Story 2.6: Conflict on reserve (already reserved) with in-context recovery

As an employee,
I want a clear message when a slot gets reserved by someone else first,
So that I can quickly choose another slot without confusion.

**Implements:** FR6, FR19, FR20

**Acceptance Criteria:**

**Given** I attempt to reserve a slot that became unavailable  
**When** the server returns a conflict  
**Then** I see an inline neutral message (“Someone else reserved it just before you. Pick another slot.”)

**Given** a conflict occurs  
**When** the UI updates  
**Then** the slot is shown as Reserved and I remain on the same date and grid

**Given** I select another available slot after conflict  
**When** I confirm  
**Then** the reservation succeeds (happy path)

### Story 2.7: My reservations list + cancel entry point

As an employee,
I want to view my upcoming reservations,
So that I can manage plans and cancel if needed.

**Implements:** FR8, FR17

**Acceptance Criteria:**

**Given** I have one or more reservations  
**When** I navigate to “My reservations”  
**Then** I see a list of my upcoming reservations (date + slot) with a cancel action

**Given** I have no reservations  
**When** I navigate to “My reservations”  
**Then** I see a clear empty state and a link back to the dashboard

**Given** I am not authenticated  
**When** I attempt to access “My reservations”  
**Then** I’m redirected to sign-in

### Story 2.8: Cancel reservation (happy path + idempotent feel)

As an employee,
I want to cancel my reservation,
So that the slot becomes available to others.

**Implements:** FR7, FR18

**Acceptance Criteria:**

**Given** I own a reservation  
**When** I cancel it  
**Then** the reservation is removed and I see clear success feedback

**Given** cancellation succeeds  
**When** the UI refreshes  
**Then** the slot shows as available for that date and the receipt list updates

**Given** I retry cancel (double click / refresh)  
**When** the system treats it as already cancelled or not found  
**Then** the UI does not end in a confusing state and communicates the outcome safely

### Story 2.9: Ownership enforcement on cancel (employee-only)

As an employee,
I want the app to prevent cancelling reservations that aren’t mine,
So that reservation ownership is respected.

**Implements:** FR21

**Acceptance Criteria:**

**Given** I attempt to cancel a reservation I do not own  
**When** I submit the cancel request  
**Then** the server rejects it (403) and the UI shows a safe error message

**Given** I do not own the reservation  
**When** I view employee UI  
**Then** I do not see cancel actions for non-owned reservations

### Story 2.10: UX baseline quality for core flow (loading + accessibility + responsive grid)

As an employee,
I want the app to be usable on mobile and with assistive tech,
So that reserving and cancelling is easy for everyone.

**Implements:** FR20

**Acceptance Criteria:**

**Given** I load availability  
**When** data is fetching  
**Then** I see a skeleton/loading state (not a blank area)

**Given** I use keyboard navigation  
**When** I traverse date control, grid, and actions  
**Then** focus order is logical and focus indicators are visible

**Given** I’m on mobile widths  
**When** I view the grid  
**Then** it renders in fewer columns with tap targets at least 44×44px

**Given** a success, error, or conflict message appears  
**When** I use a screen reader  
**Then** the message is announced (aria-live) and is understandable

## Epic 3: Trust & Audit Trail (Reservation Integrity)

Make the system trustworthy and supportable by ensuring durable persistence, no-double-booking under concurrency, and auditable lifecycle events for reservations.

### Story 3.1: Reservation persistence + slot/date uniqueness invariant

As an employee,
I want reservations to be reliably persisted and never double-booked,
So that I can trust a reserved slot is mine.

**Implements:** FR4, FR23

**Acceptance Criteria:**

**Given** two users attempt to reserve the same slot for the same date concurrently  
**When** both requests are processed  
**Then** at most one reservation is created and the other receives HTTP 409 conflict

**Given** reservations are stored in the database  
**When** schema/migrations are applied  
**Then** a database-level unique constraint enforces one reservation per slot per date (e.g., `(slot_id, date)`)

**Given** the app restarts  
**When** availability and “My reservations” are loaded  
**Then** previously created reservations are still present (durable persistence)

**Given** the uniqueness invariant is critical  
**When** it is implemented  
**Then** there is at least one DB-backed integration test covering the conflict path (409) under duplicate reserve attempts

**Given** a reservation is stored  
**When** the system persists date values  
**Then** reservation date is handled as date-only with API boundary `YYYY-MM-DD`

### Story 3.2: Audit trail for reservation lifecycle events (employee actions)

As a support/admin user,
I want an audit trail of reservation lifecycle events,
So that I can investigate disputes with traceable history.

**Implements:** FR10, FR25

**Acceptance Criteria:**

**Given** an employee reserves a slot  
**When** the reservation is created  
**Then** an audit event is recorded with actor identity, slot, date, timestamp, and action type

**Given** auditability is required  
**When** the system is implemented  
**Then** audit events are persisted in an append-only `AuditEvent` table/entity (not transient logs)

**Given** an employee cancels a reservation  
**When** the cancellation succeeds  
**Then** an audit event is recorded with actor identity, reservation reference, timestamp, and action type

**Given** audit storage is append-only  
**When** events are written  
**Then** existing audit history is never overwritten or deleted by normal flows

### Story 3.3: Consistent API error semantics for conflicts and safe errors

As an employee,
I want clear, consistent errors for conflicts and failures,
So that the UI can always guide me to the next step.

**Implements:** FR6, FR19

**Acceptance Criteria:**

**Given** a reservation attempt violates the no-double-booking constraint  
**When** the server responds  
**Then** it uses HTTP 409 and the standard error shape `{ error: { code, message } }`

**Given** an unexpected server error occurs  
**When** the server responds  
**Then** it returns a safe, stable error code/message and does not leak internals

**Given** the UI shows conflict/error states  
**When** the user retries or selects another slot  
**Then** the flow remains in-context and recoverable

## Epic 4: Support/Admin Operations (Disputes & Corrections)

Enable support/admin staff to investigate issues and correct data safely with traceability.

### Story 4.1: Admin/support reservation search (by employee/date/slot)

As a support/admin user,
I want to search reservations by employee, date, and slot,
So that I can investigate issues quickly.

**Implements:** FR26

**Acceptance Criteria:**

**Given** I have `support` or `admin` role  
**When** I search by employee, date, and slot criteria  
**Then** I can find matching reservations (including none found case)

**Given** I have `employee` role  
**When** I attempt to access the search capability  
**Then** I am denied (403) and no sensitive data is leaked

**Given** a reservation result is returned  
**When** I view it  
**Then** I can see key fields needed for investigation (employee identity reference, slot, date, current status)

### Story 4.2: Admin/support audit trail viewer for a reservation

As a support/admin user,
I want to view the audit history for a reservation,
So that I can understand what happened over time.

**Implements:** FR27

**Acceptance Criteria:**

**Given** I have access to a reservation  
**When** I open its audit trail  
**Then** I see chronological events (reserve, cancel, corrections) with actor, timestamp, and reason where applicable

**Given** there are no audit events (edge case)  
**When** I view the audit trail  
**Then** I see an explicit empty state and guidance

**Given** I am unauthorized  
**When** I attempt to view audit data  
**Then** access is denied (403)

### Story 4.3: Controlled correction — cancel invalid reservation (with reason + audit)

As a support/admin user,
I want to cancel an invalid reservation with a reason,
So that the system can be corrected safely and traceably.

**Implements:** FR28, FR30

**Acceptance Criteria:**

**Given** I am `support` or `admin`  
**When** I cancel a reservation via the support workflow  
**Then** the reservation is cancelled and the slot becomes available for that date

**Given** I perform a corrective cancellation  
**When** the action is recorded  
**Then** an audit event is written with operator identity, timestamp, and required reason

**Given** I omit a reason  
**When** I attempt the correction  
**Then** the action is rejected with a clear validation error

### Story 4.4: Controlled correction — reassign reservation ownership (with reason + audit)

As a support/admin user,
I want to reassign a reservation to the correct employee with a reason,
So that ownership disputes can be resolved.

**Implements:** FR28, FR30

**Acceptance Criteria:**

**Given** I am authorized and provide the target employee identity  
**When** I reassign a reservation  
**Then** the reservation’s ownership changes and the new owner sees it in “My reservations”

**Given** a reassignment occurs  
**When** it is recorded  
**Then** an audit event is written with operator identity, timestamp, and required reason

**Given** the reassignment target is invalid or nonexistent  
**When** I attempt the action  
**Then** the action is rejected safely with an actionable error message

