"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminSession } from "@/components/admin/session-context";
import { useApiData } from "@/components/admin/use-api-data";
import { DataTable, Column, ErrorBanner, formatDate, formatDateTime, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form-fields";
import { ApiError, postJson } from "@/lib/api";

type CustomerDetail = {
  id: string;
  full_name: string;
  mobile: string;
  whatsapp_number: string | null;
  email: string | null;
  created_at: string;
  bookings: {
    id: string;
    reference: string;
    status: string;
    appliance_type: string;
    brand: string;
    problem_category: string;
    preferred_date: string | null;
    created_at: string;
  }[];
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { admin } = useAdminSession();
  const customer = useApiData<CustomerDetail>(`/admin/customers/${id}`);
  const [confirmText, setConfirmText] = useState("");
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  async function removeCustomer() {
    setRemoving(true);
    setRemoveError(null);
    try {
      await postJson(`/admin/customers/${id}/remove`, { confirm: "REMOVE" });
      router.push("/admin/customers");
    } catch (err) {
      setRemoveError(err instanceof ApiError ? err.message : "The customer could not be removed. Nothing was changed.");
      setRemoving(false);
    }
  }

  if (customer.loading) return <Loading label="Loading customer…" />;
  if (customer.error) return <ErrorBanner message={customer.error} />;
  const data = customer.data;
  if (!data) return null;

  const columns: Column<CustomerDetail["bookings"][number]>[] = [
    { key: "reference", header: "Reference", render: (row) => row.reference },
    { key: "appliance", header: "Appliance", render: (row) => `${row.appliance_type.replace("_", " ")} · ${row.brand}` },
    { key: "problem", header: "Problem", render: (row) => row.problem_category.replace(/_/g, " "), className: "hidden md:table-cell" },
    { key: "preferred", header: "Preferred", render: (row) => formatDate(row.preferred_date) },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "created", header: "Requested", render: (row) => formatDateTime(row.created_at), className: "hidden lg:table-cell" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/admin/customers" className="text-brand hover:underline">
          ← Customers
        </Link>
      </div>
      <PageHeader title={data.full_name} description={`Customer since ${formatDate(data.created_at.slice(0, 10))}`} />
      <Panel className="grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-ink-muted">Mobile</p>
          <p className="font-medium text-ink">{data.mobile}</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">WhatsApp</p>
          <p className="font-medium text-ink">{data.whatsapp_number ?? "Not given"}</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Email</p>
          <p className="font-medium text-ink">{data.email ?? "Not given"}</p>
        </div>
      </Panel>
      <Panel>
        <h2 className="border-b border-border px-6 py-4 font-semibold text-ink">Booking history ({data.bookings.length})</h2>
        <DataTable
          columns={columns}
          rows={data.bookings}
          href={(row) => `/admin/bookings/${row.id}`}
          empty={{ title: "No requests yet", text: "This customer has not submitted a booking request." }}
        />
      </Panel>
      {admin?.role === "admin" ? (
        <Panel className="space-y-4 border-danger/30 p-6">
          <h2 className="font-semibold text-danger">Permanently remove customer</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            This permanently deletes this customer from the records: their details, all of their bookings, support
            tickets, leads, messages, notifications and uploaded photos. It cannot be undone.
          </p>
          <p className="text-sm leading-relaxed text-ink-muted">
            It is refused if this customer has any technician work order, because those hold billing records. An audit
            entry without personal details is kept.
          </p>
          <label className="block max-w-xs">
            <span className="text-sm font-medium text-ink">Type REMOVE to confirm</span>
            <TextInput
              className="mt-1.5"
              value={confirmText}
              autoComplete="off"
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </label>
          {removeError ? <ErrorBanner message={removeError} /> : null}
          <Button variant="danger" disabled={confirmText !== "REMOVE" || removing} onClick={removeCustomer}>
            {removing ? "Removing…" : "Permanently Remove Customer"}
          </Button>
        </Panel>
      ) : null}
    </div>
  );
}
