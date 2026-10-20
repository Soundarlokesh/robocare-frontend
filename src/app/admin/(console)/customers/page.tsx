"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { DataTable, Column, ErrorBanner, formatDateTime, PageHeader, Pagination, Panel } from "@/components/admin/ui";
import { TextInput } from "@/components/ui/form-fields";

type CustomerRow = {
  id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  created_at: string;
  booking_count: number;
  repeat_customer: boolean;
};

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const path = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (q.trim()) params.set("q", q.trim());
    return `/admin/customers?${params.toString()}`;
  }, [q, page]);
  const list = useApiData<CustomerRow[]>(path);

  const columns: Column<CustomerRow>[] = [
    { key: "name", header: "Customer", render: (row) => row.full_name },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile },
    { key: "email", header: "Email", render: (row) => row.email ?? "—", className: "hidden md:table-cell" },
    { key: "bookings", header: "Requests", render: (row) => row.booking_count },
    {
      key: "repeat",
      header: "Repeat",
      render: (row) => (row.repeat_customer ? "Yes" : "No"),
      className: "hidden sm:table-cell",
    },
    { key: "joined", header: "First seen", render: (row) => formatDateTime(row.created_at), className: "hidden lg:table-cell" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Everyone who has submitted a booking or enquiry, with their request history." />
      <Panel className="p-4">
        <label className="block max-w-md">
          <span className="text-sm font-medium text-ink">Search</span>
          <TextInput
            className="mt-1.5"
            value={q}
            maxLength={100}
            placeholder="Name, mobile or email"
            onChange={(event) => {
              setQ(event.target.value);
              setPage(1);
            }}
          />
        </label>
      </Panel>
      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.loading ? <p className="px-6 py-10 text-center text-sm text-ink-muted">Loading customers…</p> : null}
        {list.data ? (
          <>
            <DataTable
              columns={columns}
              rows={list.data}
              href={(row) => `/admin/customers/${row.id}`}
              empty={{ title: "No customers yet", text: "Customers appear here after their first booking or enquiry." }}
            />
            <Pagination meta={list.meta} onPage={setPage} />
          </>
        ) : null}
      </Panel>
      <p className="text-xs text-ink-muted">
        Open a customer to see every request. <Link href="/admin/bookings" className="text-brand hover:underline">Browse bookings</Link>.
      </p>
    </div>
  );
}
