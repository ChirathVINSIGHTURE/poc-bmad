/**
 * Extracts/chooses a user-safe success message for reservation cancellation.
 *
 * Kept in JS so we can unit-test with Node's built-in test runner.
 */
const DEFAULT_SUCCESS_MESSAGE = "Reservation cancelled.";

function getCancelSuccessUiMessage(payload) {
  if (payload?.data?.ok !== true) return DEFAULT_SUCCESS_MESSAGE;

  const msg = payload?.data?.message;
  if (typeof msg === "string" && msg.trim().length > 0) return msg;

  return DEFAULT_SUCCESS_MESSAGE;
}

module.exports = {
  getCancelSuccessUiMessage,
};

