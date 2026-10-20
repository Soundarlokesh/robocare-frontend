"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { ErrorBanner, formatDateTime, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form-fields";
import { ApiError, getJson, postJson } from "@/lib/api";

type Detail = {
  id: string;
  channel: string;
  sender: string;
  sender_name: string | null;
  subject: string | null;
  body: string;
  status: string;
  matched_reference: string | null;
  received_at: string;
  handled_at: string | null;
  linked_ticket: { id: string; reference: string; status: string } | null;
  linked_booking_id: string | null;
  replies: { body: string; status: string; last_error: string | null; created_at: string }[];
};

type Category = { value: string; label: string };

const CHANNEL_LABELS: Record<string, string> = { whatsapp: "WhatsApp", email: "Email" };

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const message = useApiData<Detail>(`/admin/messages/${id}`);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reply, setReply] = useState("");
  const [ticket, setTicket] = useState({
    customer_name: "",
    mobile: "",
    appliance_type: "robot_vacuum",
    issue_category: "general",
    description: "",
    preferred_contact: "phone",
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<Category[]>("/support/categories")
      .then((data) => active && setCategories(data))
      .catch(() => active && setCategories([]));
    return () => {
      active = false;
    };
  }, []);

  async function run(label: string, action: () => Promise<unknown>, success: string) {
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      message.reload();
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.details.length > 0) {
        setError(err.details.map((d) => `${d.field}: ${d.message}`).join(" "));
      } else {
        setError(err instanceof ApiError ? err.message : "The action could not be completed.");
      }
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await run("reply", () => postJson(`/admin/messages/${id}/reply`, { body: reply.trim() }), "Reply recorded.")) {
      setReply("");
    }
  }

  async function openTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...ticket,
      mobile: ticket.mobile.trim(),
      customer_name: ticket.customer_name.trim(),
      description: ticket.description.trim() || undefined,
    };
    await run("ticket", () => postJson(`/admin/messages/${id}/create-ticket`, payload), "Support ticket opened from this message.");
  }

  if (message.loading) return <Loading label="Loading message…" />;
  if (message.error) return <ErrorBanner message={message.error} />;
  const data = message.data;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${CHANNEL_LABELS[data.channel] ?? data.channel} message`}
        description={`From ${data.sender_name ?? data.sender} · received ${formatDateTime(data.received_at)}`}
        actions={<StatusBadge value={data.status} />}
      />

      {notice ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <Panel className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-surface-muted px-3 py-1">Sender: {data.sender}</span>
          <span className="rounded-full bg-surface-muted px-3 py-1">
            Linked: {data.linked_ticket ? (
              <Link href={`/admin/support/${data.linked_ticket.id}`} className="text-brand hover:underline">
                {data.linked_ticket.reference}
              </Link>
            ) : data.matched_reference ?? "none"}
          </span>
        </div>
        {data.subject ? <p className="font-semibold text-ink">{data.subject}</p> : null}
        <p className="whitespace-pre-line rounded-lg border border-border p-4 text-sm text-ink">{data.body}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={busy !== null || data.status === "handled"}
            onClick={() => run("handled", () => postJson(`/admin/messages/${id}/status`, { status: "handled" }), "Marked as handled.")}
          >
            Mark handled
          </Button>
          <Button
            variant="secondary"
            disabled={busy !== null || data.status === "ignored"}
            onClick={() => run("ignored", () => postJson(`/admin/messages/${id}/status`, { status: "ignored" }), "Marked as ignored.")}
          >
            Ignore
          </Button>
        </div>
      </Panel>

      <Panel className="space-y-4 p-6">
        <h2 className="font-semibold text-ink">Reply to the customer</h2>
        <p className="text-sm text-ink-muted">
          Sent on the same channel. If that channel is not configured yet, the reply is recorded as skipped and nothing is sent.
          {data.linked_ticket ? " Because this message is linked to a ticket, the reply is also published on the customer's check-ticket page." : ""}
        </p>
        <form onSubmit={sendReply} className="space-y-3">
          <Field label="Reply" hint="Up to 2000 characters">
            {({ id: fieldId }) => <TextArea id={fieldId} rows={4} maxLength={2000} value={reply} onChange={(e) => setReply(e.target.value)} />}
          </Field>
          <Button type="submit" disabled={busy !== null || reply.trim() === ""}>
            {busy === "reply" ? "Sending…" : "Send Reply"}
          </Button>
        </form>
        {data.replies.length > 0 ? (
          <ul className="space-y-2 border-t border-border pt-4 text-sm">
            {data.replies.map((item) => (
              <li key={`${item.created_at}-${item.body.slice(0, 20)}`} className="rounded-lg border border-border p-3">
                <p className="whitespace-pre-line text-ink">{item.body}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {formatDateTime(item.created_at)} · {item.status}
                  {item.last_error ? ` · ${item.last_error}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      {!data.linked_ticket ? (
        <Panel className="space-y-4 p-6">
          <h2 className="font-semibold text-ink">Open a support ticket from this message</h2>
          <p className="text-sm text-ink-muted">
            The customer&apos;s message becomes the ticket description unless you write one. A mobile number is required for every ticket.
          </p>
          <form onSubmit={openTicket} className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name">
              {({ id: fieldId }) => (
                <TextInput id={fieldId} value={ticket.customer_name} maxLength={120} onChange={(e) => setTicket({ ...ticket, customer_name: e.target.value })} />
              )}
            </Field>
            <Field label="Mobile number" hint="Indian mobile, for example 9876543210">
              {({ id: fieldId }) => (
                <TextInput id={fieldId} value={ticket.mobile} maxLength={20} onChange={(e) => setTicket({ ...ticket, mobile: e.target.value })} />
              )}
            </Field>
            <Field label="Appliance">
              {({ id: fieldId }) => (
                <SelectInput id={fieldId} value={ticket.appliance_type} onChange={(e) => setTicket({ ...ticket, appliance_type: e.target.value })}>
                  <option value="robot_vacuum">Robot vacuum</option>
                  <option value="dishwasher">Dishwasher</option>
                </SelectInput>
              )}
            </Field>
            <Field label="Issue">
              {({ id: fieldId }) => (
                <SelectInput id={fieldId} value={ticket.issue_category} onChange={(e) => setTicket({ ...ticket, issue_category: e.target.value })}>
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </SelectInput>
              )}
            </Field>
            <Field label="Preferred contact">
              {({ id: fieldId }) => (
                <SelectInput id={fieldId} value={ticket.preferred_contact} onChange={(e) => setTicket({ ...ticket, preferred_contact: e.target.value })}>
                  <option value="phone">Phone call</option>
                  <option value="whatsapp">WhatsApp</option>
                </SelectInput>
              )}
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description (optional)" hint="Leave empty to use the customer's message">
                {({ id: fieldId }) => (
                  <TextArea id={fieldId} rows={3} maxLength={2000} value={ticket.description} onChange={(e) => setTicket({ ...ticket, description: e.target.value })} />
                )}
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy !== null || ticket.customer_name.trim() === "" || ticket.mobile.trim() === ""}>
                {busy === "ticket" ? "Opening…" : "Open Support Ticket"}
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}
    </div>
  );
}
