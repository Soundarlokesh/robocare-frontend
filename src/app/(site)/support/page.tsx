import { ArrowRight, ClipboardList, Mail, MessageCircle, Phone, Search, Wrench } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "Customer Support",
  description: "Report a problem with your robot vacuum or dishwasher service. Our support team reviews every request.",
};

const STEPS = [
  {
    icon: ClipboardList,
    title: "Describe the problem",
    text: "Choose the appliance and the kind of issue, and add your booking or service reference if you have one.",
  },
  {
    icon: Search,
    title: "Keep your reference",
    text: "You receive a reference such as SUP-2026-0002. Save it, then use Check a Ticket to see our responses.",
    href: "/support/check-ticket",
    linkLabel: "Check a Ticket",
  },
  {
    icon: MessageCircle,
    title: "We follow up",
    text: "Our support team investigates and contacts you by phone or WhatsApp, as you prefer, until the issue is resolved.",
  },
];

export default function SupportPage() {
  const waLink = whatsappLink("Hi RoboCare, I need help with a service issue.");
  return (
    <>
      <PageHero
        backgroundImage="/images/support-hero-bg.webp"
        backgroundClassName="object-[86%_center]"
        eyebrow="Support"
        title="RoboCare Customer Support"
        intro="Tell us about a problem with a visit, a repair, a delay or a bill. Your request is saved with a reference number, and our support team reviews it."
        actions={
          <>
            <ButtonLink href="/book/check-booking">Check Booking Status</ButtonLink>
            <ButtonLink href="/support/check-ticket" variant="secondary">
              Check a Ticket
            </ButtonLink>
          </>
        }
      />

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">From problem to resolution</h2>
            </div>
          </Reveal>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 120}>
                <li className="group flex h-full flex-col rounded-3xl bg-white p-8 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-sm transition group-hover:scale-105">
                      <step.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-sm font-semibold text-brand">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{step.text}</p>
                  {step.href ? (
                    <a href={step.href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline">
                      {step.linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface-muted px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Contact us directly</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Talk to a person</h2>
              <p className="mt-4 leading-relaxed text-ink-muted">
                You can also message us on WhatsApp or by email. Include your name, mobile number, appliance, and the problem.
                We open a support ticket for you and reply with its reference.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid gap-4 sm:grid-cols-2">
              {SITE.phone ? (
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-ink-muted">Call us</span>
                    <span className="block font-semibold text-ink">{SITE.phone}</span>
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm text-ink-muted">Phone support details will be published here once the business confirms them.</p>
                </div>
              )}
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-ink-muted">Message us</span>
                    <span className="block font-semibold text-ink">WhatsApp Us</span>
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm text-ink-muted">WhatsApp support will appear here once the business number is configured.</p>
                </div>
              )}
              {SITE.email ? (
                <a
                  href={`mailto:${SITE.email}`}
                  className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:col-span-2"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-ink-muted">Email</span>
                    <span className="block break-all font-semibold text-ink">{SITE.email}</span>
                  </span>
                </a>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-ink px-8 py-12 text-white sm:flex-row sm:items-center sm:px-12">
            <div className="flex items-start gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-accent">
                <Wrench className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Already booked a visit?</h2>
                <p className="mt-2 max-w-xl text-white/75">Check the status of your booking, or follow an open ticket with its reference.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/book/check-booking">Check Booking Status</ButtonLink>
              <ButtonLink href="/support/check-ticket" variant="secondary">
                Check a Ticket
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
