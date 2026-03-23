import { prisma } from "@/server/db/prisma";

export type AvailabilitySlot = {
  id: string;
  slotId: string;
  label: string;
  state: "available" | "reserved";
  // Reserved ownership is not implemented in this story; placeholder for later.
  yours?: boolean;
};

export type SlotInventoryItem = {
  id: string;
  slotId: string;
  label: string;
};

const DEFAULT_SLOT_IDS = Array.from({ length: 24 }, (_v, i) => {
  const n = i + 1;
  return `P${String(n).padStart(2, "0")}`;
});

function slotLabel(slotId: string) {
  // Human-friendly text for screen readers and the UI.
  return `Parking ${slotId}`;
}

export async function seedDefaultSlotsIfMissing() {
  // Idempotent: if slots already exist, `skipDuplicates` prevents duplicate rows.
  await prisma.slot.createMany({
    data: DEFAULT_SLOT_IDS.map((slotId) => ({ slotId })),
    skipDuplicates: true,
  });
}

export async function listSlotInventory(): Promise<{ slots: SlotInventoryItem[] }> {
  await seedDefaultSlotsIfMissing();

  const slots = await prisma.slot.findMany({
    orderBy: { slotId: "asc" },
    select: {
      id: true,
      slotId: true,
    },
  });

  return {
    slots: slots.map((s) => ({
      id: s.id,
      slotId: s.slotId,
      label: slotLabel(s.slotId),
    })),
  };
}

function isValidIsoDate(value: string) {
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(value);
}

function parseIsoDateToUTC(value: string): Date | null {
  if (!isValidIsoDate(value)) return null;
  const dt = new Date(`${value}T00:00:00Z`);
  // Guard invalid dates like 2026-02-31.
  const roundTrip = dt.toISOString().slice(0, 10);
  if (Number.isNaN(dt.getTime()) || roundTrip !== value) return null;
  return dt;
}

export async function getAvailabilityForDate(date: string): Promise<{
  date: string;
  slots: AvailabilitySlot[];
}> {
  const parsed = parseIsoDateToUTC(date);
  if (!parsed) {
    // For invalid input, fall back to inventory-only (available) to keep the endpoint safe.
    const { slots } = await listSlotInventory();
    return {
      date,
      slots: slots.map((s) => ({ ...s, state: "available" as const })),
    };
  }

  const { slots } = await listSlotInventory();
  const reserved = await prisma.reservation.findMany({
    where: { date: parsed },
    select: { slotId: true },
  });

  const reservedSlotIds = new Set(reserved.map((r) => r.slotId));
  return {
    date,
    slots: slots.map((s) => ({
      ...s,
      state: reservedSlotIds.has(s.slotId) ? "reserved" : "available",
    })),
  };
}

// Back-compat for earlier callers/tests: treat it as availability.
export async function getSlotsForDate(date: string) {
  return getAvailabilityForDate(date);
}

