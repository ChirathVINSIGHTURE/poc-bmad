const test = require("node:test");
const assert = require("node:assert/strict");

const { extractIdentity } = require("../../src/server/auth/identity.js");

test("extractIdentity: credentials shape", () => {
  const r = extractIdentity({
    credentials: { employeeId: "E123", displayName: "Alice", email: "alice@x.com" },
  });
  assert.equal(r.employeeId, "E123");
  assert.equal(r.displayName, "Alice");
  assert.equal(r.email, "alice@x.com");
});

test("extractIdentity: oauth profile shape (sub + name)", () => {
  const r = extractIdentity({
    profile: { sub: "E999", name: "Bob Example", email: "bob@x.com" },
  });
  assert.equal(r.employeeId, "E999");
  assert.equal(r.displayName, "Bob Example");
  assert.equal(r.email, "bob@x.com");
});

test("extractIdentity: missing identifiers returns undefineds", () => {
  const r = extractIdentity({});
  assert.equal(r.employeeId, undefined);
  assert.equal(r.displayName, undefined);
  assert.equal(r.email, undefined);
});

