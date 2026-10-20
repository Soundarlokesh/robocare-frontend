"use client";

import { BarChart3, CalendarCheck, Inbox, LayoutDashboard, LifeBuoy, LogOut, MapPin, MessageSquare, Package, Tag, Ticket, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminRole, AdminUser } from "@/lib/admin-session";
import { ApiError, postEmpty } from "@/lib/api";

const ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; roles: AdminRole[] }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ["admin", "service_manager"] },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, roles: ["admin", "service_manager"] },
  { href: "/admin/leads", label: "Leads", icon: Inbox, roles: ["admin", "service_manager"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["admin", "service_manager"] },
  { href: "/admin/support", label: "Support tickets", icon: LifeBuoy, roles: ["admin", "service_manager"] },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, roles: ["admin", "service_manager"] },
  { href: "/admin/tickets", label: "Service tickets", icon: Ticket, roles: ["admin", "service_manager", "technician"] },
  { href: "/admin/technicians", label: "Technicians", icon: Wrench, roles: ["admin", "service_manager"] },
  { href: "/admin/services", label: "Services", icon: Package, roles: ["admin", "service_manager"] },
  { href: "/admin/product-brands", label: "Product brands", icon: Tag, roles: ["admin", "service_manager"] },
  { href: "/admin/service-areas", label: "Service areas", icon: MapPin, roles: ["admin", "service_manager"] },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "service_manager"] },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Administrator",
  service_manager: "Service manager",
  technician: "Technician",
};

export function AdminShell({ admin, children }: { admin: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visible = ITEMS.filter((item) => item.roles.includes(admin.role));

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
    <div className="min-h-screen bg-background lg:flex">
      <aside className="border-b border-border bg-surface lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">R</span>
            RoboCare Admin
          </Link>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {visible.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-brand-soft font-semibold text-brand" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-border p-4 lg:block">
          <p className="truncate text-sm font-medium text-ink">{admin.full_name}</p>
          <p className="text-xs text-ink-muted">{ROLE_LABEL[admin.role]}</p>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-3 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
          {error ? <p role="alert" className="mt-2 text-xs text-danger">{error}</p> : null}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <p className="text-sm text-ink-muted">
            {admin.full_name} · {ROLE_LABEL[admin.role]}
          </p>
          <button type="button" onClick={signOut} disabled={signingOut} className="text-sm font-medium text-brand disabled:opacity-60">
            Sign out
          </button>
        </header>
        <main id="admin-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
