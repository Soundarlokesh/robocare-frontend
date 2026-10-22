import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="h-1 bg-gradient-to-r from-brand via-brand-strong to-accent" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold">R</span>
            {SITE.name}
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Robot vacuum and dishwasher service, repair, accessories and annual maintenance.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[...NAV_LINKS, { href: "/contact", label: "Contact" }].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md py-1 text-white/75 transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-4 text-sm text-white/75">
          <p className="font-semibold text-white">Contact</p>
          {SITE.phone ? (
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {SITE.phone}
              </a>
            </p>
          ) : null}
          {SITE.email ? (
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="break-all hover:text-white">
                {SITE.email}
              </a>
            </p>
          ) : null}
          <p>
            <Link href="/contact" className="font-semibold text-accent underline-offset-4 hover:underline">
              Send us an enquiry
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/50 sm:px-6">
          © {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
