const test = require("node:test");
const assert = require("node:assert/strict");

const { getCancelErrorMessage } = require("../../src/lib/cancelReservationUiMessages.js");

test("getCancelErrorMessage: error.message wins", () => {
  const msg = getCancelErrorMessage({ error: { message: "Boom" } });
  assert.equal(msg, "Boom");
});

test("getCancelErrorMessage: HTTP 403 FORBIDDEN uses error.message (apiError shape)", () => {
  const payload = {
    error: {
      code: "FORBIDDEN",
      message: "You can only cancel your own reservations.",
    },
  };
  const msg = getCancelErrorMessage(payload);
  assert.equal(msg, "You can only cancel your own reservations.");
});

test("getCancelErrorMessage: placeholder Not implemented is user-safe", () => {
  const msg = getCancelErrorMessage({ data: { message: "Not implemented" } });
  assert.equal(
    msg,
    "Cancellation isn’t available right now. Please try again later."
  );
});

test("getCancelErrorMessage: fallback message when no message present", () => {
  const msg = getCancelErrorMessage({});
  assert.equal(msg, "Couldn’t cancel your reservation. Please try again.");
});

