// Shared admin types. The session itself is an httpOnly cookie set by the backend; the browser sends it
// automatically to the API (same-site localhost), and the frontend never reads or stores the token.

export type AdminRole = "admin" | "service_manager" | "technician";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  technician_id: string | null;
};
