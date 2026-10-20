"use client";

import { Loader2, Search, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form-fields";
import { ApiError, getJson } from "@/lib/api";
import { SUPPORT_REFERENCE_RE } from "@/lib/support";

type Timeline = { at: string; message: string; kind: "response" | "status" };

type TicketView = {
  reference: string;
  status: string;
  status_label: string;
  appliance_type: string;
  issue_category: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_summary: string | null;
  responses: { message: string; published_at: string }[];
  status_updates: { message: string; at: string }[];
};

const APPLIANCE_LABELS: Record<string, string> = { robot_vacuum: "Robot vacuum", dishwasher: "Dishwasher" };

const STATUS_TONES: Record<string, string> = {
  open: "bg-sky-50 text-sky-800 ring-sky-200",
  in_progress: "bg-amber-50 text-amber-800 ring-amber-200",
  waiting_for_customer: "bg-violet-50 text-violet-800 ring-violet-200",
  waiting_for_technician: "bg-violet-50 text-violet-800 ring-violet-200",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  closed: "bg-surface-muted text-ink-muted ring-border",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// Accepts "sup-2026-0002", " SUP-2026-0002 " and similar. Only the normalized form is ever sent.
export function normalizeReference(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function CheckTicketForm() {
  const [input, setInput] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketView | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reference = normalizeReference(input);
    setError(null);
    setTicket(null);
    if (!SUPPORT_REFERENCE_RE.test(reference)) {
      setFieldError("Enter the reference exactly as shown, for example SUP-2026-0002.");
      return;
    }
    setFieldError(null);
    setLoading(true);
    try {
      const data = await getJson<TicketView>(`/support/lookup/${encodeURIComponent(reference)}`);
      setTicket(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We could not check that reference right now. Please try again shortly.",
      );
    } finally {
      setLoading(false);
    }
  }

  const timeline: Timeline[] = ticket
    ? [
        ...ticket.responses.map((r) => ({ at: r.published_at, message: r.message, kind: "response" as const })),
        ...ticket.status_updates.map((s) => ({ at: s.at, message: s.message, kind: "status" as const })),
      ].sort((a, b) => a.at.localeCompare(b.at))
    : [];

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <Field label="Ticket reference" hint="The reference we sent when you raised the ticket, for example SUP-2026-0002." error={fieldError ?? undefined}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="reference"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="SUP-2026-0002"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              invalid={invalid}
              describedBy={describedBy}
            />
          )}
        </Field>
        <Button type="submit" className="mt-4 w-full sm:w-auto" disabled={loading || input.trim() === ""}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden="true" /> Check Ticket
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

      {ticket ? (
        <section aria-labelledby="ticket-heading" className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-ink-muted">Reference</p>
              <h2 id="ticket-heading" className="font-mono text-2xl font-semibold tracking-wide text-ink">
                {ticket.reference}
              </h2>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${STATUS_TONES[ticket.status] ?? STATUS_TONES.open}`}
            >
              {ticket.status_label}
            </span>
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted">Appliance</dt>
              <dd className="font-medium text-ink">{APPLIANCE_LABELS[ticket.appliance_type] ?? ticket.appliance_type}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Issue</dt>
              <dd className="font-medium text-ink">{ticket.issue_category}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Raised</dt>
              <dd className="font-medium text-ink">{formatWhen(ticket.created_at)}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Last updated</dt>
              <dd className="font-medium text-ink">{formatWhen(ticket.updated_at)}</dd>
            </div>
          </dl>

          {ticket.resolution_summary ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Resolution</p>
              <p className="mt-1 whitespace-pre-line">{ticket.resolution_summary}</p>
              {ticket.resolved_at ? <p className="mt-2 text-xs">Resolved {formatWhen(ticket.resolved_at)}</p> : null}
            </div>
          ) : null}

          <div>
            <h3 className="font-semibold text-ink">Updates from RoboCare Support</h3>
            {ticket.responses.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                The support team has not published a response to this ticket yet. Check back later, quoting your reference.
              </p>
            ) : null}
            {timeline.length > 0 ? (
              <ol className="mt-4 space-y-4 border-l-2 border-border pl-5">
                {timeline.map((item) => (
                  <li key={`${item.kind}-${item.at}-${item.message}`} className="relative">
                    <span
                      className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ${item.kind === "response" ? "bg-brand" : "bg-border"}`}
                      aria-hidden="true"
                    />
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      {item.kind === "response" ? "Support response" : "Status update"} · {formatWhen(item.at)}
                    </p>
                    <p className={`mt-1 whitespace-pre-line text-sm ${item.kind === "response" ? "text-ink" : "text-ink-muted"}`}>
                      {item.message}
                    </p>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
