"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { ErrorBanner, PageHeader, Panel, Stat, StatusBadge } from "@/components/admin/ui";
import { TextInput } from "@/components/ui/form-fields";

type Analytics = {
  range: { from: string; to: string; timezone: string };
  series: { date: string; bookings: number; leads: number }[];
  bookings_by_status: Record<string, number>;
  totals: { bookings: number; leads: number };
  conversion_rate: number | null;
};

function isoDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState(isoDaysAgo(29));
  const [to, setTo] = useState(isoDaysAgo(0));
  const path = useMemo(() => `/admin/analytics?date_from=${from}&date_to=${to}`, [from, to]);
  const data = useApiData<Analytics>(path);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Counts from database records, grouped by day in India time (IST). Up to one year at a time." />
      <Panel className="grid gap-4 p-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-ink">From</span>
          <TextInput className="mt-1.5" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">To</span>
          <TextInput className="mt-1.5" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <p className="self-end text-xs text-ink-muted">Conversion = completed ÷ requests in the range.</p>
      </Panel>
      {data.error ? <ErrorBanner message={data.error} /> : null}
      {data.loading ? <p className="text-sm text-ink-muted">Loading…</p> : null}
      {data.data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <Stat label="Booking requests" value={data.data.totals.bookings} />
            <Stat label="Leads" value={data.data.totals.leads} />
            <Stat label="Conversion" value={data.data.conversion_rate === null ? "—" : `${Math.round(data.data.conversion_rate * 100)}%`} />
          </section>
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Daily activity</h2>
            {data.data.series.every((p) => p.bookings === 0 && p.leads === 0) ? (
              <p className="mt-4 text-sm text-ink-muted">No booking requests or leads in this range.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                    <tr>
                      <th scope="col" className="py-2 font-medium">Date</th>
                      <th scope="col" className="py-2 font-medium">Bookings</th>
                      <th scope="col" className="py-2 font-medium">Leads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.data.series
                      .filter((p) => p.bookings > 0 || p.leads > 0)
                      .map((point) => (
                        <tr key={point.date}>
                          <td className="py-2">{point.date}</td>
                          <td className="py-2">{point.bookings}</td>
                          <td className="py-2">{point.leads}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Requests by status in this range</h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(data.data.bookings_by_status).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between">
                  <StatusBadge value={status} />
                  <span className="font-semibold text-ink">{count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
