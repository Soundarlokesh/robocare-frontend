import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Robot Vacuum & Dishwasher Service`,
    template: `%s | ${SITE.name}`,
  },
  description: "Robot vacuum and dishwasher service, repair, accessories and AMC. Book a home service request online.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b5d54",
  width: "device-width",
  initialScale: 1,
};

// Shared shell only. Public pages add the site header (app/(site)/layout.tsx); the admin area has its own layout.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: browsers and extensions (for example focus-visible polyfills) add attributes such as
    // data-js-focus-visible to <html> before React hydrates. Only this element's own attributes are affected.
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
