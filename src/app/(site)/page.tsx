import { ArrowRight, Camera, CalendarCheck, ClipboardList, LifeBuoy, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, Container, Section } from "@/components/ui/layout";
import { SITE, whatsappLink, WHATSAPP_PREFILL } from "@/lib/site";

export const metadata = {
  title: "Robot Vacuum & Dishwasher Service",
  description:
    "Robot vacuum and dishwasher service, repair, accessories and AMC. Book a home service request online and get a booking reference.",
};

const SERVICES = [
  { href: "/services/robot-vacuum-repair", title: "Robot vacuum repair", text: "Not charging, navigation, brush and mopping problems, error codes and more." },
  { href: "/services/dishwasher-repair", title: "Dishwasher repair", text: "Drainage, water inlet, leakage, door and heating problems, and error codes." },
  { href: "/services", title: "Service & maintenance", text: "Cleaning, deep cleaning, installation and preventive maintenance for both appliances." },
  { href: "/services", title: "Accessories & spare parts", text: "Filters, brushes and accessories, checked for compatibility with your model." },
];

const STEPS = [
  { icon: MessageCircle, title: "Tell us the problem", text: "Use the booking form or chat with our assistant to describe the appliance and the issue." },
  { icon: Camera, title: "Share photos (optional)", text: "Add a photo of the appliance, the model label or the error code to help us prepare." },
  { icon: CalendarCheck, title: "We confirm the visit", text: "Our service team contacts you to confirm the appointment time. Requests are not auto-confirmed." },
  { icon: Wrench, title: "Home service visit", text: "A technician inspects the appliance and explains what they find before any work starts." },
];

const REASONS = [
  { icon: ShieldCheck, title: "Honest inspection first", text: "We won't promise a repair or a cost before we have looked at the appliance." },
  { icon: ClipboardList, title: "Clear booking reference", text: "Every request gets a reference number from our system, so you can quote it when you contact us." },
  { icon: Camera, title: "Photos with your request", text: "Upload the appliance, model label or error code so the team arrives with the right information." },
  { icon: MessageCircle, title: "Talk to a person", text: "The assistant can answer simple questions. You can always ask for a human on WhatsApp or the contact page." },
];

const BRANDS = {
  "Robot vacuums": ["Xiaomi", "Dreame", "Roborock", "Ecovacs", "iRobot"],
  Dishwashers: ["Bosch", "IFB", "LG", "Samsung", "Siemens", "Whirlpool"],
};

export default function HomePage() {
  const waLink = whatsappLink(WHATSAPP_PREFILL);
  return (
    <>
      <section className="relative overflow-hidden bg-surface">
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
              Robot vacuum & dishwasher specialists
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Smart Appliance Care at Your Doorstep
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              Robot Vacuum &amp; Dishwasher Service, Repair, Accessories &amp; AMC
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/book">
                Book Home Service <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/support" variant="secondary">
                <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Customer Support
              </ButtonLink>
              {waLink ? (
                <ButtonLink href={waLink} variant="secondary" external>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp Us
                </ButtonLink>
              ) : null}
            </div>
            <p className="mt-6 text-sm text-ink-muted">
              Submitting a form sends a booking request. Our team confirms the appointment with you.
            </p>
          </div>

          <Card className="p-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">How a visit starts</p>
            <ol className="mt-5 space-y-5">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </Container>
      </section>

      <Section id="services" eyebrow="Services" title="Everything for your robot vacuum and dishwasher" intro="Choose the service that matches your problem. You can describe it in the booking form or to the assistant.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <Link key={service.title} href={service.href} className="group rounded-2xl border border-border bg-surface p-6 shadow-card transition-colors hover:border-brand/50">
              <p className="font-semibold text-ink group-hover:text-brand">{service.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{service.text}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="muted" eyebrow="Why choose us" title="Clear steps from the first message to the visit" intro="We built the process around what you need: an accurate request, a confirmed visit and an honest diagnosis.">
        <div className="grid gap-5 md:grid-cols-2">
          {REASONS.map((reason) => (
            <Card key={reason.title} className="flex gap-4">
              <reason.icon className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="font-semibold text-ink">{reason.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{reason.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Brands" title="Brands we support" intro="Choose your brand on the booking form. If yours is not listed, pick Other and tell us the model.">
        <div className="grid gap-5 md:grid-cols-2">
          {Object.entries(BRANDS).map(([group, brands]) => (
            <Card key={group}>
              <p className="font-semibold text-ink">{group}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <li key={brand} className="rounded-full border border-border px-3 py-1 text-sm text-ink">
                    {brand}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="muted" eyebrow="Service areas" title="Check if we cover your pincode">
        <Card className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-xl text-ink-muted">
            Home service is offered in selected cities. Check your pincode before you book, so you know we can reach you.
          </p>
          <ButtonLink href="/service-areas" variant="secondary">
            View service areas
          </ButtonLink>
        </Card>
      </Section>

      <Section tone="muted" eyebrow="Contact" title="Ready when you are">
        <Card className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-semibold text-ink">Book a home service request in a few minutes.</p>
            <p className="mt-1 text-ink-muted">
              {SITE.phone ? `Phone: ${SITE.phone}` : "Prefer to talk? Send us an enquiry and we will reply."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/book">Book Home Service</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact us
            </ButtonLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
