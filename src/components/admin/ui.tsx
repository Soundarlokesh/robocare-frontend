import Link from "next/link";
import type { ReactNode } from "react";
import { PageMeta } from "@/lib/api";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-border bg-surface shadow-card ${className}`}>{children}</section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Panel className="relative p-5">
      <span className="absolute inset-x-0 top-0 h-1 bg-brand" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
    </Panel>
  );
}

const STATUS_TONES: Record<string, string> = {
  requested: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-800 ring-sky-200",
  technician_assigned: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-700 ring-stone-300",
  new: "bg-amber-50 text-amber-800 ring-amber-200",
  contacted: "bg-sky-50 text-sky-800 ring-sky-200",
  appointment_scheduled: "bg-sky-50 text-sky-800 ring-sky-200",
  service_completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  payment_pending: "bg-orange-50 text-orange-800 ring-orange-200",
  closed: "bg-stone-100 text-stone-700 ring-stone-300",
  open: "bg-amber-50 text-amber-800 ring-amber-200",
  in_progress: "bg-sky-50 text-sky-800 ring-sky-200",
  awaiting_payment: "bg-orange-50 text-orange-800 ring-orange-200",
  hot: "bg-rose-50 text-rose-800 ring-rose-200",
  warm: "bg-orange-50 text-orange-800 ring-orange-200",
  cold: "bg-slate-100 text-slate-700 ring-slate-300",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = STATUS_TONES[value] ?? "bg-stone-100 text-stone-700 ring-stone-300";
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
      </span>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{text}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
      {message}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-ink-muted" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden="true" />
      {label}
    </div>
  );
}

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty,
  href,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: { title: string; text: string };
  href?: (row: T) => string;
}) {
  if (rows.length === 0) return <Empty title={empty.title} text={empty.text} />;
  return (
    <>
      {/* Phones: one card per row, with each field labelled. */}
      <ul className="divide-y divide-border md:hidden" aria-label="Records">
        {rows.map((row) => (
          <li key={row.id} className="space-y-2.5 px-4 py-4">
            {columns.map((column, index) =>
              index === 0 ? (
                <div key={column.key} className="text-base font-semibold text-ink">
                  {href ? (
                    <Link href={href(row)} className="text-brand underline-offset-4 hover:underline">
                      {column.render(row)}
                    </Link>
                  ) : (
                    column.render(row)
                  )}
                </div>
              ) : (
                <div key={column.key} className="flex items-start justify-between gap-4 text-sm">
                  <span className="shrink-0 text-ink-muted">{column.header}</span>
                  <span className="min-w-0 text-right text-ink">{column.render(row)}</span>
                </div>
              ),
            )}
          </li>
        ))}
      </ul>
      {/* Tablet and laptop: full table. */}
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`whitespace-nowrap px-5 py-3 ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-brand-soft/40">
              {columns.map((column, index) => (
                <td key={column.key} className={`px-5 py-3.5 align-middle text-ink ${column.className ?? ""}`}>
                  {href && index === 0 ? (
                    <Link href={href(row)} className="font-semibold text-brand underline-offset-4 hover:underline">
                      {column.render(row)}
                    </Link>
                  ) : (
                    column.render(row)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

export function Pagination({
  meta,
  onPage,
}: {
  meta: PageMeta | null;
  onPage: (page: number) => void;
}) {
  if (!meta || meta.total === 0) return null;
  const pages = Math.max(1, Math.ceil(meta.total / meta.page_size));
  const button =
    "inline-flex min-h-9 items-center rounded-lg border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-ink shadow-sm transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 border-t border-border bg-surface-muted/50 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-ink-muted">
        Page <span className="font-semibold text-ink">{meta.page}</span> of {pages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPage(meta.page - 1)} disabled={meta.page <= 1} className={button}>
          Previous
        </button>
        <button type="button" onClick={() => onPage(meta.page + 1)} disabled={meta.page >= pages} className={button}>
          Next
        </button>
      </div>
    </nav>
  );
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" });
}

export function formatMoney(value: string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));
}
