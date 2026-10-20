"use client";

import { useApiData } from "@/components/admin/use-api-data";
import { ErrorBanner, Loading, PageHeader, Panel, Stat, StatusBadge, formatMoney } from "@/components/admin/ui";

type Metrics = {
  bookings: { total: number; today: number; last_7_days: number; by_status: Record<string, number> };
  leads: { total: number; new: number; by_score: Record<string, number> };
  tickets: { open: number; by_status: Record<string, number> };
  services: { completed: number; revenue_recorded: string };
  customers: { total: number; repeat: number };
  conversion_rate: number | null;
  catalogue: { active_service_areas: number; active_services: number; active_technicians: number };
  not_yet_tracked: Record<string, string>;
};

type Analytics = {
  series: { date: string; bookings: number; leads: number }[];
};

export default function AdminOverviewPage() {
  const metrics = useApiData<Metrics>("/admin/dashboard/metrics");
  const trend = useApiData<Analytics>("/admin/analytics");

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description="Live figures from the RoboCare database. Nothing on this page is sample data." />

      {metrics.error ? <ErrorBanner message={metrics.error} /> : null}
      {metrics.loading ? <Loading label="Loading metrics…" /> : null}

      {metrics.data ? (
        <>
          <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Booking requests" value={metrics.data.bookings.total} hint={`${metrics.data.bookings.today} today · ${metrics.data.bookings.last_7_days} in 7 days`} />
            <Stat label="Open service tickets" value={metrics.data.tickets.open} hint={`${metrics.data.services.completed} completed`} />
            <Stat label="Revenue recorded" value={formatMoney(metrics.data.services.revenue_recorded)} hint="From completed tickets only" />
            <Stat
              label="Conversion rate"
              value={metrics.data.conversion_rate === null ? "—" : `${Math.round(metrics.data.conversion_rate * 100)}%`}
              hint="Completed ÷ all booking requests"
            />
            <Stat label="Leads" value={metrics.data.leads.total} hint={`${metrics.data.leads.new} new · ${metrics.data.leads.by_score.hot} hot`} />
            <Stat label="Customers" value={metrics.data.customers.total} hint={`${metrics.data.customers.repeat} repeat`} />
            <Stat label="Active service areas" value={metrics.data.catalogue.active_service_areas} />
            <Stat label="Active technicians" value={metrics.data.catalogue.active_technicians} hint={`${metrics.data.catalogue.active_services} active services`} />
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Panel className="p-6">
              <h2 className="font-semibold text-ink">Booking requests, last 14 days</h2>
              {trend.data ? <TrendBars points={trend.data.series.slice(-14)} /> : <Loading label="Loading trend…" />}
              {trend.error ? <ErrorBanner message={trend.error} /> : null}
            </Panel>
            <Panel className="p-6">
              <h2 className="font-semibold text-ink">Bookings by status</h2>
              <ul className="mt-4 space-y-3">
                {Object.entries(metrics.data.bookings.by_status).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between gap-3">
                    <StatusBadge value={status} />
                    <span className="font-semibold text-ink">{count}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-ink-muted">
                Booking requests are not appointments. Confirm an appointment from the booking page.
              </p>
            </Panel>
          </div>

          <Panel className="p-6">
            <h2 className="font-semibold text-ink">Not tracked yet</h2>
            <p className="mt-1 text-sm text-ink-muted">These figures are shown as unavailable instead of estimated.</p>
            <ul className="mt-4 grid gap-2 text-sm text-ink-muted sm:grid-cols-2">
              {Object.entries(metrics.data.not_yet_tracked).map(([key, text]) => (
                <li key={key}>
                  <span className="font-medium text-ink">{key.replace(/_/g, " ")}:</span> {text}
                </li>
              ))}
            </ul>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function TrendBars({ points }: { points: { date: string; bookings: number; leads: number }[] }) {
  const max = Math.max(1, ...points.map((point) => point.bookings));
  const total = points.reduce((sum, point) => sum + point.bookings, 0);
  if (total === 0) {
    return <p className="mt-6 text-sm text-ink-muted">No booking requests in this period yet.</p>;
  }
  return (
    <div className="mt-6">
      <div className="flex h-40 items-end gap-2" role="img" aria-label={`Booking requests per day: ${points.map((p) => `${p.date} ${p.bookings}`).join(", ")}`}>
        {points.map((point) => (
          <div key={point.date} className="flex h-full flex-1 flex-col justify-end">
            <div
              className="rounded-t-md bg-brand/80"
              style={{ height: `${Math.round((point.bookings / max) * 100)}%`, minHeight: point.bookings > 0 ? "4px" : "0" }}
              title={`${point.date}: ${point.bookings} bookings`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-muted">
        <span>{points[0]?.date.slice(5)}</span>
        <span>{points[points.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}
