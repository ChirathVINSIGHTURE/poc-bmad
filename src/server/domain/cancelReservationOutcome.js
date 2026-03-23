/**
 * Pure mapping from reservation lookup + delete count to cancel API outcomes.
 * Kept in JS for `node --test` unit coverage (Story 2.9).
 */

/** User-safe copy; must not leak internal IDs or system details. */
const FORBIDDEN_CANCEL_MESSAGE =
  "You can only cancel your own reservations.";

/**
 * @param {object} args
 * @param {boolean} args.reservationExists
 * @param {string | null} args.reservationEmployeeId
 * @param {string} args.requestingEmployeeId
 * @param {number} args.deleteCount
 */
function getCancelReservationOutcome({
  reservationExists,
  reservationEmployeeId,
  requestingEmployeeId,
  deleteCount,
}) {
  const req = String(requestingEmployeeId ?? "").trim();

  if (!reservationExists) {
    return { ok: true, message: "Reservation already cancelled." };
  }

  const owner = String(reservationEmployeeId ?? "").trim();
  if (owner !== req) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: FORBIDDEN_CANCEL_MESSAGE,
    };
  }

  const n = typeof deleteCount === "number" ? deleteCount : 0;
  if (n <= 0) {
    return { ok: true, message: "Reservation already cancelled." };
  }

  return { ok: true, message: "Reservation cancelled." };
}

module.exports = {
  getCancelReservationOutcome,
  FORBIDDEN_CANCEL_MESSAGE,
};
