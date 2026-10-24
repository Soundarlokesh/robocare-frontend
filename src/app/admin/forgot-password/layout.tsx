import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "RoboCare Admin Password Reset" },
  robots: { index: false, follow: false },
};

export default function AdminForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
