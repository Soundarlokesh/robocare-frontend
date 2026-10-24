import { ArrowRight, Calendar, CalendarCheck, Headphones, Lock, MessageCircle, ShieldCheck, Sparkles, Wrench, FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `${SITE.name} provides home service for robot vacuum cleaners and dishwashers.`,
};

const SERVICES = [
  {
    icon: Wrench,
    title: "Robot vacuums",
    text: "Service, deep cleaning, repair, installation and accessories.",
  },
  {
    icon: Sparkles,
    title: "Dishwashers",
    text: "Service, cleaning, repair, installation and accessories.",
  },
  {
    icon: CalendarCheck,
    title: "Annual maintenance",
    text: "Preventive services and discounts through our AMC plans.",
  },
];

const PRINCIPLES = [
  {
    icon: FileText,
    title: "Requests are requests",
    text: "A booking is recorded with a reference. Our team then confirms the appointment with you.",
  },
  {
    icon: ShieldCheck,
    title: "Inspection before promises",
    text: "We don't guarantee a repair or a cost until the technician has inspected the appliance.",
  },
  {
    icon: Lock,
    title: "Safe guidance",
    text: "We never ask customers to open high-voltage parts. Anything inside the appliance is for a qualified technician.",
  },
  {
    icon: Headphones,
    title: "A person is always available",
    text: "Call, WhatsApp or email us at any time. A team member replies to your question, and you can always ask for a call back.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/about-hero-bg.webp"
        backgroundClassName="object-[78%_center]"
        eyebrow="About"
        title={`About ${SITE.name}`}
        intro="We look after robot vacuum cleaners and dishwashers in your home. We focus on a clear booking process and an honest diagnosis."
        actions={<ButtonLink href="/book">Book Home Service</ButtonLink>}
      />

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">What we do</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Care for the appliances you rely on</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SERVICES.map((service, index) => (
              <Reveal key={service.title} delay={index * 100}>
                <article className="group flex h-full flex-col rounded-3xl bg-white p-8 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-sm transition group-hover:scale-105">
                    <service.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold text-ink">{service.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-ink-muted">{service.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-muted px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">How we work</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Four principles behind every visit</h2>
            </div>
          </Reveal>
          <ol className="mt-12 grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 100}>
                <li className="group flex h-full gap-5 rounded-3xl bg-white p-7 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                      <principle.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs font-semibold text-brand">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{principle.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-muted">{principle.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to book a visit?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">
              Send a booking request, or contact our team with any question first.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/book">
                <Calendar className="h-4 w-4" aria-hidden="true" /> Book Home Service <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Contact us
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
