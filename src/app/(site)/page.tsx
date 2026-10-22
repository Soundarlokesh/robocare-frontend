import {
  ArrowRight,
  CalendarCheck,
  Camera,
  ClipboardList,
  Headphones,
  Home,
  LifeBuoy,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ApplianceTabs, type ApplianceTab } from "@/components/site/appliance-tabs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { whatsappLink, WHATSAPP_PREFILL } from "@/lib/site";

export const metadata = {
  title: "Robot Vacuum & Dishwasher Service",
  description:
    "Robot vacuum and dishwasher service, repair, accessories and AMC. Book a home service request online and get a booking reference.",
};

const STEPS = [
  { icon: MessageCircle, title: "Tell us the problem", text: "Use the booking form or chat with our assistant to describe the appliance and the issue." },
  { icon: Camera, title: "Share photos (optional)", text: "Add a photo of the appliance, the model label or the error code to help us prepare." },
  { icon: CalendarCheck, title: "We confirm the visit", text: "Our service team contacts you to confirm the appointment time. Requests are not auto-confirmed." },
  { icon: Wrench, title: "Home service visit", text: "A technician inspects the appliance and explains what they find before any work starts." },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "Professional appliance care", text: "Technicians inspect the appliance before any work starts." },
  { icon: Home, title: "Convenient home service", text: "Visits at your address in the areas we cover." },
  { icon: ClipboardList, title: "Clear booking process", text: "Every request gets a reference number you can quote later." },
  { icon: Headphones, title: "Customer support", text: "Raise a ticket and check its responses with your reference." },
];

const APPLIANCE_TABS: ApplianceTab[] = [
  {
    key: "robot",
    label: "Robot vacuums",
    title: "Robot vacuum cleaners",
    text: "Service, deep cleaning, repair, installation and accessories.",
    image: "/images/home-robot-vacuum.webp",
    alt: "Robot vacuum cleaner on its docking station",
    services: ["Service & maintenance", "Deep cleaning", "Repair", "Installation", "Accessories"],
  },
  {
    key: "dishwasher",
    label: "Dishwashers",
    title: "Dishwashers",
    text: "Service, cleaning, repair, installation and accessories.",
    image: "/images/home-dishwasher.webp",
    alt: "Stainless steel dishwasher with its racks open",
    services: ["Service & cleaning", "Repair", "Installation", "Accessories"],
  },
];

const BRANDS = {
  "Robot vacuums": ["Xiaomi", "Dreame", "Roborock", "Ecovacs", "iRobot", "Narwal"],
  Dishwashers: ["Bosch", "IFB", "LG", "Samsung", "Siemens", "Whirlpool"],
};

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Inspection before any work" },
  { icon: ClipboardList, label: "Booking reference for every request" },
  { icon: Headphones, label: "Support tickets you can track" },
];

export default function HomePage() {
  const waLink = whatsappLink(WHATSAPP_PREFILL);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white lg:min-h-[640px]">
        <Image
          src="/images/home-hero-scene.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_80%] saturate-125 contrast-105"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/65 to-white/50 lg:bg-gradient-to-r lg:from-white/90 lg:via-white/50 lg:to-transparent"
          aria-hidden="true"
        />
        <Container className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-strong shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              Robot vacuum &amp; dishwasher specialists
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Smart Appliance
              <br />
              Care at Your
              <br />
              <span className="text-brand">Doorstep</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Robot Vacuum &amp; Dishwasher Service, Repair, Accessories &amp; AMC.
            </p>
            <div className="mt-9 flex flex-wrap items-start gap-3">
              <ButtonLink href="/book" className="transition duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Book Home Service <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/support" variant="secondary" className="transition duration-300 hover:-translate-y-0.5 active:translate-y-0">
                <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Customer Support
              </ButtonLink>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-muted">
              Submitting a form sends a booking request. Our team confirms the appointment with you.
            </p>
          </div>
        </Container>
      </section>

      {/* How a visit starts */}
      <section className="bg-surface-muted py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">How a visit starts</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Get Your Appliance Repaired in Simple Steps
              </h2>
            </div>
          </Reveal>
          <ol className="relative mt-10 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <span
              className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent lg:block"
              aria-hidden="true"
            />
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 120}>
                <li className="group relative flex h-full gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:block sm:rounded-3xl sm:p-7">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md transition group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl">
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 sm:mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">Step {index + 1}</p>
                    <p className="mt-1 text-base font-semibold leading-snug text-ink sm:mt-2 sm:text-lg">{step.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted sm:mt-3">{step.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Appliance showcase (tabs) */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Appliances we service</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Robot vacuums and dishwashers</h2>
            </div>
          </Reveal>
          <div className="mt-12">
            <ApplianceTabs tabs={APPLIANCE_TABS} />
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="bg-surface-muted py-16 sm:py-20">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 100}>
                <li className="flex h-full gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <benefit.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{benefit.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{benefit.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Brands */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Brands</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Brands we support</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">
                Choose your brand on the booking form. If yours is not listed, pick Other and tell us the model.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {Object.entries(BRANDS).map(([group, brands], groupIndex) => (
              <Reveal key={group} delay={groupIndex * 120}>
                <div className="h-full rounded-3xl bg-white p-7 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                      {groupIndex === 0 ? <Home className="h-5 w-5" aria-hidden="true" /> : <Wrench className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <p className="text-lg font-semibold text-ink">{group}</p>
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <li
                        key={brand}
                        className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-medium text-brand-strong transition hover:bg-brand hover:text-white"
                      >
                        {brand}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Service areas */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
                    <MapPin className="h-4 w-4" aria-hidden="true" /> Service areas
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Check if we cover your pincode</h2>
                  <p className="mt-4 max-w-xl leading-relaxed text-white/75">
                    Home service is offered in selected cities. Check your pincode before you book, so you know we can reach you.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <ButtonLink href="/service-areas" className="w-full sm:w-auto lg:w-full">
                    View service areas <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                  <Link
                    href="/book"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto lg:w-full"
                  >
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Book Home Service
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Final call to action */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-brand-soft px-6 py-14 text-center sm:px-16">
              <h2 className="relative text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Need Help With Your Appliance?</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
                Book a home service or contact our support team.
              </p>
              <div className="relative mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="/book" className="transition duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Book Home Service
                </ButtonLink>
                <ButtonLink href="/support" variant="secondary" className="transition duration-300 hover:-translate-y-0.5 active:translate-y-0">
                  <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Customer Support
                </ButtonLink>
                {waLink ? (
                  <ButtonLink href={waLink} variant="secondary" external>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp Us
                  </ButtonLink>
                ) : null}
              </div>
              <p className="relative mt-6 text-sm text-ink-muted">
                Already have a request?{" "}
                <Link href="/book/check-booking" className="font-semibold text-brand underline-offset-4 hover:underline">
                  Check your booking status
                </Link>
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
