// Mirrors robot_backend/app/core/support_config.py. The backend is the authority for every transition and
// permission; these lists only decide which controls are shown.

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_for_customer: "Waiting for Customer",
  waiting_for_technician: "Waiting for Technician",
  resolved: "Resolved",
  closed: "Closed",
};

export const SUPPORT_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress", "waiting_for_customer", "waiting_for_technician", "resolved"],
  in_progress: ["waiting_for_customer", "waiting_for_technician", "resolved"],
  waiting_for_customer: ["in_progress", "resolved"],
  waiting_for_technician: ["in_progress", "resolved"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

export const SUPPORT_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const SUPPORT_REFERENCE_RE = /^SUP-\d{4}-\d{4}$/;
export const BOOKING_REFERENCE_RE = /^RC-\d{4}-\d{4}$/;
export const SERVICE_REFERENCE_RE = /^TK-\d{4}-\d{4}$/;

// Indian mobile: digits only after removing spaces and dashes, with optional +91 or 0 prefix.
export function normalizeMobileForDisplay(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, "");
  const match = /^(?:\+?91|0)?([6-9]\d{9})$/.exec(digits);
  return match ? `+91${match[1]}` : null;
}

// wa.me needs digits only, with the country code and no plus sign.
export function whatsappUrl(mobileE164: string, message: string): string {
  const digits = mobileE164.replace(/^\+/, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function telUrl(mobileE164: string): string {
  return `tel:${mobileE164}`;
}

export function supportStatusTone(status: string): string {
  switch (status) {
    case "resolved":
    case "closed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "waiting_for_customer":
    case "waiting_for_technician":
      return "bg-orange-50 text-orange-800 ring-orange-200";
    case "in_progress":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    default:
      return "bg-amber-50 text-amber-800 ring-amber-200";
  }
}
