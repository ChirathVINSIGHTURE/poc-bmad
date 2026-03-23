import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";
import { listReservationsForEmployee } from "@/server/domain/reservations";
import CancelReservationButton from "./CancelReservationButton";

export default async function ReservationsPage() {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as { employeeId?: string } | undefined)?.employeeId;

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=%2Freservations");
  }

  if (!employeeId) {
    // Break potential redirect loops by clearing the session first.
    redirect("/api/auth/signout?callbackUrl=%2Freservations");
  }

  const { reservations } = await listReservationsForEmployee(employeeId);

  return (
    <main className="min-h-screen bg-lot-slate-50 p-6">
      <h1 className="text-2xl font-semibold text-lot-primary">My reservations</h1>

      {reservations.length === 0 ? (
        <div className="mt-4 rounded border border-lot-slate-200 bg-white p-4 shadow">
          <p className="text-lot-slate-800">No upcoming reservations yet.</p>
          <Link
            className="mt-3 inline-block text-lot-primary underline"
            href="/"
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-2" aria-label="Upcoming reservations">
          {reservations.map((r) => (
            <li key={r.id} className="rounded border border-lot-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lot-slate-900 font-medium">{r.slotId}</div>
                  <div className="text-lot-slate-600 text-sm">Date: {r.date}</div>
                </div>

                <CancelReservationButton reservationId={r.id} slotId={r.slotId} date={r.date} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

