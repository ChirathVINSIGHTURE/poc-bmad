# Story 1.4: Role model + authorization guardrails (employee vs support vs admin)

Status: review

## Story
As a support/admin user,
I want my permissions enforced consistently,
So that only authorized users can access admin/support capabilities.

## Acceptance Criteria
1. **Given** a signed-in user has role `employee`
   **When** they attempt to access admin/support routes or APIs
   **Then** access is denied with the appropriate status and a safe error message
2. **Given** a signed-in user has role `support` or `admin`
   **When** they access admin/support routes or APIs
   **Then** access is allowed
3. **Given** role checks are required for a mutation endpoint
   **When** an unauthorized request is made
   **Then** the request is rejected server-side (UI hiding is not relied on)

## Tasks / Subtasks
- [x] Task 1: Implement DB-backed role checks for admin/support endpoints
  - [x] Subtask 1.1: Implemented `getUserRoleByEmployeeId()` helper in `src/server/auth/rbac.ts` (testable with prisma mocks).
  - [x] Subtask 1.2: Enforced role checks in `src/app/api/admin/reservations/route.ts` for both `GET` and `POST`.
  - [x] Subtask 1.3: Enforced role checks in `src/app/api/admin/audit/route.ts` for `GET`.

- [x] Task 2: Return safe REST error shapes + correct HTTP status
  - [x] Subtask 2.1: For unauthenticated requests, return HTTP `401` with `{ error: { code, message } }`.
  - [x] Subtask 2.2: For authenticated but unauthorized roles, return HTTP `403` with safe `{ error: ... }`.

- [x] Task 3: Mutation unauthorized rejection (server-side)
  - [x] Subtask 3.1: Ensured `POST` admin reservations rejects employee roles server-side (must not rely on UI hiding).

- [x] Task 4: Validation
  - [x] Subtask 4.1: `node --test tests/unit/*.test.js` passes.
  - [x] Subtask 4.2: `npm run lint` passes.
  - [x] Subtask 4.3: `npm run build` passes.

## Dev Notes
- Keep authorization decisions server-side.
- Role source of truth: `prisma.user.role` (DB), not raw claims.
- Use existing error contract helpers in `src/server/api/errors.ts`.

## Dev Agent Record
### Agent Model Used
N/A

### Debug Log References

### Completion Notes List
- Implemented DB-backed role enforcement for admin/support endpoints:
  - Added `getUserRoleByEmployeeId()` helper in `src/server/auth/rbac.ts`.
  - Protected `src/app/api/admin/reservations/route.ts` (`GET` + `POST`) and `src/app/api/admin/audit/route.ts` (`GET`).
  - Added consistent error responses using `src/server/api/errors.ts` (`401` unauthenticated, `403` forbidden).
- Added unit coverage:
  - `tests/unit/rbac.test.js` (covers `roleGuard` and `getUserRoleByEmployeeId` via prisma mocks).
- Verified:
  - `node --test tests/unit/*.test.js`
  - `npm run lint`
  - `npm run build`

### File List
- `src/server/auth/rbac.ts` (DB-backed role helper)
- `src/server/auth/rbac.js` (CommonJS wrapper for Node unit tests)
- `src/app/api/admin/reservations/route.ts` (RBAC guard for GET/POST)
- `src/app/api/admin/audit/route.ts` (RBAC guard for GET)
- `tests/unit/rbac.test.js` (unit tests)

