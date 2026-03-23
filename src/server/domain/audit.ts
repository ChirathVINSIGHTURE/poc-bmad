export async function appendAuditEvent(_event: {
  actorType: "employee" | "support" | "admin";
  actorId: string;
  action: string;
  reservationId?: string;
  slotId?: string;
  date?: string; // YYYY-MM-DD
  reason?: string;
}) {
  // Placeholder scaffold.
  return { ok: true };
}

