// Placeholder validation module for reservations.
// Later stories will implement shared input schemas for route handlers/server actions.
export type ReserveInput = {
  slotId: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
};

