"use client";

import { Search } from "lucide-react";
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

  function pickScore(value: string) {
    setScore(value);
    setPage(1);
  }

  const columns: Column<LeadRow>[] = [
    {
      key: "reference",
      header: "Lead",
      render: (row) => (
        <>
          <p className="font-mono text-sm font-semibold">{row.reference}</p>
          <p className="text-xs text-ink-muted">{formatDateTime(row.created_at)}</p>
        </>
      ),
    },
    {
      key: "contact",
      header: "Customer",
      render: (row) => (
        <>
          <p className="font-medium">{row.full_name ?? "Name not given"}</p>
          <p className="text-xs text-ink-muted">{row.mobile ?? "No mobile number"}</p>
        </>
      ),
    },
    {
      key: "interest",
      header: "Interest",
      render: (row) => (
        <>
          <p className="capitalize">{row.appliance_type ? row.appliance_type.replace(/_/g, " ") : "General enquiry"}</p>
          <p className="max-w-xs truncate text-xs text-ink-muted">{row.problem ?? row.booking_reference ?? "No details"}</p>
        </>
      ),
      className: "hidden md:table-cell",
    },
    {
      key: "source",
      header: "Source",
      render: (row) => <span className="capitalize">{row.source.replace(/_/g, " ")}</span>,
      className: "hidden lg:table-cell",
    },
    {
      key: "score",
      header: "Lead score",
      render: (row) => (
        <div className="space-y-1.5">
          <StatusBadge value={row.lead_score} />
          <SelectInput
            aria-label={`Lead score for ${row.reference}`}
            value={row.lead_score}
            className="w-full min-w-[7rem] py-2 text-sm"
            onChange={(event) => update(row.id, { lead_score: event.target.value })}
          >
            {LEAD_SCORES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectInput>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="space-y-1.5">
          <StatusBadge value={row.status} />
          <SelectInput
            aria-label={`Status for ${row.reference}`}
            value={row.status}
            className="w-full min-w-[11rem] py-2 text-sm"
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
  ];

  const scoreOptions = [{ value: "", label: "All" }, ...LEAD_SCORES.map((value) => ({ value, label: value }))];

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Enquiries from bookings, the contact form and the assistant. Hot leads need a call first." />

      <Panel className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem] lg:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Find a lead</span>
            <span className="relative mt-1.5 block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <TextInput
                className="pl-10"
                value={q}
                maxLength={100}
                placeholder="Search by reference, name or mobile"
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Pipeline status</span>
            <SelectInput
              className="mt-1.5"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value.replace(/_/g, " ")}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Lead score</p>
          <div role="group" aria-label="Filter by lead score" className="mt-2 flex flex-wrap gap-2">
            {scoreOptions.map((option) => {
              const active = score === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pickScore(option.value)}
                  className={`min-h-11 rounded-full border px-5 text-sm font-semibold capitalize transition ${
                    active ? "border-transparent bg-brand text-white shadow-sm" : "border-border bg-surface text-ink hover:bg-surface-muted"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      {rowError ? <ErrorBanner message={rowError} /> : null}
      {list.error ? <ErrorBanner message={list.error} /> : null}

      <Panel>
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-ink">{list.meta ? `${list.meta.total} lead${list.meta.total === 1 ? "" : "s"}` : "Leads"}</p>
          <p className="hidden text-xs text-ink-muted sm:block">Changes save as soon as you pick a new value.</p>
        </div>
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
