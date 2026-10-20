"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { ErrorBanner, formatDate, formatDateTime, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { Button, ButtonLink } from "@/components/ui/button";
import { ApiError, API_BASE_URL, CSRF_HEADERS, patchJson, postJson } from "@/lib/api";
import { BOOKING_ACTION_LABEL, BOOKING_NEXT } from "@/lib/admin-workflow";

type Detail = {
  id: string;
  reference: string;
  status: string;
  appliance_type: string;
  brand: string;
  model_number: string | null;
  purchase_year: number | null;
  warranty_status: string;
  problem_category: string;
  problem_description: string | null;
  error_code: string | null;
  address: string;
  pincode: string;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  confirmed_at: string | null;
  created_at: string;
  customer: { id: string; full_name: string; mobile: string; whatsapp_number: string | null; email: string | null };
  photos: { id: string; kind: string; content_type: string; size_bytes: number; original_filename: string | null }[];
  tickets: { id: string; reference: string; status: string }[];
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const detail = useApiData<Detail>(`/admin/bookings/${id}`);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function moveTo(status: string) {
    setBusy(status);
    setActionError(null);
    setNotice(null);
    try {
      await patchJson(`/admin/bookings/${id}/status`, { status });
      setNotice(`Booking moved to ${status.replace(/_/g, " ")}.`);
      detail.reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "The status could not be updated.");
    } finally {
      setBusy(null);
    }
  }

  async function createTicket() {
    setBusy("ticket");
    setActionError(null);
    try {
      const ticket = await postJson<{ id: string }>("/admin/tickets", { booking_id: id }, CSRF_HEADERS);
      router.push(`/admin/tickets/${ticket.id}`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "The ticket could not be created.");
      setBusy(null);
    }
  }

  if (detail.loading) return <Loading label="Loading booking…" />;
  if (detail.error) return <ErrorBanner message={detail.error} />;
  const booking = detail.data;
  if (!booking) return null;

  const nextStatuses = BOOKING_NEXT[booking.status] ?? [];
  const canCreateTicket = booking.status !== "completed" && booking.status !== "cancelled";

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/bookings" className="text-brand hover:underline">
          ← Booking requests
        </Link>
      </div>
      <PageHeader
        title={booking.reference}
        description={`Requested ${formatDateTime(booking.created_at)}`}
        actions={<StatusBadge value={booking.status} />}
      />

      {actionError ? <ErrorBanner message={actionError} /> : null}
      {notice ? (
        <p role="status" className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Appliance and problem</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <Item label="Appliance" value={booking.appliance_type.replace("_", " ")} />
              <Item label="Brand" value={booking.brand} />
              <Item label="Model" value={booking.model_number ?? "Not given"} />
              <Item label="Purchase year" value={booking.purchase_year ? String(booking.purchase_year) : "Not given"} />
              <Item label="Warranty" value={booking.warranty_status.replace(/_/g, " ")} />
              <Item label="Problem" value={booking.problem_category.replace(/_/g, " ")} />
              <Item label="Error code" value={booking.error_code ?? "None given"} />
              <Item label="Description" value={booking.problem_description ?? "None given"} className="sm:col-span-2" />
            </dl>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Visit</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <Item label="Preferred date" value={formatDate(booking.preferred_date)} />
              <Item label="Preferred slot" value={booking.preferred_time_slot ?? "—"} />
              <Item label="Address" value={booking.address} className="sm:col-span-2" />
              <Item label="Pincode" value={booking.pincode} />
              <Item label="Confirmed at" value={formatDateTime(booking.confirmed_at)} />
            </dl>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Customer photos</h2>
            {booking.photos.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No photos were uploaded with this request.</p>
            ) : (
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {booking.photos.map((photo) => (
                  <li key={photo.id} className="overflow-hidden rounded-xl border border-border">
                    {/* Private file served by the backend, which checks the admin session on each request. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_BASE_URL}/admin/bookings/photos/${photo.id}`}
                      alt={`${photo.kind.replace(/_/g, " ")} for ${booking.reference}`}
                      className="h-40 w-full object-cover"
                    />
                    <p className="px-3 py-2 text-xs text-ink-muted">
                      {photo.kind.replace(/_/g, " ")} · {Math.round(photo.size_bytes / 1024)} KB
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Customer</h2>
            <p className="mt-3 font-medium text-ink">{booking.customer.full_name}</p>
            <p className="text-sm text-ink-muted">{booking.customer.mobile}</p>
            {booking.customer.whatsapp_number ? <p className="text-sm text-ink-muted">WhatsApp {booking.customer.whatsapp_number}</p> : null}
            {booking.customer.email ? <p className="text-sm text-ink-muted">{booking.customer.email}</p> : null}
            <div className="mt-4">
              <ButtonLink href={`/admin/customers/${booking.customer.id}`} variant="secondary" className="py-2">
                View customer history
              </ButtonLink>
            </div>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Update status</h2>
            <p className="mt-1 text-sm text-ink-muted">Only the moves allowed for this booking are shown.</p>
            {nextStatuses.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">This booking is closed. No further status changes are possible.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {nextStatuses.map((next) => (
                  <Button
                    key={next}
                    variant={next === "cancelled" ? "secondary" : "primary"}
                    disabled={busy !== null}
                    onClick={() => moveTo(next)}
                  >
                    {busy === next ? "Saving…" : BOOKING_ACTION_LABEL[next] ?? next}
                  </Button>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Service tickets</h2>
            {booking.tickets.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No ticket yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {booking.tickets.map((ticket) => (
                  <li key={ticket.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/tickets/${ticket.id}`} className="font-medium text-brand hover:underline">
                      {ticket.reference}
                    </Link>
                    <StatusBadge value={ticket.status} />
                  </li>
                ))}
              </ul>
            )}
            {canCreateTicket ? (
              <Button variant="secondary" className="mt-4 w-full" disabled={busy !== null} onClick={createTicket}>
                {busy === "ticket" ? "Creating…" : "Create service ticket"}
              </Button>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Item({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}
