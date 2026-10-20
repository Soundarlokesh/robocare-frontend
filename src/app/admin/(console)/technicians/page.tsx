"use client";

import { type FormEvent, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { Column, DataTable, ErrorBanner, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form-fields";
import { ApiError, CSRF_HEADERS, patchJson, postJson } from "@/lib/api";

type Technician = { id: string; full_name: string; mobile: string; is_active: boolean };

export default function TechniciansPage() {
  const list = useApiData<Technician[]>("/admin/technicians?page_size=100");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await postJson("/admin/technicians", { full_name: name, mobile }, CSRF_HEADERS);
      setName("");
      setMobile("");
      list.reload();
    } catch (err) {
      const detail = err instanceof ApiError && err.details[0] ? err.details[0].message : null;
      setError(detail ?? (err instanceof ApiError ? err.message : "The technician could not be added."));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(row: Technician) {
    setError(null);
    try {
      await patchJson(`/admin/technicians/${row.id}`, { is_active: !row.is_active });
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The change could not be saved.");
    }
  }

  const columns: Column<Technician>[] = [
    { key: "name", header: "Technician", render: (row) => row.full_name },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile },
    { key: "status", header: "Status", render: (row) => (row.is_active ? "Active" : "Inactive") },
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
      <PageHeader title="Technicians" description="Field technicians who can be assigned to service tickets." />
      {error ? <ErrorBanner message={error} /> : null}
      <Panel className="p-6">
        <h2 className="font-semibold text-ink">Add a technician</h2>
        <form onSubmit={add} noValidate className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Full name" required>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} value={name} onChange={(e) => setName(e.target.value)} describedBy={describedBy} invalid={invalid} maxLength={120} />
            )}
          </Field>
          <Field label="Mobile" required hint="10-digit Indian mobile">
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} describedBy={describedBy} invalid={invalid} maxLength={20} />
            )}
          </Field>
          <Button type="submit" disabled={busy || name.trim().length < 2 || mobile.trim() === ""}>
            {busy ? "Adding…" : "Add technician"}
          </Button>
        </form>
      </Panel>
      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.data ? (
          <DataTable columns={columns} rows={list.data} empty={{ title: "No technicians yet", text: "Add a technician above, then assign them to tickets." }} />
        ) : null}
      </Panel>
    </div>
  );
}
