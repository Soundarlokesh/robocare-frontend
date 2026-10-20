"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { Column, DataTable, ErrorBanner, formatDateTime, PageHeader, Pagination, Panel, StatusBadge } from "@/components/admin/ui";
import { SelectInput, TextInput } from "@/components/ui/form-fields";
import { LEAD_SCORES, LEAD_STATUSES } from "@/lib/admin-workflow";
import { ApiError, patchJson } from "@/lib/api";

type LeadRow = {
  id: string;
  reference: string;
  source: string;
  lead_score: string;
  status: string;
  full_name: string | null;
  mobile: string | null;
  appliance_type: string | null;
  brand: string | null;
  problem: string | null;
  booking_reference: string | null;
  created_at: string;
};

export default function LeadsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [score, setScore] = useState("");
  const [page, setPage] = useState(1);
  const [rowError, setRowError] = useState<string | null>(null);

  const path = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (score) params.set("lead_score", score);
    return `/admin/leads?${params.toString()}`;
  }, [q, status, score, page]);
  const list = useApiData<LeadRow[]>(path);

  async function update(id: string, body: { status?: string; lead_score?: string }) {
    setRowError(null);
    try {
      await patchJson(`/admin/leads/${id}`, body);
      list.reload();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "The lead could not be updated.");
    }
  }

  const columns: Column<LeadRow>[] = [
    { key: "reference", header: "Reference", render: (row) => row.reference },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <>
          <p className="font-medium">{row.full_name ?? "—"}</p>
          <p className="text-xs text-ink-muted">{row.mobile ?? "No mobile"}</p>
        </>
      ),
    },
    {
      key: "interest",
      header: "Interest",
      render: (row) => (
        <>
          <p>{row.appliance_type ? row.appliance_type.replace("_", " ") : "General"}</p>
          <p className="max-w-xs truncate text-xs text-ink-muted">{row.problem ?? row.booking_reference ?? ""}</p>
        </>
      ),
      className: "hidden md:table-cell",
    },
    { key: "source", header: "Source", render: (row) => row.source.replace("_", " "), className: "hidden lg:table-cell" },
    {
      key: "score",
      header: "Score",
      render: (row) => (
        <SelectInput
          aria-label={`Score for ${row.reference}`}
          value={row.lead_score}
          className="w-28 py-1.5"
          onChange={(event) => update(row.id, { lead_score: event.target.value })}
        >
          {LEAD_SCORES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectInput>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="space-y-2">
          <StatusBadge value={row.status} />
          <SelectInput
            aria-label={`Status for ${row.reference}`}
            value={row.status}
            className="w-44 py-1.5"
            onChange={(event) => update(row.id, { status: event.target.value })}
          >
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ")}
              </option>
            ))}
          </SelectInput>
        </div>
      ),
    },
    { key: "created", header: "Received", render: (row) => formatDateTime(row.created_at), className: "hidden xl:table-cell" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Enquiries from bookings, the contact form and the assistant. Hot leads want service now." />
      <Panel className="grid gap-4 p-4 md:grid-cols-4">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-ink">Search</span>
          <TextInput className="mt-1.5" value={q} maxLength={100} placeholder="Reference, name or mobile" onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Status</span>
          <SelectInput className="mt-1.5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ")}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Score</span>
          <SelectInput className="mt-1.5" value={score} onChange={(e) => { setScore(e.target.value); setPage(1); }}>
            <option value="">All scores</option>
            {LEAD_SCORES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectInput>
        </label>
      </Panel>
      {rowError ? <ErrorBanner message={rowError} /> : null}
      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.loading ? <p className="px-6 py-10 text-center text-sm text-ink-muted">Loading leads…</p> : null}
        {list.data ? (
          <>
            <DataTable columns={columns} rows={list.data} empty={{ title: "No leads match these filters", text: "New enquiries appear here automatically." }} />
            <Pagination meta={list.meta} onPage={setPage} />
          </>
        ) : null}
      </Panel>
    </div>
  );
}
