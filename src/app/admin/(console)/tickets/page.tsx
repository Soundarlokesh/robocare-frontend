"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { Column, DataTable, ErrorBanner, formatDate, formatMoney, PageHeader, Pagination, Panel, StatusBadge } from "@/components/admin/ui";
import { SelectInput } from "@/components/ui/form-fields";
import { TICKET_STATUSES } from "@/lib/admin-workflow";

type TicketRow = {
  id: string;
  reference: string;
  status: string;
  booking_reference: string;
  customer_name: string;
  appliance_type: string;
  brand: string;
  technician: { id: string; full_name: string } | null;
  appointment_date: string | null;
  final_amount: string;
};

export default function TicketsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const path = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (status) params.set("status", status);
    return `/admin/tickets?${params.toString()}`;
  }, [status, page]);
  const list = useApiData<TicketRow[]>(path);

  const columns: Column<TicketRow>[] = [
    { key: "reference", header: "Ticket", render: (row) => row.reference },
    { key: "booking", header: "Booking", render: (row) => row.booking_reference, className: "hidden sm:table-cell" },
    { key: "customer", header: "Customer", render: (row) => row.customer_name },
    { key: "appliance", header: "Appliance", render: (row) => `${row.appliance_type.replace("_", " ")} · ${row.brand}`, className: "hidden md:table-cell" },
    { key: "technician", header: "Technician", render: (row) => row.technician?.full_name ?? "Unassigned" },
    { key: "visit", header: "Visit", render: (row) => formatDate(row.appointment_date), className: "hidden lg:table-cell" },
    { key: "amount", header: "Final amount", render: (row) => formatMoney(row.final_amount), className: "hidden lg:table-cell" },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Service tickets" description="Work orders for home visits. Technicians see only the tickets assigned to them." />
      <Panel className="p-4">
        <label className="block max-w-xs">
          <span className="text-sm font-medium text-ink">Status</span>
          <SelectInput className="mt-1.5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {TICKET_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ")}
              </option>
            ))}
          </SelectInput>
        </label>
      </Panel>
      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.loading ? <p className="px-6 py-10 text-center text-sm text-ink-muted">Loading tickets…</p> : null}
        {list.data ? (
          <>
            <DataTable
              columns={columns}
              rows={list.data}
              href={(row) => `/admin/tickets/${row.id}`}
              empty={{ title: "No service tickets yet", text: "Create a ticket from a booking request to start a home visit." }}
            />
            <Pagination meta={list.meta} onPage={setPage} />
          </>
        ) : null}
      </Panel>
    </div>
  );
}
