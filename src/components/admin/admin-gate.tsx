"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSessionProvider } from "@/components/admin/session-context";
import type { AdminUser } from "@/lib/admin-session";
import { ApiError, apiRequest } from "@/lib/api";

type Gate =
  | { state: "checking" }
  | { state: "ready"; admin: AdminUser }
  | { state: "error"; message: string };

/**
 * Client-side session gate for the admin console. It asks the backend who the signed-in user is
 * (sent with the httpOnly cookie). Unauthenticated visitors are sent to the login page. Every API
 * call is still authorized by the backend, so this gate only controls what is displayed.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>({ state: "checking" });

  useEffect(() => {
    let active = true;
    apiRequest<AdminUser>("/admin/auth/me", { method: "GET" })
      .then((admin) => {
        if (active) setGate({ state: "ready", admin });
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/admin/login");
          return;
        }
        setGate({ state: "error", message: err instanceof ApiError ? err.message : "Your session could not be checked." });
      });
    return () => {
      active = false;
    };
  }, [router]);

  if (gate.state === "checking") {
    return <p className="p-10 text-sm text-ink-muted">Checking your session…</p>;
  }
  if (gate.state === "error") {
    return (
      <div role="alert" className="m-10 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
        {gate.message}
      </div>
    );
  }
  return (
    <AdminSessionProvider admin={gate.admin}>
      <AdminShell admin={gate.admin}>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
