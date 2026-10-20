"use client";

import { type FormEvent, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { Column, DataTable, ErrorBanner, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form-fields";
import { ApiError, CSRF_HEADERS, apiRequest, patchJson, postJson } from "@/lib/api";

type Area = { id: string; city: string; area: string | null; pincode: string; is_active: boolean };

export default function ServiceAreasPage() {
  const list = useApiData<Area[]>("/admin/service-areas?page_size=100");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await postJson("/admin/service-areas", { city, area: area || null, pincode }, CSRF_HEADERS);
      setArea("");
      setPincode("");
      list.reload();
    } catch (err) {
      const detail = err instanceof ApiError && err.details[0] ? err.details[0].message : null;
      setError(detail ?? (err instanceof ApiError ? err.message : "The pincode could not be added."));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(row: Area) {
    setError(null);
    try {
      await patchJson(`/admin/service-areas/${row.id}`, { is_active: !row.is_active });
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The change could not be saved.");
    }
  }

  async function remove(row: Area) {
    const confirmed = window.confirm(
      `Delete pincode ${row.pincode} (${row.city})? New bookings will be refused there. Existing bookings keep their pincode.`,
    );
    if (!confirmed) return;
    setError(null);
    try {
      await apiRequest(`/admin/service-areas/${row.id}`, { method: "DELETE", headers: { ...CSRF_HEADERS } });
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The pincode could not be deleted. Nothing was changed.");
    }
  }

  const columns: Column<Area>[] = [
    { key: "city", header: "City", render: (row) => row.city },
    { key: "area", header: "Area", render: (row) => row.area ?? "—" },
    { key: "pincode", header: "Pincode", render: (row) => <span className="font-mono">{row.pincode}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.is_active ? "completed" : "cancelled"} /> },
    {
      key: "action",
      header: "",
      render: (row) => (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => toggle(row)} className="text-sm font-medium text-brand hover:underline">
            {row.is_active ? "Deactivate" : "Activate"}
          </button>
          <button type="button" onClick={() => remove(row)} className="text-sm font-medium text-danger hover:underline">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Service areas" description="Pincodes where home service is offered. Deactivating a pincode stops new bookings there immediately." />
      {error ? <ErrorBanner message={error} /> : null}
      <Panel className="p-6">
        <h2 className="font-semibold text-ink">Add a pincode</h2>
        <form onSubmit={add} noValidate className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <Field label="City" required>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} value={city} onChange={(e) => setCity(e.target.value)} describedBy={describedBy} invalid={invalid} maxLength={80} />
            )}
          </Field>
          <Field label="Area" hint="Optional">
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} value={area} onChange={(e) => setArea(e.target.value)} describedBy={describedBy} invalid={invalid} maxLength={120} />
            )}
          </Field>
          <Field label="Pincode" required>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.trim())} describedBy={describedBy} invalid={invalid} />
            )}
          </Field>
          <Button type="submit" disabled={busy || city.trim().length < 2 || !/^\d{6}$/.test(pincode)}>
            {busy ? "Adding…" : "Add pincode"}
          </Button>
        </form>
      </Panel>
      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.data ? <DataTable columns={columns} rows={list.data} empty={{ title: "No service areas yet", text: "Add the pincodes you serve above." }} /> : null}
      </Panel>
    </div>
  );
}
