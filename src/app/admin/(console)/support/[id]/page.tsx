"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { useAdminSession } from "@/components/admin/session-context";
import { ErrorBanner, formatDateTime, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea } from "@/components/ui/form-fields";
import { API_BASE_URL, ApiError, postJson } from "@/lib/api";
import { SUPPORT_PRIORITIES, SUPPORT_STATUS_LABELS, SUPPORT_TRANSITIONS, telUrl, whatsappUrl } from "@/lib/support";

type Detail = {
  id: string;
  reference: string;
  status: string;
  status_label: string;
  priority: string;
  issue_label: string;
  issue_category: string;
  appliance_type: string;
  customer_name: string;
  mobile: string;
  email: string | null;
  brand: string | null;
  model_number: string | null;
  description: string;
  pincode: string | null;
  booking_reference_given: string | null;
  service_reference_given: string | null;
  booking_linked: boolean;
  preferred_contact: string;
  assigned_admin: { id: string; full_name: string } | null;
  resolution_summary: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  photos: { id: string; kind: string; content_type: string; size_bytes: number }[];
  internal_notes: { id: string; message: string; created_at: string }[];
  customer_updates: { id: string; message: string; created_at: string }[];
};

type HistoryEvent = {
  id: string;
  event_type: string;
  visibility: string;
  message: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
};

