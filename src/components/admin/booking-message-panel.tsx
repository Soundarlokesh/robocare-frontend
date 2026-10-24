"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { formatDateTime, Panel } from "@/components/admin/ui";
import { ApiError, apiRequest, CSRF_HEADERS } from "@/lib/api";

const MAX_LENGTH = 1000;

// What the admin sees after saving, based on the email outcome from the server.
const EMAIL_NOTE: Record<string, string> = {
  sent: "Saved and emailed to the customer.",
  queued: "Saved. The email is being sent.",
  skipped: "Saved. Email is not set up yet, so the customer was not emailed. They can still see it on the booking check page.",
  failed: "Saved, but the email could not be sent. Try again later.",
  no_email: "Saved. This customer has no email address on file, so they were not emailed. They can still see it on the booking check page.",
};

export function BookingMessagePanel({
  bookingId,
  initialMessage,
  initialAt,
  onSaved,
}: {
  bookingId: string;
  initialMessage: string | null;
  initialAt: string | null;
  onSaved: () => void;
}) {
  const [text, setText] = useState(initialMessage ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(initialAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const trimmed = text.trim();

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const data = await apiRequest<{ admin_message_at: string; email_status: string }>(
        `/admin/bookings/${bookingId}/message`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...CSRF_HEADERS },
          body: JSON.stringify({ message: trimmed }),
        },
      );
      setSavedAt(data.admin_message_at);
      setNotice(EMAIL_NOTE[data.email_status] ?? "Saved.");
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The message could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-ink">Message to customer</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Shown on the customer&apos;s booking check page, and emailed when email is set up.</p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="sr-only">Message to customer</span>
        <textarea
          rows={4}
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="For example: Your requested slot is unavailable. Please choose another available slot."
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-ink-muted">
        <span>{savedAt ? `Last sent ${formatDateTime(savedAt)}` : "Not sent yet"}</span>
        <span>
          {text.length}/{MAX_LENGTH}
        </span>
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
        disabled={saving || trimmed.length === 0}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {saving ? "Sending…" : savedAt ? "Update and resend" : "Save and send"}
      </button>
    </Panel>
  );
}
