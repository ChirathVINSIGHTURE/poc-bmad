const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getReserveConflictUiMessage,
} = require("../../src/lib/reservationConflictUiMessages.js");

test("getReserveConflictUiMessage: CONFLICT returns neutral recovery copy", () => {
  const msg = getReserveConflictUiMessage("CONFLICT");
  assert.equal(
    msg,
    "Someone else reserved it just before you. Pick another slot."
  );
});

test("getReserveConflictUiMessage: unknown code returns null", () => {
  const msg = getReserveConflictUiMessage("SOME_OTHER_CODE");
  assert.equal(msg, null);
});

