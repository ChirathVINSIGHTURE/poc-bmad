const test = require("node:test");
const assert = require("node:assert/strict");

const { roleGuard, getUserRoleByEmployeeId } = require("../../src/server/auth/rbac.js");

test("roleGuard: allows when role is in allowedRoles", () => {
  assert.equal(roleGuard(["support", "admin"], "support"), true);
});

test("roleGuard: denies when role is not in allowedRoles", () => {
  assert.equal(roleGuard(["support", "admin"], "employee"), false);
});

test("getUserRoleByEmployeeId: returns role from prisma", async () => {
  const prisma = {
    user: {
      findUnique: async () => ({ role: "admin" }),
    },
  };
  const role = await getUserRoleByEmployeeId(prisma, "E1");
  assert.equal(role, "admin");
});

test("getUserRoleByEmployeeId: returns undefined when user not found", async () => {
  const prisma = {
    user: {
      findUnique: async () => null,
    },
  };
  const role = await getUserRoleByEmployeeId(prisma, "E1");
  assert.equal(role, undefined);
});

