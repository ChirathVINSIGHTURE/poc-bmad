"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import reservationConflictUiMessages from "@/lib/reservationConflictUiMessages";

type SlotUi = {
  id: string;
  slotId: string;
  label: string;
  state?: "available" | "reserved";
};

function isValidIsoDate(value: string) {
  // Strictly validate YYYY-MM-DD to satisfy the "invalid date keeps previous active" scenario.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  // Basic range checks first (fast failure).
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dt = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return false;

  // Ensure the Date round-trips to the same calendar day (guards against invalid 2026-02-31).
  const roundTrip = dt.toISOString().slice(0, 10);
  return roundTrip === value;
}

export default function AvailabilityDateSelection({
  initialDate,
  initialSlots,
}: {
  initialDate: string; // YYYY-MM-DD
  initialSlots: SlotUi[];
}) {
  const [activeDate, setActiveDate] = useState<string>(initialDate);
  const [inputValue, setInputValue] = useState<string>(initialDate);
  const [slots, setSlots] = useState<SlotUi[]>(initialSlots);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);
  const [reserveConflictMessage, setReserveConflictMessage] = useState<string | null>(null);

  const hasAnySlots = useMemo(() => slots.length > 0, [slots]);
  const selectedSlot = useMemo(
    () => (selectedSlotId ? slots.find((s) => s.slotId === selectedSlotId) ?? null : null),
    [selectedSlotId, slots],
  );

  const canReserveSelectedSlot = Boolean(
    selectedSlotId && selectedSlot && selectedSlot.state !== "reserved",
  );

  async function refreshForDate(date: string) {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/slots?date=${encodeURIComponent(date)}`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!resp.ok) {
        // Prefer JSON error shape if present.
        const maybeJson = (await resp.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        const msg = maybeJson?.error?.message ?? "Failed to load availability for the selected date.";
        throw new Error(msg);
      }

      const json = (await resp.json()) as { data?: { slots?: SlotUi[] } };
      const nextSlots = json.data?.slots ?? [];
      setSlots(nextSlots);
      // If the currently selected slot becomes reserved (or disappears), clear selection.
      setSelectedSlotId((prev) => {
        if (!prev) return null;
        const found = nextSlots.find((s) => s.slotId === prev);
        if (!found) return null;
        return found.state === "reserved" ? null : prev;
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load availability for the selected date.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onApply() {
    // Keep "previous/active date" semantics: if invalid, do not modify activeDate or slots.
    const nextDate = inputValue.trim();
    if (!isValidIsoDate(nextDate)) {
      setError("Please enter a valid date in the format YYYY-MM-DD.");
      return;
    }

    setActiveDate(nextDate);
    await refreshForDate(nextDate);
  }

  async function reserveSelectedSlot() {
    setReserveError(null);
    setReserveSuccess(null);
    setReserveConflictMessage(null);

    if (!selectedSlotId) return;
    if (!isValidIsoDate(activeDate)) return;

    try {
      const resp = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlotId, date: activeDate }),
      });

      if (!resp.ok) {
        const maybeJson = (await resp.json().catch(() => null)) as
          | { error?: { message?: string; code?: string } }
          | null;

        const code = maybeJson?.error?.code;
        const msg = maybeJson?.error?.message ?? "Reservation failed. Please try again.";

        // Story 2.6: conflict recovery must be neutral and in-context.
        if (code === "CONFLICT") {
          const uiCopy = reservationConflictUiMessages.getReserveConflictUiMessage(code) ?? msg;
          setReserveConflictMessage(uiCopy);

          // Preserve context: keep the same date/grid, but reconcile server truth.
          // If the selected slot is now reserved, refresh will clear selection.
          setSelectedSlotId(null);
          await refreshForDate(activeDate);
          return;
        }

        throw new Error(msg);
      }

      setReserveSuccess("Reservation confirmed.");
      // Slot is now reserved; refresh availability so UI shows correct reserved state.
      await refreshForDate(activeDate);
      setSelectedSlotId(null);
    } catch (e) {
      setReserveError(e instanceof Error ? e.message : "Reservation failed. Please try again.");
    }
  }

  return (
    <section className="mt-4 rounded bg-white p-4 shadow">
      <h2 className="text-lg font-semibold text-lot-slate-900">Parking slots</h2>
      <p className="mt-1 text-lot-slate-700">
        Select a date to refresh availability. (Availability details for reserved slots are implemented in later stories.)
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="availabilityDate" className="text-sm font-medium text-lot-slate-900">
            Availability date
          </label>
          <input
            id="availabilityDate"
            name="availabilityDate"
            type="text"
            inputMode="numeric"
            pattern="\\d{4}-\\d{2}-\\d{2}"
            placeholder="YYYY-MM-DD"
            className="w-full rounded border border-lot-slate-200 bg-white p-2 text-lot-slate-900 focus:outline-none focus:ring-2 focus:ring-lot-primary"
            value={inputValue}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "availabilityDateError" : undefined}
            onChange={(e) => {
              const nextRaw = e.target.value;
              setInputValue(nextRaw);
              if (error) setError(null);

              // Story requirement: when the selected date changes, refresh the view.
              // If the input is invalid, keep the previous active date.
              const next = nextRaw.trim();
              if (next !== activeDate && isValidIsoDate(next)) {
                setActiveDate(next);
                void refreshForDate(next);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Keyboard-only: Enter triggers apply.
                void onApply();
              }
            }}
            onBlur={(e) => {
              // If user tab-outs after typing a valid date, refresh on blur.
              const next = e.currentTarget.value.trim();
              if (next !== activeDate && isValidIsoDate(next)) {
                setActiveDate(next);
                void refreshForDate(next);
              }
            }}
          />
          {error ? (
            <div className="mt-1 flex flex-col gap-2">
              <p id="availabilityDateError" className="text-sm text-red-700">
                {error}
              </p>
              <button
                type="button"
                className="inline-block w-fit rounded border border-red-300 bg-white px-3 py-1 text-sm text-red-700"
                onClick={() => void refreshForDate(activeDate)}
                disabled={isLoading}
              >
                Retry
              </button>
            </div>
          ) : (
            <p className="text-sm text-lot-slate-600">
              Active date: <span className="font-medium">{activeDate}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void onApply()}
          disabled={isLoading}
          className="rounded bg-lot-primary px-4 py-2 text-white disabled:opacity-60"
        >
          {isLoading ? "Loading..." : "Apply date"}
        </button>
      </div>

      {!hasAnySlots ? (
        <div className="mt-4 rounded border border-lot-slate-200 bg-lot-slate-50 p-4">
          <p className="text-lot-slate-800">No parking slots are currently configured.</p>
          <button
            type="button"
            className="mt-3 inline-block text-lot-primary underline"
            onClick={() => void refreshForDate(activeDate)}
            disabled={isLoading}
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2" role="list" aria-label="Configured parking slots">
          {slots.map((slot) => (
            <li
              key={slot.id}
              title={slot.state === "reserved" ? "Reserved" : "Available"}
            >
              <button
                type="button"
                disabled={slot.state === "reserved"}
                aria-pressed={selectedSlotId === slot.slotId}
                aria-label={`${slot.label}. ${slot.state === "reserved" ? "Reserved." : "Available."}`}
                onClick={() => {
                  if (slot.state === "reserved") return;
                  setSelectedSlotId(slot.slotId);
                }}
                className={`w-full rounded border border-lot-slate-200 bg-white p-3 text-left ${
                  slot.state === "reserved" ? "cursor-not-allowed select-none opacity-70" : ""
                } ${selectedSlotId === slot.slotId ? "ring-2 ring-lot-primary" : ""}`}
              >
                <div className="text-lot-slate-900 font-medium">{slot.slotId}</div>
                <div className="text-lot-slate-600">{slot.label}</div>
                <div className="mt-1 text-sm">
                  {slot.state === "reserved" ? "Reserved" : "Available"}
                  {selectedSlotId === slot.slotId ? " (Selected)" : ""}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedSlotId ? (
        <div className="mt-4 rounded border border-lot-slate-200 bg-white p-4" aria-live="polite">
          <h3 className="text-sm font-semibold text-lot-slate-900">Selection</h3>
          <p className="mt-1 text-sm text-lot-slate-700">
            Slot <span className="font-medium">{selectedSlotId}</span> for{" "}
            <span className="font-medium">{activeDate}</span>
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => void reserveSelectedSlot()}
              disabled={!canReserveSelectedSlot || isLoading}
              className="rounded bg-lot-primary px-4 py-2 text-white disabled:opacity-60"
            >
              Reserve slot
            </button>
          </div>
        </div>
      ) : null}

      {reserveSuccess ? (
        <div className="mt-4 rounded border border-lot-slate-200 bg-white p-4" aria-live="polite">
          <div className="text-sm font-semibold text-lot-primary">{reserveSuccess}</div>
          <Link className="mt-2 inline-block text-lot-primary underline" href="/reservations">
            Open My reservations
          </Link>
        </div>
      ) : reserveConflictMessage ? (
        <div className="mt-4 rounded border border-lot-slate-200 bg-white p-4" aria-live="polite">
          <p className="text-sm text-lot-slate-700">{reserveConflictMessage}</p>
        </div>
      ) : reserveError ? (
        <div className="mt-4 rounded border border-red-200 bg-white p-4" aria-live="polite">
          <p className="text-sm font-medium text-red-700">{reserveError}</p>
        </div>
      ) : null}
    </section>
  );
}

