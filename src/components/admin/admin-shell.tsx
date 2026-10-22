"use client";

import { BarChart3, CalendarCheck, Inbox, LayoutDashboard, LifeBuoy, LogOut, Menu, MapPin, MessageSquare, Package, Tag, Ticket, Users, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminRole, AdminUser } from "@/lib/admin-session";
import { ApiError, postEmpty } from "@/lib/api";

const ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; roles: AdminRole[]; group: string }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ["admin", "service_manager"], group: "Operations" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, roles: ["admin", "service_manager"], group: "Operations" },
  { href: "/admin/leads", label: "Leads", icon: Inbox, roles: ["admin", "service_manager"], group: "Operations" },
  { href: "/admin/support", label: "Support tickets", icon: LifeBuoy, roles: ["admin", "service_manager"], group: "Operations" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, roles: ["admin", "service_manager"], group: "Operations" },
  { href: "/admin/tickets", label: "Service tickets", icon: Ticket, roles: ["admin", "service_manager", "technician"], group: "Operations" },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["admin", "service_manager"], group: "Records" },
  { href: "/admin/technicians", label: "Technicians", icon: Wrench, roles: ["admin", "service_manager"], group: "Records" },
  { href: "/admin/services", label: "Services", icon: Package, roles: ["admin", "service_manager"], group: "Catalogue" },
  { href: "/admin/product-brands", label: "Product brands", icon: Tag, roles: ["admin", "service_manager"], group: "Catalogue" },
  { href: "/admin/service-areas", label: "Service areas", icon: MapPin, roles: ["admin", "service_manager"], group: "Catalogue" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "service_manager"], group: "Insights" },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Administrator",
  service_manager: "Service manager",
  technician: "Technician",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminShell({ admin, children }: { admin: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = ITEMS.filter((item) => item.roles.includes(admin.role));
  const groups = Array.from(new Set(visible.map((item) => item.group)));
  const current = visible.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)));

  async function signOut() {
    setSigningOut(true);
    setError(null);
    try {
      await postEmpty("/admin/auth/logout");
      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      setSigningOut(false);
      setError(err instanceof ApiError ? err.message : "Sign-out failed. Please try again.");
    }
  }

  return (
    <div className="admin-theme min-h-screen lg:flex">
      {/* Top bar: always visible on phones and tablets while the page scrolls. */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white shadow-md lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-white/60">RoboCare Admin</p>
            <p className="truncate text-base font-semibold text-white">{current?.label ?? "Admin"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-brand px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </header>

      <aside
        id="admin-nav"
        className={`bg-ink text-white ${
          menuOpen ? "fixed inset-x-0 bottom-0 top-[65px] z-40 flex flex-col overflow-y-auto" : "hidden"
        } lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:overflow-visible`}
      >
        <div className="hidden items-center gap-3 px-5 py-5 lg:flex lg:border-b lg:border-white/10">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-sm">R</span>
          <div className="min-w-0">
            <p className="font-semibold leading-tight">RoboCare</p>
            <p className="text-xs text-white/55">Admin console</p>
          </div>
        </div>

        <nav
          aria-label="Admin"
          className="flex flex-col gap-1 px-3 py-4 [scrollbar-color:rgb(255_255_255/0.2)_transparent] [scrollbar-width:thin] lg:flex-1 lg:overflow-y-auto"
        >
          {groups.map((group) => (
            <div key={group} className="lg:pt-3 first:lg:pt-0">
              <p className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40 lg:block">{group}</p>
              {visible
                .filter((item) => item.group === group)
                .map((item) => {
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? "bg-brand text-white shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-4 lg:block">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
              {initials(admin.full_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{admin.full_name}</p>
              <p className="truncate text-xs text-white/55">{ROLE_LABEL[admin.role]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
          {error ? <p role="alert" className="mt-2 text-xs text-red-300">{error}</p> : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-border bg-surface/90 px-6 py-3 backdrop-blur lg:flex lg:px-10">
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-wider text-ink-muted">RoboCare Admin</p>
            <p className="truncate text-sm font-semibold text-ink">{current?.label ?? "Admin"}</p>
          </div>
          <p className="text-right text-xs text-ink-muted">
            <span className="block font-medium text-ink">{admin.full_name}</span>
            {ROLE_LABEL[admin.role]}
          </p>
        </header>
        <main id="admin-main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
