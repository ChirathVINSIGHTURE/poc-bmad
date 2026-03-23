import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth";
import { getAvailabilityForDate } from "@/server/domain/slots";
import AvailabilityDateSelection from "./components/AvailabilityDateSelection";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession(authOptions);

  const errorParam = searchParams?.error;
  const error =
    typeof errorParam === "string" ? errorParam : Array.isArray(errorParam) ? errorParam[0] : undefined;

  // Unauthenticated users are always redirected to the sign-in flow.
  // If NextAuth returns with an error (cancel/failure), show a safe retry UI instead of looping silently.
  if (!session) {
    const userSafeMessage =
      error === "AccessDenied"
        ? "Your identity attributes were missing. Please try again."
        : "Sign-in failed or was cancelled. Please try again.";

    if (error) {
      return (
        <main className="min-h-screen bg-lot-slate-50 p-6">
          <h1 className="text-2xl font-semibold text-lot-primary">poc-bmad</h1>
          <div className="mt-4 rounded bg-white p-4 shadow">
            <p className="text-lot-slate-800">{userSafeMessage}</p>
            <Link
              className="mt-3 inline-block text-lot-primary underline"
              href="/api/auth/signin?callbackUrl=%2F"
            >
              Retry sign-in
            </Link>
          </div>
        </main>
      );
    }

    redirect("/api/auth/signin?callbackUrl=%2F");
  }

  // Guard against misconfigured auth where a session exists but the identity mapping
  // (employeeId) was not attached to the session.
  const employeeId = (session.user as { employeeId?: string })?.employeeId;
  if (!employeeId) {
    // Break potential redirect loops by clearing the session first.
    redirect("/api/auth/signout?callbackUrl=%2F");
  }

  const initialDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let slots: Array<{ id: string; slotId: string; label: string; state: "available" | "reserved" }> = [];
  try {
    const result = await getAvailabilityForDate(initialDate);
    slots = result.slots;
  } catch {
    slots = [];
  }

  return (
    <main className="min-h-screen bg-lot-slate-50 p-6">
      <h1 className="text-2xl font-semibold text-lot-primary">poc-bmad</h1>
      <AvailabilityDateSelection initialDate={initialDate} initialSlots={slots} />
    </main>
  );
}

