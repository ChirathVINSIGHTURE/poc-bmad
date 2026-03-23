"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCancelErrorMessage } from "@/lib/cancelReservationUiMessages";
import { getCancelSuccessUiMessage } from "@/lib/cancelReservationSuccessUiMessages";

export default function CancelReservationButton({
  reservationId,
  slotId,
  date,
}: {
  reservationId: string;
  slotId: string;
  date: string;
}) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onCancel() {
    if (isCancelling) return;
    setIsCancelling(true);
    setMessage(null);

    try {
      const resp = await fetch(`/api/reservations/${encodeURIComponent(reservationId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      });

      const json = await resp.json().catch(() => null);

      if (!resp.ok) {
        setMessage(getCancelErrorMessage(json));
        return;
      }

      // Only claim success if the backend explicitly indicates it.
      const ok = json?.data?.ok === true;
      if (!ok) {
        setMessage(getCancelErrorMessage(json));
        return;
      }

      setMessage(getCancelSuccessUiMessage(json));
      // Keep UX consistent: refresh the list after successful cancellation.
      router.refresh();
    } catch {
      setMessage("Couldn’t cancel your reservation. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onCancel()}
        disabled={isCancelling}
        aria-label={`Cancel reservation ${slotId} on ${date}`}
        className="rounded border border-lot-slate-200 bg-white px-3 py-1 text-sm text-lot-primary disabled:opacity-60"
      >
        {isCancelling ? "Cancelling..." : "Cancel"}
      </button>

      {message ? (
        <p className="mt-2 text-sm text-lot-slate-700" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}

