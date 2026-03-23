const test = require("node:test");
const assert = require("node:assert/strict");

const { mapReservationCreateError } = require("../../src/server/domain/reservationCreateErrorMapper.js");

test("mapReservationCreateError: P2002 maps to CONFLICT", () => {
  const r = mapReservationCreateError({ code: "P2002" });
  assert.equal(r.ok, false);
  assert.equal(r.code, "CONFLICT");
  assert.equal(r.message, "This slot is already reserved for the selected date.");
});

test("mapReservationCreateError: non-P2002 maps to INTERNAL_ERROR", () => {
  const r = mapReservationCreateError({ code: "SOME_OTHER_CODE" });
  assert.equal(r.ok, false);
  assert.equal(r.code, "INTERNAL_ERROR");
  assert.equal(r.message, "Failed to create reservation.");
});

