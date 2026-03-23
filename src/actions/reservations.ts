"use server";

/**
 * Placeholder server actions.
 * Later stories will implement reserve/cancel flows with conflict handling (HTTP 409) and audit events.
 */
export async function reserveSlot(_args: {
  slotId: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
}) {
  return { ok: false, message: "Not implemented" };
}

export async function cancelReservation(_args: { reservationId: string; employeeId: string }) {
  return { ok: false, message: "Not implemented" };
}

