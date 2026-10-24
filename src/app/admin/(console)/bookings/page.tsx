"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { CustomerTypeBadge, DataTable, ErrorBanner, Column, formatDate, PageHeader, Pagination, Panel, StatusBadge } from "@/components/admin/ui";
import { TextInput, SelectInput } from "@/components/ui/form-fields";
import { BOOKING_STATUSES } from "@/lib/admin-workflow";

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  appliance_type: string;
  brand: string;
  problem_category: string;
  customer_name: string;
  customer_type: string;
  customer_mobile: string;
  pincode: string;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  created_at: string;
};

export default function BookingsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [appliance, setAppliance] = useState("");
  const [pincode, setPincode] = useState("");
  const [page, setPage] = useState(1);

  const path = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (appliance) params.set("appliance_type", appliance);
    if (/^\d{6}$/.test(pincode)) params.set("pincode", pincode);
    return `/admin/bookings?${params.toString()}`;
  }, [q, status, appliance, pincode, page]);

  const list = useApiData<BookingRow[]>(path);

  const columns: Column<BookingRow>[] = [
    { key: "reference", header: "Reference", render: (row) => row.reference },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <>
          <p className="font-medium">{row.customer_name}</p>
          <p className="text-xs text-ink-muted">{row.customer_mobile}</p>
          <div className="mt-1"><CustomerTypeBadge value={row.customer_type} /></div>
        </>
      ),
    },
    {
      key: "appliance",
      header: "Appliance",
      render: (row) => (
        <>
          <p>{row.appliance_type.replace("_", " ")}</p>
          <p className="text-xs text-ink-muted">{row.brand}</p>
        </>
      ),
    },
    { key: "problem", header: "Problem", render: (row) => row.problem_category.replace(/_/g, " "), className: "hidden md:table-cell" },
    {
      key: "preferred",
      header: "Preferred",
      render: (row) => (
        <>
          <p>{formatDate(row.preferred_date)}</p>
          <p className="text-xs text-ink-muted">{row.preferred_time_slot ?? "—"}</p>
        </>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
  ];

  const resetPage = (apply: () => void) => {
    apply();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Booking requests" description="Requests from the website. A request is not confirmed until you confirm it." />

      <Panel className="grid gap-4 p-4 md:grid-cols-4">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-ink">Search</span>
          <TextInput
            className="mt-1.5"
            value={q}
            onChange={(event) => resetPage(() => setQ(event.target.value))}
            placeholder="Reference, name or mobile"
            maxLength={100}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Status</span>
          <SelectInput className="mt-1.5" value={status} onChange={(event) => resetPage(() => setStatus(event.target.value))}>
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ")}
              </option>
            ))}
          </SelectInput>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-ink">Appliance</span>
            <SelectInput className="mt-1.5" value={appliance} onChange={(event) => resetPage(() => setAppliance(event.target.value))}>
              <option value="">All</option>
              <option value="robot_vacuum">Robot vacuum</option>
              <option value="dishwasher">Dishwasher</option>
            </SelectInput>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Pincode</span>
            <TextInput
              className="mt-1.5"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(event) => resetPage(() => setPincode(event.target.value.trim()))}
            />
          </label>
        </div>
      </Panel>

      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.loading ? <p className="px-6 py-10 text-center text-sm text-ink-muted">Loading bookings…</p> : null}
        {list.data ? (
          <>
            <DataTable
              columns={columns}
              rows={list.data}
              href={(row) => `/admin/bookings/${row.id}`}
              empty={{
                title: "No booking requests match these filters",
                text: "Try clearing the filters. New requests from the website appear here automatically.",
              }}
            />
            <Pagination meta={list.meta} onPage={setPage} />
          </>
        ) : null}
      </Panel>
    </div>
  );
}
