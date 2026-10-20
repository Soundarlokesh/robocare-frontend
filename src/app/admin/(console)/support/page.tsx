"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { Column, DataTable, ErrorBanner, formatDateTime, PageHeader, Pagination, Panel, StatusBadge } from "@/components/admin/ui";
import { SelectInput, TextInput } from "@/components/ui/form-fields";
import { ApiError, getJson } from "@/lib/api";
import { SUPPORT_PRIORITIES, SUPPORT_STATUS_LABELS } from "@/lib/support";

type Category = { value: string; label: string };
type TicketRow = {
  id: string;
  reference: string;
  status: string;
  priority: string;
  issue_label: string;
  appliance_type: string;
  customer_name: string;
  mobile: string;
  created_at: string;
};

export default function SupportTicketsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [appliance, setAppliance] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<Category[]>("/support/categories")
      .then((data) => active && setCategories(data))
      .catch((err: unknown) => {
        if (active) setCategoryError(err instanceof ApiError ? err.message : "Categories could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  const path = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (category) params.set("category", category);
    if (appliance) params.set("appliance_type", appliance);
    if (createdFrom) params.set("created_from", createdFrom);
    if (createdTo) params.set("created_to", createdTo);
    return `/admin/support/tickets?${params.toString()}`;
  }, [q, status, priority, category, appliance, createdFrom, createdTo, page]);

  const list = useApiData<TicketRow[]>(path);

  const columns: Column<TicketRow>[] = [
    { key: "reference", header: "Reference", render: (row) => row.reference },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <>
          <p className="font-medium">{row.customer_name}</p>
          <p className="text-xs text-ink-muted">{row.mobile}</p>
        </>
      ),
    },
    { key: "issue", header: "Issue", render: (row) => row.issue_label, className: "hidden md:table-cell" },
    { key: "appliance", header: "Appliance", render: (row) => row.appliance_type.replace("_", " "), className: "hidden lg:table-cell" },
    { key: "priority", header: "Priority", render: (row) => row.priority, className: "hidden sm:table-cell" },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "created", header: "Raised", render: (row) => formatDateTime(row.created_at), className: "hidden xl:table-cell" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support tickets" description="Customer-raised problems. Open a ticket to contact the customer, change its status and record the resolution." />

      <Panel className="grid gap-4 p-4 md:grid-cols-3 xl:grid-cols-6">
        <label className="block md:col-span-2 xl:col-span-2">
          <span className="text-sm font-medium text-ink">Search</span>
          <TextInput className="mt-1.5" maxLength={100} value={q} placeholder="Reference, name or mobile" onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Status</span>
          <SelectInput className="mt-1.5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {Object.entries(SUPPORT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectInput>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Priority</span>
          <SelectInput className="mt-1.5" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {SUPPORT_PRIORITIES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectInput>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Issue</span>
          <SelectInput className="mt-1.5" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </SelectInput>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Appliance</span>
          <SelectInput className="mt-1.5" value={appliance} onChange={(e) => { setAppliance(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="robot_vacuum">Robot vacuum</option>
            <option value="dishwasher">Dishwasher</option>
          </SelectInput>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Raised from</span>
          <TextInput className="mt-1.5" type="date" value={createdFrom} onChange={(e) => { setCreatedFrom(e.target.value); setPage(1); }} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Raised to</span>
          <TextInput className="mt-1.5" type="date" value={createdTo} onChange={(e) => { setCreatedTo(e.target.value); setPage(1); }} />
        </label>
      </Panel>

      {categoryError ? <ErrorBanner message={categoryError} /> : null}
      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.loading ? <p className="px-6 py-10 text-center text-sm text-ink-muted">Loading support tickets…</p> : null}
        {list.data ? (
          <>
            <DataTable
              columns={columns}
              rows={list.data}
              href={(row) => `/admin/support/${row.id}`}
              empty={{ title: "No support tickets match these filters", text: "Tickets raised on the support page appear here." }}
            />
            <Pagination meta={list.meta} onPage={setPage} />
          </>
        ) : null}
      </Panel>
      <p className="text-xs text-ink-muted">
        Looking for technician work orders? Use <Link href="/admin/tickets" className="text-brand hover:underline">Service tickets</Link>.
      </p>
    </div>
  );
}
