import { ClipboardList, MessageCircle, Phone, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, PageHero, Section } from "@/components/ui/layout";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "Customer Support",
  description: "Report a problem with your robot vacuum or dishwasher service. Our support team reviews every request.",
};

export default function SupportPage() {
  const waLink = whatsappLink("Hi RoboCare, I need help with a service issue.");
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="RoboCare Customer Support"
        intro="Tell us about a problem with a visit, a repair, a delay or a bill. Your request is saved with a reference number, and our support team reviews it."
        actions={
          <>
            <ButtonLink href="/book/check-booking">Check Booking Status</ButtonLink>
            <ButtonLink href="/support/check-ticket" variant="secondary">Check a Ticket</ButtonLink>
          </>
        }
      />

      <Section title="How it works">
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <ClipboardList className="h-6 w-6 text-brand" aria-hidden="true" />
            <p className="mt-3 font-semibold text-ink">1. Describe the problem</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Choose the appliance and the kind of issue, and add your booking or service reference if you have one.
            </p>
          </Card>
          <Card>
            <Search className="h-6 w-6 text-brand" aria-hidden="true" />
            <p className="mt-3 font-semibold text-ink">2. Keep your reference</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              You receive a reference such as SUP-2026-0002. Save it, then use <a href="/support/check-ticket" className="font-medium text-brand underline-offset-4 hover:underline">Check a Ticket</a> to see our responses.
            </p>
          </Card>
          <Card>
            <MessageCircle className="h-6 w-6 text-brand" aria-hidden="true" />
            <p className="mt-3 font-semibold text-ink">3. We follow up</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Our support team investigates and contacts you by phone or WhatsApp, as you prefer, until the issue is resolved.
            </p>
          </Card>
        </div>
      </Section>

      <Section tone="muted" title="Contact us directly">
        <p className="mb-4 text-sm leading-relaxed text-ink-muted">
          You can also message us on WhatsApp or by email. Include your name, mobile number, appliance, and the problem. We
          open a support ticket for you and reply with its reference.
        </p>
        {SITE.email ? (
          <p className="mb-4 text-sm text-ink-muted">
            Email:{" "}
            <a href={`mailto:${SITE.email}`} className="font-medium text-brand underline-offset-4 hover:underline">
              {SITE.email}
            </a>
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {SITE.phone ? (
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              <Phone className="h-4 w-4" aria-hidden="true" /> Call Us
            </a>
          ) : (
            <p className="rounded-lg border border-border bg-surface px-5 py-3 text-sm text-ink-muted">
              Phone support details will be published here once the business confirms them.
            </p>
          )}
          {waLink ? (
            <ButtonLink href={waLink} variant="secondary" external>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp Us
            </ButtonLink>
          ) : (
            <p className="rounded-lg border border-border bg-surface px-5 py-3 text-sm text-ink-muted">
              WhatsApp support will appear here once the business number is configured.
            </p>
          )}
        </div>
      </Section>
    </>
  );
}
