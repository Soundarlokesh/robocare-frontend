"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { Column, DataTable, ErrorBanner, formatDateTime, PageHeader, Pagination, Panel, StatusBadge } from "@/components/admin/ui";
import { SelectInput } from "@/components/ui/form-fields";

type MessageRow = {
  id: string;
  channel: string;
  sender: string;
  sender_name: string | null;
  subject: string | null;
  preview: string;
  status: string;
  matched_reference: string | null;
  received_at: string;
};

const CHANNEL_LABELS: Record<string, string> = { whatsapp: "WhatsApp", email: "Email" };
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  linked: "Linked",
  handled: "Handled",
  ignored: "Ignored",
};

export function MessagesList() {
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const path = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (channel) params.set("channel", channel);
    if (status) params.set("status", status);
    return `/admin/messages?${params.toString()}`;
  }, [channel, status, page]);

  const list = useApiData<MessageRow[]>(path);

  const columns: Column<MessageRow>[] = [
    {
      key: "from",
      header: "From",
      render: (row) => (
        <>
          <p className="font-medium">{row.sender_name ?? row.sender}</p>
          <p className="text-xs text-ink-muted">{row.sender}</p>
        </>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      render: (row) => CHANNEL_LABELS[row.channel] ?? row.channel,
      className: "hidden sm:table-cell",
    },
    {
      key: "message",
      header: "Message",
      render: (row) => (
        <>
          {row.subject ? <p className="text-sm font-medium">{row.subject}</p> : null}
          <p className="line-clamp-2 text-sm text-ink-muted">{row.preview}</p>
        </>
      ),
    },
    {
      key: "linked",
      header: "Linked to",
      render: (row) => row.matched_reference ?? "Not linked",
      className: "hidden lg:table-cell",
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "received", header: "Received", render: (row) => formatDateTime(row.received_at), className: "hidden xl:table-cell" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer messages"
        description="Messages customers sent by WhatsApp or email. Open one to reply, open a support ticket from it, or mark it handled."
      />

      <Panel className="grid gap-4 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Channel</span>
          <SelectInput className="mt-1.5" value={channel} onChange={(e) => { setChannel(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </SelectInput>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Status</span>
          <SelectInput className="mt-1.5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectInput>
        </label>
      </Panel>

      {list.error ? <ErrorBanner message={list.error} /> : null}
      <Panel>
        {list.loading ? <p className="px-6 py-10 text-center text-sm text-ink-muted">Loading messages…</p> : null}
        {list.data ? (
          <>
            <DataTable
              columns={columns}
              rows={list.data}
              href={(row) => `/admin/messages/${row.id}`}
              empty={{ title: "No messages yet", text: "Messages sent to the WhatsApp number or support email appear here." }}
            />
            <Pagination meta={list.meta} onPage={setPage} />
          </>
        ) : null}
      </Panel>
    </div>
  );
}
