"use client";

import { Loader2, MessageSquare, Search, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form-fields";
import { ApiError, postJson } from "@/lib/api";
import { TIME_SLOT_OPTIONS } from "@/lib/booking";
import { BOOKING_REFERENCE_RE, normalizeMobileForDisplay } from "@/lib/support";

type BookingView = {
  reference: string;
  status: string;
  status_label: string;
  appliance_type: string;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  created_at: string;
  confirmed_at: string | null;
  message: { text: string; updated_at: string } | null;
};

const APPLIANCE_LABELS: Record<string, string> = { robot_vacuum: "Robot vacuum", dishwasher: "Dishwasher" };

const STATUS_TONES: Record<string, string> = {
  requested: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  technician_assigned: "bg-sky-50 text-sky-800 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-surface-muted text-ink-muted ring-border",
};

const SLOT_LABELS: Record<string, string> = Object.fromEntries(
  TIME_SLOT_OPTIONS.map((slot) => [slot.value, slot.label]),
);

// Accepts "rc-2026-0001" and " RC-2026-0001 " and similar. Only the normalized form is sent.
export function normalizeBookingReference(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export function CheckBookingForm() {
  const [reference, setReference] = useState("");
  const [mobile, setMobile] = useState("");
  const [fieldError, setFieldError] = useState<{ field: "reference" | "mobile"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingView | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeBookingReference(reference);
    setError(null);
    setBooking(null);
    if (!BOOKING_REFERENCE_RE.test(normalized)) {
      setFieldError({ field: "reference", message: "Enter the reference exactly as shown, for example RC-2026-0001." });
      return;
    }
    if (normalizeMobileForDisplay(mobile.trim()) === null) {
      setFieldError({ field: "mobile", message: "Enter the 10-digit mobile number you gave us." });
      return;
    }
    setFieldError(null);
    setLoading(true);
    try {
      const data = await postJson<BookingView>("/bookings/lookup", { reference: normalized, mobile: mobile.trim() });
      setBooking(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "We could not check that booking right now. Please try again shortly.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Booking reference"
            hint="The reference we sent when you booked, for example RC-2026-0001."
            error={fieldError?.field === "reference" ? fieldError.message : undefined}
          >
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                name="reference"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="RC-2026-0001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                invalid={invalid}
                describedBy={describedBy}
              />
            )}
          </Field>
          <Field
            label="Mobile number"
            hint="The mobile number you gave on the booking."
            error={fieldError?.field === "mobile" ? fieldError.message : undefined}
          >
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                invalid={invalid}
                describedBy={describedBy}
              />
            )}
          </Field>
        </div>
        <Button
          type="submit"
          className="mt-4 w-full sm:w-auto"
          disabled={loading || reference.trim() === "" || mobile.trim() === ""}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden="true" /> Check booking
            </>
          )}
        </Button>
      </form>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-ink">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {booking ? (
        <section aria-labelledby="booking-heading" className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-ink-muted">Booking reference</p>
              <h2 id="booking-heading" className="font-mono text-2xl font-semibold tracking-wide text-ink">
                {booking.reference}
              </h2>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${STATUS_TONES[booking.status] ?? STATUS_TONES.requested}`}
            >
              {booking.status_label}
            </span>
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted">Appliance</dt>
              <dd className="font-medium text-ink">{APPLIANCE_LABELS[booking.appliance_type] ?? booking.appliance_type}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Preferred visit</dt>
              <dd className="font-medium text-ink">
                {booking.preferred_date ? formatDay(booking.preferred_date) : "Not given"}
                {booking.preferred_time_slot
                  ? `, ${SLOT_LABELS[booking.preferred_time_slot] ?? booking.preferred_time_slot}`
                  : ""}
              </dd>
            </div>
          </dl>

          {booking.status === "requested" ? (
            <p className="rounded-xl border border-border bg-surface-muted p-4 text-sm text-ink">
              This is a request. Our service team will contact you to confirm the visit. You will get an email when it is
              confirmed.
            </p>
          ) : null}
          {booking.status === "confirmed" || booking.status === "technician_assigned" ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Your visit is confirmed. Keep this reference for any questions about your visit.
            </p>
          ) : null}
        </section>
      ) : null}
      {booking?.message ? (
        <section aria-labelledby="message-heading" className="rounded-2xl border border-brand/20 bg-brand-soft/40 p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="message-heading" className="font-semibold text-ink">Message from RoboCare</h2>
              <p className="mt-0.5 text-xs text-ink-muted">Updated {formatWhen(booking.message.updated_at)}</p>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink">{booking.message.text}</p>
        </section>
      ) : null}
    </div>
  );
}
