"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { ErrorBanner, formatDate, formatMoney, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form-fields";
import { useAdminSession } from "@/components/admin/session-context";
import { TICKET_NEXT, TICKET_STATUSES, TIME_SLOTS } from "@/lib/admin-workflow";
import { ApiError, patchJson } from "@/lib/api";

type Ticket = {
  id: string;
  reference: string;
  status: string;
  booking_id: string;
  booking_reference: string;
  customer_name: string;
  customer_mobile: string;
  appliance_type: string;
  brand: string;
  model_number: string | null;
  problem_category: string;
  address: string;
  technician: { id: string; full_name: string } | null;
  appointment_date: string | null;
  appointment_time_slot: string | null;
  diagnosis: string | null;
  work_completed: string | null;
  parts_used: string | null;
  labour_charge: string;
  spare_parts_cost: string;
  final_amount: string;
  updated_at: string;
};

type Technician = { id: string; full_name: string; is_active: boolean };

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { admin } = useAdminSession();
  const ticket = useApiData<Ticket>(`/admin/tickets/${id}`);
  const technicians = useApiData<Technician[]>(admin.role === "technician" ? null : "/admin/technicians?page_size=100");
  const isManager = admin.role !== "technician";

  const [form, setForm] = useState({
    status: "",
    technician_id: "",
    appointment_date: "",
    appointment_time_slot: "",
    diagnosis: "",
    work_completed: "",
    parts_used: "",
    labour_charge: "0",
    spare_parts_cost: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Copy the server state into the form when a newer version of the ticket arrives (adjust during render).
  const current = ticket.data;
  const [syncedVersion, setSyncedVersion] = useState<string | null>(null);
  if (current && current.updated_at !== syncedVersion) {
    setSyncedVersion(current.updated_at);
    setForm({
      status: current.status,
      technician_id: current.technician?.id ?? "",
      appointment_date: current.appointment_date ?? "",
      appointment_time_slot: current.appointment_time_slot ?? "",
      diagnosis: current.diagnosis ?? "",
      work_completed: current.work_completed ?? "",
      parts_used: current.parts_used ?? "",
      labour_charge: current.labour_charge,
      spare_parts_cost: current.spare_parts_cost,
    });
  }

  if (ticket.loading) return <Loading label="Loading ticket…" />;
  if (ticket.error) return <ErrorBanner message={ticket.error} />;
  if (!current) return null;

  const statusOptions = [current.status, ...(TICKET_NEXT[current.status] ?? [])];

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    // Send only fields the role may change, and only when they differ from the server state.
    const body: Record<string, unknown> = {};
    const set = (key: string, value: unknown) => {
      body[key] = value === "" ? null : value;
    };
    if (form.status !== current!.status) body.status = form.status;
    if (isManager) {
      if (form.technician_id !== (current!.technician?.id ?? "")) set("technician_id", form.technician_id);
      if (form.appointment_date !== (current!.appointment_date ?? "")) set("appointment_date", form.appointment_date);
      if (form.appointment_time_slot !== (current!.appointment_time_slot ?? "")) set("appointment_time_slot", form.appointment_time_slot);
      if (form.labour_charge !== current!.labour_charge) body.labour_charge = form.labour_charge;
      if (form.spare_parts_cost !== current!.spare_parts_cost) body.spare_parts_cost = form.spare_parts_cost;
    }
    if (form.diagnosis !== (current!.diagnosis ?? "")) set("diagnosis", form.diagnosis);
    if (form.work_completed !== (current!.work_completed ?? "")) set("work_completed", form.work_completed);
    if (form.parts_used !== (current!.parts_used ?? "")) set("parts_used", form.parts_used);

    if (Object.keys(body).length === 0) {
      setSaving(false);
      setSaved(true);
      return;
    }
    try {
      await patchJson(`/admin/tickets/${id}`, body);
      setSaved(true);
      ticket.reload();
    } catch (err) {
      if (err instanceof ApiError && err.details.length > 0) {
        setError(err.details.map((d) => d.message).join(" "));
      } else {
        setError(err instanceof ApiError ? err.message : "The ticket could not be saved.");
      }
    } finally {
      setSaving(false);
    }
  }

  const activeTechnicians = (technicians.data ?? []).filter((t) => t.is_active || t.id === current.technician?.id);

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/tickets" className="text-brand hover:underline">
          ← Service tickets
        </Link>
      </div>
      <PageHeader
        title={current.reference}
        description={`${current.customer_name} · ${current.brand} ${current.appliance_type.replace("_", " ")} · booking ${current.booking_reference}`}
        actions={<StatusBadge value={current.status} />}
      />

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]" noValidate>
        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Work record</h2>
            <div className="mt-5 space-y-5">
              <Field label="Diagnosis">
                {({ id: fieldId }) => (
                  <TextArea id={fieldId} rows={3} maxLength={4000} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
                )}
              </Field>
              <Field label="Work completed">
                {({ id: fieldId }) => (
                  <TextArea id={fieldId} rows={3} maxLength={4000} value={form.work_completed} onChange={(e) => setForm({ ...form, work_completed: e.target.value })} />
                )}
              </Field>
              <Field label="Parts used">
                {({ id: fieldId }) => (
                  <TextArea id={fieldId} rows={2} maxLength={4000} value={form.parts_used} onChange={(e) => setForm({ ...form, parts_used: e.target.value })} />
                )}
              </Field>
            </div>
          </Panel>

          {isManager ? (
            <Panel className="p-6">
              <h2 className="font-semibold text-ink">Charges</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Labour charge (₹)">
                  {({ id: fieldId }) => (
                    <TextInput id={fieldId} inputMode="decimal" value={form.labour_charge} onChange={(e) => setForm({ ...form, labour_charge: e.target.value })} />
                  )}
                </Field>
                <Field label="Spare parts cost (₹)">
                  {({ id: fieldId }) => (
                    <TextInput id={fieldId} inputMode="decimal" value={form.spare_parts_cost} onChange={(e) => setForm({ ...form, spare_parts_cost: e.target.value })} />
                  )}
                </Field>
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                Final amount is calculated on the server as labour plus spare parts: <strong className="text-ink">{formatMoney(current.final_amount)}</strong>
              </p>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Status</h2>
            <div className="mt-5 space-y-5">
              <Field label="Status">
                {({ id: fieldId }) => (
                  <SelectInput id={fieldId} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {statusOptions.map((value) => (
                      <option key={value} value={value}>
                        {value.replace(/_/g, " ")}
                      </option>
                    ))}
                  </SelectInput>
                )}
              </Field>
              <p className="text-xs text-ink-muted">
                Options: {TICKET_STATUSES.map((s) => s.replace(/_/g, " ")).join(", ")}. Completing a ticket needs a diagnosis and the work completed.
              </p>
            </div>
          </Panel>

          {isManager ? (
            <Panel className="p-6">
              <h2 className="font-semibold text-ink">Assignment and visit</h2>
              <div className="mt-5 space-y-5">
                <Field label="Technician">
                  {({ id: fieldId }) => (
                    <SelectInput id={fieldId} value={form.technician_id} onChange={(e) => setForm({ ...form, technician_id: e.target.value })}>
                      <option value="">Unassigned</option>
                      {activeTechnicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name}
                          {t.is_active ? "" : " (inactive)"}
                        </option>
                      ))}
                    </SelectInput>
                  )}
                </Field>
                <Field label="Visit date">
                  {({ id: fieldId }) => (
                    <TextInput id={fieldId} type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
                  )}
                </Field>
                <Field label="Visit time slot">
                  {({ id: fieldId }) => (
                    <SelectInput id={fieldId} value={form.appointment_time_slot} onChange={(e) => setForm({ ...form, appointment_time_slot: e.target.value })}>
                      <option value="">Not set</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </SelectInput>
                  )}
                </Field>
                <p className="text-xs text-ink-muted">Address: {current.address} · Visit: {formatDate(current.appointment_date)}</p>
              </div>
            </Panel>
          ) : null}

          {error ? <ErrorBanner message={error} /> : null}
          {saved && !error ? (
            <p role="status" className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
              Saved.
            </p>
          ) : null}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving…" : "Save ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
