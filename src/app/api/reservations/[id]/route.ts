import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";
import { apiError } from "@/server/api/errors";
import { cancelReservation } from "@/server/domain/reservations";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as { employeeId?: string } | undefined)?.employeeId;

  if (!employeeId) {
    return NextResponse.json(apiError("UNAUTHENTICATED", "Unauthorized"), { status: 401 });
  }

  const reservationId = typeof params?.id === "string" ? params.id : "";
  const result = await cancelReservation({ reservationId, employeeId });

  if (!result.ok) {
    const code = result.code;
    const status =
      code === "BAD_REQUEST" ? 400 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(apiError(code, result.message), { status });
  }

  return NextResponse.json({ data: { ok: true, message: result.message } }, { status: 200 });
}

