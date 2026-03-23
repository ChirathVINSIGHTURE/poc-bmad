/**
 * Maps Prisma known errors into API-safe reservation error results.
 *
 * Kept in JS so we can unit-test with Node's built-in test runner.
 */
function mapReservationCreateError(e) {
  // Prisma unique constraint violation for the `(slotId, date)` unique constraint.
  if (e && e.code === "P2002") {
    return {
      ok: false,
      code: "CONFLICT",
      message: "This slot is already reserved for the selected date.",
    };
  }

  return { ok: false, code: "INTERNAL_ERROR", message: "Failed to create reservation." };
}

module.exports = {
  mapReservationCreateError,
};

