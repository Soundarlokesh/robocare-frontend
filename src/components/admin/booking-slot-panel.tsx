"use client";

import { CalendarClock, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatDate, Panel } from "@/components/admin/ui";
import { maxBookingIso, TIME_SLOT_OPTIONS, todayIso } from "@/lib/booking";
import { ApiError, patchJson } from "@/lib/api";

// Lets staff move the preferred visit date and time slot. The customer sees the new slot on the check page.
export function BookingSlotPanel({
  bookingId,
  preferredDate,
  preferredTimeSlot,
  onSaved,
}: {
  bookingId: string;
  preferredDate: string | null;
  preferredTimeSlot: string | null;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(preferredDate ?? "");
  const [slot, setSlot] = useState(preferredTimeSlot ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const unchanged = date === (preferredDate ?? "") && slot === (preferredTimeSlot ?? "");

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await patchJson(`/admin/bookings/${bookingId}/slot`, { preferred_date: date, preferred_time_slot: slot });
      setNotice("Visit date and time slot updated.");
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The visit could not be rescheduled. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-ink">Visit date and time</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Currently {formatDate(preferredDate)}
            {preferredTimeSlot ? `, ${TIME_SLOT_OPTIONS.find((option) => option.value === preferredTimeSlot)?.label ?? preferredTimeSlot}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Date</span>
          <input
            type="date"
            min={todayIso()}
            max={maxBookingIso()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Time slot</span>
          <select
            value={slot}
            onChange={(event) => setSlot(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Choose a slot</option>
            {TIME_SLOT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-3 rounded-lg bg-success-soft p-3 text-sm text-success">
          {notice}
        </p>
      ) : null}

      <button
        type="button"
        onClick={save}
        disabled={saving || unchanged || date === "" || slot === ""}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {saving ? "Saving…" : "Save visit time"}
      </button>
    </Panel>
  );
}
