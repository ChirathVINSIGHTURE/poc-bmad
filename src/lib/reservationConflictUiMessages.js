/**
 * Centralizes user-safe UI copy for reservation conflicts.
 *
 * Kept in JS so we can unit-test it with Node's built-in test runner.
 */
const CONFLICT_CODE = "CONFLICT";

function getReserveConflictUiMessage(errorCode) {
  if (errorCode === CONFLICT_CODE) {
    // Neutral, recovery-focused copy aligned with Story 2.6 acceptance criteria.
    return "Someone else reserved it just before you. Pick another slot.";
  }

  // For non-conflict failures, the UI uses the existing (safe) error.message.
  return null;
}

module.exports = {
  getReserveConflictUiMessage,
};

