/**
 * User-safe message mapping for the reservation cancel flow.
 *
 * Kept in JS so we can unit-test with Node's built-in `node:test`.
 */
function getCancelErrorMessage(payload) {
  const errorMsg = payload?.error?.message;
  if (typeof errorMsg === "string" && errorMsg.trim().length > 0) return errorMsg;

  const dataMsg = payload?.data?.message;
  if (typeof dataMsg === "string" && dataMsg.trim().length > 0) {
    // Placeholder backend returns `{ data: { message: "Not implemented" } }`.
    if (dataMsg === "Not implemented") {
      return "Cancellation isn’t available right now. Please try again later.";
    }
    return dataMsg;
  }

  return "Couldn’t cancel your reservation. Please try again.";
}

module.exports = {
  getCancelErrorMessage,
};

