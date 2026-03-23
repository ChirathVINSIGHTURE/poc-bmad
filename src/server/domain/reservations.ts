import { prisma } from "@/server/db/prisma";
import * as reservationCreateErrorMapper from "@/server/domain/reservationCreateErrorMapper";
import * as cancelReservationOutcome from "@/server/domain/cancelReservationOutcome";

export type ReservationItem = {
  id: string;
  slotId: string;
  date: string; // YYYY-MM-DD (UTC)
};

function isValidIsoDate(value: string) {
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(value);
}

function parseIsoDateToUTC(value: string): Date | null {
  if (!isValidIsoDate(value)) return null;
  const dt = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return null;
  const roundTrip = dt.toISOString().slice(0, 10);
  if (roundTrip !== value) return null;
  return dt;
}

export async function createReservation(_args: {
  slotId: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
}): Promise<
  | { ok: true; reservation: { id: string; slotId: string; date: string } }
  | { ok: false; code: string; message: string }
> {
  const { slotId, date, employeeId } = _args;

  if (!slotId.trim() || !employeeId.trim()) {
    return { ok: false, code: "BAD_REQUEST", message: "Missing required reservation fields." };
  }

  const parsed = parseIsoDateToUTC(date);
  if (!parsed) {
    return { ok: false, code: "BAD_REQUEST", message: "Invalid date format. Expected YYYY-MM-DD." };
  }

  try {
    const reservation = await prisma.reservation.create({
      data: {
        slotId: slotId.trim(),
        date: parsed,
        employeeId: employeeId.trim(),
      },
      select: {
        id: true,
        slotId: true,
        date: true,
      },
    });

    return {
      ok: true,
      reservation: {
        id: reservation.id,
        slotId: reservation.slotId,
        date: reservation.date.toISOString().slice(0, 10),
      },
    };
  } catch (e: any) {
    return reservationCreateErrorMapper.mapReservationCreateError(e);
  }
}

export async function listReservationsForEmployee(employeeId: string): Promise<{ reservations: ReservationItem[] }> {
  const reservations = await prisma.reservation.findMany({
    where: { employeeId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      slotId: true,
      date: true,
    },
  });

  return {
    reservations: reservations.map((r) => ({
      id: r.id,
      slotId: r.slotId,
      date: r.date.toISOString().slice(0, 10),
    })),
  };
}

export async function cancelReservation(_args: { reservationId: string; employeeId: string }) {
  const { reservationId, employeeId } = _args;

  if (!reservationId.trim() || !employeeId.trim()) {
    return { ok: false, code: "BAD_REQUEST", message: "Missing required cancellation fields." };
  }

  const rid = reservationId.trim();
  const eid = employeeId.trim();

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: rid },
      select: { employeeId: true },
    });

    if (!reservation) {
      return cancelReservationOutcome.getCancelReservationOutcome({
        reservationExists: false,
        reservationEmployeeId: null,
        requestingEmployeeId: eid,
        deleteCount: 0,
      });
    }

    if (reservation.employeeId !== eid) {
      return cancelReservationOutcome.getCancelReservationOutcome({
        reservationExists: true,
        reservationEmployeeId: reservation.employeeId,
        requestingEmployeeId: eid,
        deleteCount: 0,
      });
    }

    const result = await prisma.reservation.deleteMany({
      where: { id: rid, employeeId: eid },
    });

    return cancelReservationOutcome.getCancelReservationOutcome({
      reservationExists: true,
      reservationEmployeeId: reservation.employeeId,
      requestingEmployeeId: eid,
      deleteCount: result.count,
    });
  } catch {
    return { ok: false, code: "INTERNAL_ERROR", message: "Failed to cancel reservation." };
  }
}

