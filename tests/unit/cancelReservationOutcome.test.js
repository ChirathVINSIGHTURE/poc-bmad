const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getCancelReservationOutcome,
  FORBIDDEN_CANCEL_MESSAGE,
} = require("../../src/server/domain/cancelReservationOutcome.js");

test("not-found -> idempotent success", () => {
  const r = getCancelReservationOutcome({
    reservationExists: false,
    reservationEmployeeId: null,
    requestingEmployeeId: "emp-a",
    deleteCount: 0,
  });
  assert.deepEqual(r, { ok: true, message: "Reservation already cancelled." });
});

test("non-owner -> FORBIDDEN with safe message", () => {
  const r = getCancelReservationOutcome({
    reservationExists: true,
    reservationEmployeeId: "emp-owner",
    requestingEmployeeId: "emp-other",
    deleteCount: 0,
  });
  assert.deepEqual(r, {
    ok: false,
    code: "FORBIDDEN",
    message: FORBIDDEN_CANCEL_MESSAGE,
  });
});

test("owner with delete -> success", () => {
  const r = getCancelReservationOutcome({
    reservationExists: true,
    reservationEmployeeId: "emp-a",
    requestingEmployeeId: "emp-a",
    deleteCount: 1,
  });
  assert.deepEqual(r, { ok: true, message: "Reservation cancelled." });
});

test("owner with zero deletes -> idempotent (race / already gone)", () => {
  const r = getCancelReservationOutcome({
    reservationExists: true,
    reservationEmployeeId: "emp-a",
    requestingEmployeeId: "emp-a",
    deleteCount: 0,
  });
  assert.deepEqual(r, { ok: true, message: "Reservation already cancelled." });
});
