# Story 1.3: Persist user profile from SSO claims (identity mapping)

Status: review

## Story
As the system,
I want to map SSO identity claims into a stable user profile,
So that reservations and audit events are tied to a consistent employee identity.

## Acceptance Criteria
1. **Given** a user signs in for the first time
   **When** the app receives SSO claims
   **Then** a user record is created with a stable identifier and display attributes
2. **Given** a returning user signs in
   **When** the app receives SSO claims
   **Then** the existing user record is resolved and updated only for safe display fields
3. **Given** required identity attributes are missing
   **When** sign-in completes
   **Then** the user is blocked with a clear error and the event is logged server-side

## Tasks / Subtasks
- [x] Task 1: Extract + validate employee identity attributes from SSO claims
  - [x] Subtask 1.1: Implemented canonical mapping from SSO/claims to internal identity fields via `extractIdentity()` (stable key + display attributes).
  - [x] Subtask 1.2: Implemented extraction + persistence wiring via NextAuth callbacks (`signIn`, `jwt`, `session`) in `src/server/auth/auth.ts`.
  - [x] Subtask 1.3: Validates required attributes (employeeId + displayName); on missing values blocks sign-in and logs an audit event server-side.
  - [x] Subtask 1.4: Extraction is tolerant to multiple claim shapes (credentials placeholder + OAuth/OIDC profile conventions).

- [x] Task 2: Persist and update user profile in the system of record
  - [x] Subtask 2.1: Implemented Prisma `user.upsert()` keyed by `employeeId` for first-time and returning users.
  - [x] Subtask 2.2: Returning-user updates only modify safe display fields (`displayName`, and `email` when provided); stable identifier is not overwritten.
  - [x] Subtask 2.3: Persisted fields map to Prisma `User.employeeId` and `User.displayName` as required for FR13.
  - [x] Subtask 2.4: Role remains DB source of truth (only set on create; not overwritten on update).

- [x] Task 3: Ensure downstream flows use the identified employee consistently
  - [x] Subtask 3.1: Updated JWT/session callbacks to attach `employeeId` and `displayName` onto the session user object.
  - [x] Subtask 3.2: Updated `src/app/page.tsx` to require `session.user.employeeId` before allowing access (server-enforced).

- [x] Task 4: Validation (CI baseline)
  - [x] Subtask 4.1: `npm run lint` passes
  - [x] Subtask 4.2: `npm run build` passes

## Dev Notes
### Developer guidance from architecture + project context
- Identity mapping rules:
  - Stable user key must come from the IdP subject/identifier; display attributes should come from claims and should be safe to update on sign-in.
  - Source of truth for authorization decisions is the DB `User.role` (not raw claims). [Source: `_bmad-output/planning-artifacts/architecture.md` “Authentication & Security” + “RBAC source of truth (critical)”]
- Session strategy:
  - Architecture calls for DB-backed sessions for production posture. [Source: `_bmad-output/planning-artifacts/architecture.md` “Session strategy (critical)”]
  - If the current placeholder dev setup temporarily differs (e.g., due to local auth provider constraints), still ensure that the identified employee identity is available to downstream code consistently for the flows in scope.

### Anti-patterns to avoid
- Do not tie reservations/audit actor identity to “whatever is in the UI” or to non-persisted client state.
- Do not overwrite the stable identifier on returning sign-ins.
- Do not use role checks from claims directly; always enforce from DB role state for admin/support mutations.

### Project Structure Notes
- Implement auth/session identity mapping in `src/server/auth/auth.ts`.
- Prefer server-side modules / helpers for identity extraction and persistence (e.g., `src/server/auth/identity.ts` or similar), then import from `auth.ts` to keep `auth.ts` readable.
- Keep identity extraction pure and testable where possible (no direct NextAuth response objects inside helpers).

### References
- Story requirements: `_bmad-output/planning-artifacts/epics.md` “Story 1.3: Persist user profile from SSO claims (identity mapping)”
- Identity FR: `_bmad-output/planning-artifacts/prd.md#Functional%20Requirements` section containing **FR13**
- Auth/RBAC/Session posture: `_bmad-output/planning-artifacts/architecture.md` “Authentication & Security”

## Dev Agent Record
### Agent Model Used
N/A

### Debug Log References

### Completion Notes List
- Implemented identity mapping + persistence for Story 1.3:
  - `extractIdentity()` maps SSO/claims (placeholder credentials + future OAuth/OIDC profile shapes) to `{ employeeId, displayName, email }`.
  - NextAuth callbacks (`signIn`, `jwt`, `session`) persist/update `prisma.user` and attach `employeeId` to the JWT-backed session.
  - Sign-in is blocked when required identity attributes are missing; an audit event is written server-side for the failure case.
- Additional review-blocker resolutions:
  - Audit FK safety: when identity attributes are missing, we now avoid placeholder user creation by making `AuditEvent.actorId` nullable and writing the audit event without an actor FK.
  - Stable key: `extractIdentity()` now prefers IdP `sub/subject` over other claim fields to ensure stable mapping.
  - Local testability: placeholder `CredentialsProvider.authorize()` no longer auto-fills required fields, so AC3 missing-identity paths can be exercised.
  - Clear UX + loop prevention: `src/app/page.tsx` now shows a specific message for `AccessDenied` and redirects via signout when `employeeId` is missing.
  - Module interop: `auth.ts` now uses namespace imports for CommonJS helper modules to reduce runtime export mismatch risk.
- Unit tests added:
  - `tests/unit/identity.test.js` validates identity extraction behavior across claim shapes.
  - `tests/unit/userProfile.test.js` validates persistence decision logic using Prisma mocks.
- Verified locally:
  - `node --test tests/unit/*.test.js`
  - `npm run lint`
  - `npm run build`

### File List
- `src/server/auth/auth.ts` (NextAuth callbacks: identity validation, persistence, session mapping)
- `src/server/auth/identity.js` + `src/server/auth/identity.d.ts` (claim extraction helper + typings)
- `src/server/auth/userProfile.js` + `src/server/auth/userProfile.d.ts` (persistence decision logic)
- `src/app/page.tsx` (requires mapped `session.user.employeeId`)
- `tests/unit/identity.test.js` (unit tests for claim extraction)
- `tests/unit/userProfile.test.js` (unit tests for persistence logic via mocks)
- `prisma/schema.prisma` (nullable `AuditEvent.actorId` to avoid placeholder user records)

