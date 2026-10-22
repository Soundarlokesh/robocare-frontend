"use client";

import { useApiData } from "@/components/admin/use-api-data";
import { ErrorBanner, Loading, PageHeader, Panel, StatusBadge, formatMoney } from "@/components/admin/ui";

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
  const m = metrics.data;

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="Overview"
        description="Live figures from the RoboCare database. Nothing on this page is sample data."
      />

      {metrics.error ? <ErrorBanner message={metrics.error} /> : null}
      {metrics.loading ? <Loading label="Loading metrics…" /> : null}

      {m ? (
        <>
          {/* Key numbers: the first thing staff see. Two columns on phones, four on laptops. */}
          <section aria-label="Key figures" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <KeyFigure label="Booking requests" value={m.bookings.total} hint={`${m.bookings.today} today · ${m.bookings.last_7_days} in 7 days`} />
            <KeyFigure label="Open tickets" value={m.tickets.open} hint={`${m.services.completed} completed`} />
            <KeyFigure label="Revenue recorded" value={formatMoney(m.services.revenue_recorded)} hint="From completed tickets" />
            <KeyFigure
              label="Conversion rate"
              value={m.conversion_rate === null ? "—" : `${Math.round(m.conversion_rate * 100)}%`}
              hint="Completed ÷ booking requests"
            />
          </section>

          <section aria-label="Secondary figures" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <KeyFigure label="Leads" value={m.leads.total} hint={`${m.leads.new} new · ${m.leads.by_score.hot} hot`} quiet />
            <KeyFigure label="Customers" value={m.customers.total} hint={`${m.customers.repeat} repeat`} quiet />
            <KeyFigure label="Service areas" value={m.catalogue.active_service_areas} hint="Active" quiet />
            <KeyFigure label="Technicians" value={m.catalogue.active_technicians} hint={`${m.catalogue.active_services} active services`} quiet />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Panel className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-ink">Booking requests</h2>
                  <p className="mt-0.5 text-sm text-ink-muted">Last 14 days</p>
                </div>
              </div>
              {trend.data ? <TrendBars points={trend.data.series.slice(-14)} /> : <Loading label="Loading trend…" />}
              {trend.error ? <div className="mt-4"><ErrorBanner message={trend.error} /></div> : null}
            </Panel>

            <Panel className="p-5 sm:p-6">
              <h2 className="font-semibold text-ink">Bookings by status</h2>
              <p className="mt-0.5 text-sm text-ink-muted">Where each request stands today</p>
              <ul className="mt-5 divide-y divide-border">
                {Object.entries(m.bookings.by_status).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between gap-3 py-3">
                    <StatusBadge value={status} />
                    <span className="text-lg font-semibold tabular-nums text-ink">{count}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-ink-muted">
                A booking request is not an appointment. Confirm the visit from the booking page.
              </p>
            </Panel>
          </div>

          <Panel className="p-5 sm:p-6">
            <h2 className="font-semibold text-ink">Not tracked yet</h2>
            <p className="mt-0.5 text-sm text-ink-muted">These figures show as unavailable rather than estimated.</p>
            <ul className="mt-4 grid gap-3 text-sm text-ink-muted sm:grid-cols-2">
              {Object.entries(m.not_yet_tracked).map(([key, text]) => (
                <li key={key} className="rounded-xl border border-border bg-surface-muted/50 p-3">
                  <span className="font-semibold capitalize text-ink">{key.replace(/_/g, " ")}</span>
                  <span className="mt-0.5 block">{text}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function KeyFigure({ label, value, hint, quiet = false }: { label: string; value: React.ReactNode; hint?: string; quiet?: boolean }) {
  return (
    <Panel className="flex flex-col justify-between gap-3 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className={`font-semibold tracking-tight tabular-nums text-ink ${quiet ? "text-2xl" : "text-2xl sm:text-3xl"}`}>{value}</p>
      {hint ? <p className="text-xs leading-snug text-ink-muted">{hint}</p> : null}
    </Panel>
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
      <div className="flex h-40 items-end gap-1.5 sm:gap-2" role="img" aria-label={`Booking requests per day: ${points.map((p) => `${p.date} ${p.bookings}`).join(", ")}`}>
        {points.map((point) => (
          <div key={point.date} className="flex h-full flex-1 flex-col justify-end">
            <div
              className="rounded-t-md bg-brand/80 transition-colors hover:bg-brand"
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
