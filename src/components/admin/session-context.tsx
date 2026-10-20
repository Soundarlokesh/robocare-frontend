"use client";

import { createContext, useContext } from "react";
import type { AdminUser } from "@/lib/admin-session";

const AdminSessionContext = createContext<{ admin: AdminUser } | null>(null);

export function AdminSessionProvider({ admin, children }: { admin: AdminUser; children: React.ReactNode }) {
  return <AdminSessionContext.Provider value={{ admin }}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession(): { admin: AdminUser } {
  const value = useContext(AdminSessionContext);
  if (!value) throw new Error("useAdminSession must be used inside the admin console");
  return value;
}
