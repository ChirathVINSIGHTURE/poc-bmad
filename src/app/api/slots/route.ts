import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";
import { apiError } from "@/server/api/errors";
import { getAvailabilityForDate } from "@/server/domain/slots";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");

  const date = (() => {
    if (typeof dateParam !== "string" || !dateParam.trim()) {
      // Default to today's date for safe behavior when the query param is missing.
      return new Date().toISOString().slice(0, 10);
    }
    return dateParam.trim();
  })();

  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as { employeeId?: string } | undefined)?.employeeId;

  if (!employeeId) {
    return NextResponse.json(apiError("UNAUTHENTICATED", "Unauthorized"), { status: 401 });
  }

  try {
    // `getAvailabilityForDate` is tolerant of invalid input and falls back to inventory.
    const { slots: availabilitySlots } = await getAvailabilityForDate(date);
    return NextResponse.json({ data: { slots: availabilitySlots, date } });
  } catch (e) {
    return NextResponse.json(apiError("SLOTS_UNAVAILABLE", "Parking slots are temporarily unavailable"), {
      status: 500,
    });
  }
}

