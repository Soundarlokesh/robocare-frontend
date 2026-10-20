// Mirrors robot_backend/app/services/admin_rules.py. The backend is the authority: these lists only decide
// which buttons are shown. A rejected move still returns the server's INVALID_TRANSITION message.

export const BOOKING_STATUSES = ["requested", "confirmed", "technician_assigned", "completed", "cancelled"] as const;

export const BOOKING_NEXT: Record<string, string[]> = {
  requested: ["confirmed", "cancelled"],
  confirmed: ["technician_assigned", "cancelled"],
  technician_assigned: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const BOOKING_ACTION_LABEL: Record<string, string> = {
  confirmed: "Confirm appointment",
  technician_assigned: "Mark technician assigned",
  completed: "Mark completed",
  cancelled: "Cancel request",
};

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "appointment_scheduled",
  "technician_assigned",
  "service_completed",
  "payment_pending",
  "closed",
] as const;

export const LEAD_SCORES = ["hot", "warm", "cold"] as const;

export const TICKET_STATUSES = ["open", "in_progress", "awaiting_payment", "completed", "cancelled"] as const;

export const TICKET_NEXT: Record<string, string[]> = {
  open: ["in_progress", "cancelled"],
  in_progress: ["awaiting_payment", "completed", "cancelled"],
  awaiting_payment: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const TIME_SLOTS = [
  { value: "09:00-12:00", label: "9 AM – 12 PM" },
  { value: "12:00-15:00", label: "12 PM – 3 PM" },
  { value: "15:00-18:00", label: "3 PM – 6 PM" },
  { value: "18:00-20:00", label: "6 PM – 8 PM" },
] as const;
