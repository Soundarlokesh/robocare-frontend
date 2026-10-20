"use client";

import { type FormEvent, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { Column, DataTable, ErrorBanner, formatMoney, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/form-fields";
import { ApiError, CSRF_HEADERS, patchJson, postJson } from "@/lib/api";

type Service = {
  id: string;
  name: string;
  category: string;
  appliance_type: string;
  price_min: string | null;
  price_max: string | null;
  duration_minutes: number | null;
  is_active: boolean;
};

const EMPTY = { name: "", category: "", appliance_type: "robot_vacuum", price_min: "", price_max: "", duration_minutes: "" };

export default function ServicesPage() {
  const list = useApiData<Service[]>("/admin/services?page_size=100");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body: Record<string, unknown> = { name: form.name, category: form.category, appliance_type: form.appliance_type };
    if (form.price_min) body.price_min = form.price_min;
    if (form.price_max) body.price_max = form.price_max;
    if (form.duration_minutes) body.duration_minutes = Number(form.duration_minutes);
    try {
      await postJson("/admin/services", body, CSRF_HEADERS);
      setForm(EMPTY);
      list.reload();
    } catch (err) {
      const detail = err instanceof ApiError && err.details[0] ? err.details[0].message : null;
      setError(detail ?? (err instanceof ApiError ? err.message : "The service could not be added."));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(row: Service) {
    setError(null);
    try {
      await patchJson(`/admin/services/${row.id}`, { is_active: !row.is_active });
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The change could not be saved.");
    }
  }

  const columns: Column<Service>[] = [
    { key: "name", header: "Service", render: (row) => row.name },
    { key: "category", header: "Category", render: (row) => row.category },
    { key: "appliance", header: "Appliance", render: (row) => row.appliance_type.replace("_", " "), className: "hidden md:table-cell" },
    {
      key: "price",
      header: "Price range",
      render: (row) =>
        row.price_min === null && row.price_max === null
          ? "Not set"
          : `${formatMoney(row.price_min)} – ${formatMoney(row.price_max)}`,
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.is_active ? "completed" : "cancelled"} /> },
    {
      key: "action",
      header: "",
      render: (row) => (
        <button type="button" onClick={() => toggle(row)} className="text-sm font-medium text-brand hover:underline">
          {row.is_active ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="The services RoboCare offers. Leave a price empty until it is confirmed; the website will not show a made-up price." />
      {error ? <ErrorBanner message={error} /> : null}
      <Panel className="p-6">
        <h2 className="font-semibold text-ink">Add a service</h2>
        <form onSubmit={add} noValidate className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name" required>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} describedBy={describedBy} invalid={invalid} maxLength={120} />
            )}
          </Field>
          <Field label="Category" required>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} describedBy={describedBy} invalid={invalid} maxLength={60} />
            )}
          </Field>
          <Field label="Appliance" required>
            {({ id }) => (
              <SelectInput id={id} value={form.appliance_type} onChange={(e) => setForm({ ...form, appliance_type: e.target.value })}>
                <option value="robot_vacuum">Robot vacuum</option>
                <option value="dishwasher">Dishwasher</option>
              </SelectInput>
            )}
          </Field>
          <Field label="Duration (minutes)">
            {({ id }) => (
              <TextInput id={id} inputMode="numeric" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
            )}
          </Field>
          <Field label="Min price (₹)" hint="Optional">
            {({ id }) => <TextInput id={id} inputMode="decimal" value={form.price_min} onChange={(e) => setForm({ ...form, price_min: e.target.value })} />}
          </Field>
          <Field label="Max price (₹)" hint="Optional">
            {({ id }) => <TextInput id={id} inputMode="decimal" value={form.price_max} onChange={(e) => setForm({ ...form, price_max: e.target.value })} />}
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={busy || form.name.trim().length < 2 || form.category.trim().length < 2} className="w-full">
              {busy ? "Adding…" : "Add service"}
            </Button>
          </div>
        </form>
      </Panel>
      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.data ? <DataTable columns={columns} rows={list.data} empty={{ title: "No services yet", text: "Add the services you offer above." }} /> : null}
      </Panel>
    </div>
  );
}
