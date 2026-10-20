import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-semibold text-ink">{SITE.name}</p>
          <p className="max-w-xs text-sm text-ink-muted">
            Robot vacuum and dishwasher service, repair, accessories and annual maintenance.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm">
          {[...NAV_LINKS, { href: "/contact", label: "Contact" }].map((link) => (
            <Link key={link.href} href={link.href} className="py-1 text-ink-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 text-sm text-ink-muted">
          <p className="font-medium text-ink">Contact</p>
          {SITE.phone ? <p>Phone: {SITE.phone}</p> : null}
          {SITE.email ? <p>Email: {SITE.email}</p> : null}
          <p>
            <Link href="/contact" className="text-brand underline-offset-4 hover:underline">
              Send us an enquiry
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
