const test = require("node:test");
const assert = require("node:assert/strict");

const { persistUserProfile } = require("../../src/server/auth/userProfile.js");

test("persistUserProfile: blocks and audits when displayName missing (employeeId present)", async () => {
  const prisma = {
    auditEvent: {
      create: async () => {
        return { id: "audit1" };
      },
    },
    user: {
      upsert: async (args) => {
        throw new Error("should not upsert when identity attributes are missing");
      },
    },
  };

  const ok = await persistUserProfile({
    prisma,
    identity: { employeeId: "E1", displayName: undefined, email: "a@x.com" },
  });

  assert.equal(ok, false);
});

test("persistUserProfile: upserts and allows when required fields exist", async () => {
  let upsertArgs;
  const prisma = {
    auditEvent: {
      create: async () => {
        throw new Error("should not audit for valid identity");
      },
    },
    user: {
      upsert: async (args) => {
        upsertArgs = args;
        return { id: "u1" };
      },
    },
  };

  const ok = await persistUserProfile({
    prisma,
    identity: { employeeId: "E2", displayName: "Alice", email: undefined },
  });

  assert.equal(ok, true);
  assert.equal(upsertArgs.where.employeeId, "E2");
  assert.equal(upsertArgs.create.displayName, "Alice");
  assert.equal(upsertArgs.update.displayName, "Alice");
});