export default function SupportTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { admin } = useAdminSession();
  const ticket = useApiData<Detail>(`/admin/support/tickets/${id}`);
  const history = useApiData<HistoryEvent[]>(`/admin/support/tickets/${id}/history`);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [update, setUpdate] = useState("");
  const [resolution, setResolution] = useState("");
  const [whatsAppMessage, setWhatsAppMessage] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState("");

  async function run(label: string, action: () => Promise<unknown>, success: string) {
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      ticket.reload();
      history.reload();
    } catch (err) {
      if (err instanceof ApiError && err.details.length > 0) {
        setError(err.details.map((d) => d.message).join(" "));
      } else {
        setError(err instanceof ApiError ? err.message : "The change could not be saved.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run("note", () => postJson(`/admin/support/tickets/${id}/notes`, { body: note.trim() }), "Internal note added. Customers cannot see it.");
    setNote("");
  }

  async function addUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run("update", () => postJson(`/admin/support/tickets/${id}/updates`, { body: update.trim() }), "Update recorded on the ticket.");
    setUpdate("");
  }

  async function resolve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Mark this ticket as resolved? The customer will see the resolution summary.")) return;
    await run("resolve", () => postJson(`/admin/support/tickets/${id}/resolve`, { resolution_summary: resolution.trim() }), "Ticket resolved.");
    setResolution("");
  }

  async function contact(channel: "call" | "whatsapp") {
    // Logs an attempt first. The page never claims the call or message was completed.
    setBusy(channel);
    setError(null);
    try {
      const links = await postJson<{ tel: string; whatsapp_message: string }>(`/admin/support/tickets/${id}/contact`, { channel });
      history.reload();
      if (!ticket.data) return;
      if (channel === "call") {
        window.location.href = telUrl(ticket.data.mobile);
      } else {
        setWhatsAppMessage(whatsAppMessage ?? links.whatsapp_message);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The contact action could not be recorded.");
    } finally {
      setBusy(null);
    }
  }

  if (ticket.loading) return <Loading label="Loading support ticket…" />;
  if (ticket.error) return <ErrorBanner message={ticket.error} />;
  const data = ticket.data;
  if (!data) return null;

  const nextStatuses = SUPPORT_TRANSITIONS[data.status] ?? [];
  const messageText = whatsAppMessage ?? `Hi ${data.customer_name}, this is RoboCare Support regarding your support ticket ${data.reference}. We are contacting you to understand the issue and help resolve it.`;

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/support" className="text-brand hover:underline">← Support tickets</Link>
      </div>
      <PageHeader
        title={data.reference}
        description={`${data.issue_label} · ${data.appliance_type.replace("_", " ")} · raised ${formatDateTime(data.created_at)}`}
        actions={<StatusBadge value={data.status} />}
      />

      {error ? <ErrorBanner message={error} /> : null}
      {notice ? <p role="status" className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">{notice}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Customer and appliance</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <Info label="Customer" value={data.customer_name} />
              <Info label="Mobile" value={data.mobile} />
              <Info label="Email" value={data.email ?? "Not given"} />
              <Info label="Preferred contact" value={data.preferred_contact === "whatsapp" ? "WhatsApp" : "Phone call"} />
              <Info label="Brand" value={data.brand ?? "Not given"} />
              <Info label="Model" value={data.model_number ?? "Not given"} />
              <Info label="Pincode" value={data.pincode ?? "Not given"} />
              <Info label="Booking reference" value={data.booking_reference_given ? `${data.booking_reference_given}${data.booking_linked ? " (linked)" : " (not linked)"}` : "Not given"} />
              <Info label="Service ticket reference" value={data.service_reference_given ?? "Not given"} />
              <Info label="Description" value={data.description} className="sm:col-span-2" />
            </dl>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Photos</h2>
            {data.photos.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No photos were attached.</p>
            ) : (
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {data.photos.map((photo) => (
                  <li key={photo.id} className="overflow-hidden rounded-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${API_BASE_URL}/admin/support/tickets/${data.id}/photos/${photo.id}`} alt={`${photo.kind.replace(/_/g, " ")} for ${data.reference}`} className="h-40 w-full object-cover" />
                    <p className="px-3 py-2 text-xs text-ink-muted">{photo.kind.replace(/_/g, " ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Internal notes (staff only)</h2>
            <ul className="mt-4 space-y-3">
              {data.internal_notes.length === 0 ? <li className="text-sm text-ink-muted">No internal notes yet.</li> : null}
              {data.internal_notes.map((item) => (
                <li key={item.id} className="rounded-lg bg-surface-muted/60 p-3 text-sm">
                  <p className="whitespace-pre-line text-ink">{item.message}</p>
                  <p className="mt-1 text-xs text-ink-muted">{formatDateTime(item.created_at)}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={addNote} className="mt-4 space-y-3">
              <Field label="Internal note" hint="Visible to staff only. Never shown to the customer.">
                {({ id: fieldId }) => <TextArea id={fieldId} rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />}
              </Field>
              <Button type="submit" variant="secondary" disabled={busy !== null || note.trim() === ""}>{busy === "note" ? "Saving…" : "Add Internal Note"}</Button>
            </form>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Customer responses</h2>
            <ul className="mt-4 space-y-3">
              {data.customer_updates.length === 0 ? <li className="text-sm text-ink-muted">No customer responses published yet.</li> : null}
              {data.customer_updates.map((item) => (
                <li key={item.id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="text-ink">{item.message}</p>
                  <p className="mt-1 text-xs text-ink-muted">{formatDateTime(item.created_at)}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={addUpdate} className="mt-4 space-y-3">
              <Field label="Customer response" hint="Published on the customer's check-ticket page as soon as you send it. Do not include internal details.">
                {({ id: fieldId }) => <TextArea id={fieldId} rows={3} maxLength={2000} value={update} onChange={(e) => setUpdate(e.target.value)} />}
              </Field>
              <Button type="submit" disabled={busy !== null || update.trim() === ""}>{busy === "update" ? "Sending…" : "Send Customer Response"}</Button>
            </form>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">History</h2>
            <ol className="mt-4 space-y-2 text-sm">
              {(history.data ?? []).map((event) => (
                <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
                  <span className="text-ink">
                    <span className="font-medium">{event.event_type.replace(/_/g, " ")}</span>
                    {event.visibility === "internal" ? <span className="ml-2 text-xs text-ink-muted">(internal)</span> : null}
                    {event.message ? <span className="block text-ink-muted">{event.message}</span> : null}
                    {event.data ? <span className="block text-xs text-ink-muted">{JSON.stringify(event.data)}</span> : null}
                  </span>
                  <span className="text-xs text-ink-muted">{formatDateTime(event.created_at)}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Status and priority</h2>
            <div className="mt-4 space-y-4">
              <Field label="Move status to" hint="Resolving is done in the Resolution section">
                {({ id: fieldId }) => (
                  <div className="flex gap-2">
                    <SelectInput id={fieldId} value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="flex-1">
                      <option value="">Choose…</option>
                      {nextStatuses.filter((value) => value !== "resolved").map((value) => (
                        <option key={value} value={value}>{SUPPORT_STATUS_LABELS[value]}</option>
                      ))}
                    </SelectInput>
                    <Button
                      variant="secondary"
                      disabled={busy !== null || nextStatus === ""}
                      onClick={() => run("status", () => postJson(`/admin/support/tickets/${id}/status`, { status: nextStatus }), "Status updated.").then(() => setNextStatus(""))}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </Field>
              <Field label="Priority">
                {({ id: fieldId }) => (
                  <SelectInput id={fieldId} value={data.priority} onChange={(e) => run("priority", () => postJson(`/admin/support/tickets/${id}/priority`, { priority: e.target.value }), "Priority updated.")}>
                    {SUPPORT_PRIORITIES.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>
              <div>
                <p className="text-sm text-ink-muted">Assigned to: {data.assigned_admin?.full_name ?? "Nobody yet"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="secondary" disabled={busy !== null || data.assigned_admin?.id === admin.id} onClick={() => run("assign", () => postJson(`/admin/support/tickets/${id}/assign`, { assigned_admin_id: admin.id }), "Assigned to you.")}>
                    Assign to me
                  </Button>
                  {data.assigned_admin ? (
                    <Button variant="ghost" disabled={busy !== null} onClick={() => run("unassign", () => postJson(`/admin/support/tickets/${id}/assign`, { assigned_admin_id: null }), "Assignment cleared.")}>
                      Clear assignment
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Contact the customer</h2>
            <p className="mt-1 text-sm text-ink-muted">Preferred: {data.preferred_contact === "whatsapp" ? "WhatsApp" : "Phone call"}. Each action is recorded as an attempt. It does not mean the conversation happened.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" disabled={busy !== null} onClick={() => contact("call")}>Call customer</Button>
              <Button variant="secondary" disabled={busy !== null} onClick={() => contact("whatsapp")}>Contact on WhatsApp</Button>
            </div>
            {whatsAppMessage !== null ? (
              <div className="mt-4 space-y-3">
                <Field label="Message to review before sending">
                  {({ id: fieldId }) => <TextArea id={fieldId} rows={4} maxLength={1000} value={messageText} onChange={(e) => setWhatsAppMessage(e.target.value)} />}
                </Field>
                <a
                  href={whatsappUrl(data.mobile, messageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
                >
                  Open WhatsApp with this message
                </a>
              </div>
            ) : null}
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Resolution</h2>
            {data.resolution_summary ? (
              <p className="mt-3 whitespace-pre-line text-sm text-ink">{data.resolution_summary}</p>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">Not resolved yet.</p>
            )}
            {nextStatuses.includes("resolved") ? (
              <form onSubmit={resolve} className="mt-4 space-y-3">
                <Field label="Resolution summary" hint="At least 10 characters. The customer sees this when resolved.">
                  {({ id: fieldId }) => <TextArea id={fieldId} rows={3} maxLength={4000} value={resolution} onChange={(e) => setResolution(e.target.value)} />}
                </Field>
                <Button type="submit" disabled={busy !== null || resolution.trim().length < 10}>{busy === "resolve" ? "Saving…" : "Mark as resolved"}</Button>
              </form>
            ) : null}
            {data.status === "resolved" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" disabled={busy !== null} onClick={() => run("reopen", () => postJson(`/admin/support/tickets/${id}/reopen`, {}), "Ticket reopened.")}>Reopen ticket</Button>
                <Button variant="ghost" disabled={busy !== null} onClick={() => window.confirm("Close this ticket? It cannot be reopened after closing.") && run("close", () => postJson(`/admin/support/tickets/${id}/status`, { status: "closed" }), "Ticket closed.")}>Close ticket</Button>
              </div>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line font-medium text-ink">{value}</dd>
    </div>
  );
}
