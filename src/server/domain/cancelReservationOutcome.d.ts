export type CancelReservationOutcome =
  | { ok: true; message: string }
  | { ok: false; code: "FORBIDDEN"; message: string };

export function getCancelReservationOutcome(args: {
  reservationExists: boolean;
  reservationEmployeeId: string | null;
  requestingEmployeeId: string;
  deleteCount: number;
}): CancelReservationOutcome;

export const FORBIDDEN_CANCEL_MESSAGE: string;
