import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The session is checked in the browser (AdminGate). Keeping this layout static lets every admin page
// prerender and hydrate normally; the backend still authorizes each request.
export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
