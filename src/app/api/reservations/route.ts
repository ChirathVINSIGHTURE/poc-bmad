import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";
import { apiError } from "@/server/api/errors";
import { createReservation, listReservationsForEmployee } from "@/server/domain/reservations";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as { employeeId?: string } | undefined)?.employeeId;

  if (!employeeId) {
    return NextResponse.json(apiError("UNAUTHENTICATED", "Unauthorized"), { status: 401 });
  }

  const { reservations } = await listReservationsForEmployee(employeeId);
  return NextResponse.json({ data: { reservations } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as { employeeId?: string; displayName?: string } | undefined)?.employeeId;
  const employeeName = (session?.user as { displayName?: string } | undefined)?.displayName ?? "Employee";

  if (!employeeId) {
    return NextResponse.json(apiError("UNAUTHENTICATED", "Unauthorized"), { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { slotId?: unknown; date?: unknown }
    | null;

  const slotId = typeof body?.slotId === "string" ? body.slotId : "";
  const date = typeof body?.date === "string" ? body.date : "";

  const result = await createReservation({ slotId, date, employeeId, employeeName });
  if (!result.ok) {
    if (result.code === "CONFLICT") {
      return NextResponse.json(apiError("CONFLICT", result.message), { status: 409 });
    }
    return NextResponse.json(apiError(result.code ?? "INTERNAL_ERROR", result.message), { status: 400 });
  }

  return NextResponse.json({ data: { ok: true, reservation: result.reservation } }, { status: 201 });
}

