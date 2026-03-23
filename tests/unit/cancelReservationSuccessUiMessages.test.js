const test = require("node:test");
const assert = require("node:assert/strict");

const { getCancelSuccessUiMessage } = require("../../src/lib/cancelReservationSuccessUiMessages.js");

test("getCancelSuccessUiMessage: uses payload message when present", () => {
  const msg = getCancelSuccessUiMessage({ data: { ok: true, message: "Hello" } });
  assert.equal(msg, "Hello");
});

test("getCancelSuccessUiMessage: falls back to default when message missing", () => {
  const msg = getCancelSuccessUiMessage({ data: { ok: true } });
  assert.equal(msg, "Reservation cancelled.");
});

test("getCancelSuccessUiMessage: returns default when ok is not true", () => {
  const msg = getCancelSuccessUiMessage({ data: { ok: false, message: "Nope" } });
  assert.equal(msg, "Reservation cancelled.");
});

