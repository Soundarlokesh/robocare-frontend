import Link from "next/link";
import type { ReactNode } from "react";
import { PageMeta } from "@/lib/api";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border bg-surface shadow-card ${className}`}>{children}</section>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Panel className="p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{text}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <p className="px-6 py-10 text-center text-sm text-ink-muted" aria-live="polite">
      {label}
    </p>
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-surface-muted/60 text-xs uppercase tracking-wider text-ink-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`px-4 py-3 font-medium ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/40">
              {columns.map((column, index) => (
                <td key={column.key} className={`px-4 py-3 align-top text-ink ${column.className ?? ""}`}>
                  {href && index === 0 ? (
                    <Link href={href(row)} className="font-medium text-brand underline-offset-4 hover:underline">
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
  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-ink-muted">
        Page {meta.page} of {pages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPage(meta.page - 1)}
          disabled={meta.page <= 1}
          className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPage(meta.page + 1)}
          disabled={meta.page >= pages}
          className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
        >
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
