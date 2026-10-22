import { ArrowRight, Check, CalendarCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Services",
  description:
    "Robot vacuum and dishwasher services: maintenance, deep cleaning, repair, installation, accessories and annual maintenance contracts.",
};

const GROUPS = [
  {
    key: "robot",
    eyebrow: "Robot vacuum cleaners",
    title: "Care for your robot vacuum",
    items: [
      { name: "Service & maintenance", text: "Routine checks and cleaning to keep the robot running well." },
      { name: "Deep cleaning", text: "A more thorough cleaning session for a robot vacuum that has built-up dirt." },
      { name: "Repair", text: "Diagnosis and repair for charging, navigation, brush, mopping and error-code problems.", href: "/services/robot-vacuum-repair" },
      { name: "Installation", text: "Set-up and first run for a newly bought robot vacuum." },
    ],
  },
  {
    key: "dishwasher",
    eyebrow: "Dishwashers",
    title: "Keep your dishwasher performing well",
    items: [
      { name: "Service & cleaning", text: "Routine service and cleaning to keep the dishwasher performing well." },
      { name: "Repair", text: "Diagnosis for drainage, water inlet, leakage, door, heating and noise problems.", href: "/services/dishwasher-repair" },
      { name: "Installation", text: "Installation of a new dishwasher at your home." },
      { name: "Accessories", text: "Spare parts and accessories, checked against your brand and model." },
    ],
  },
];

const AMC_PLANS = [
  {
    name: "Basic AMC",
    highlight: false,
    points: ["2 preventive services a year", "Service discount", "Accessory discount"],
  },
  {
    name: "Premium AMC",
    highlight: true,
    points: ["4 preventive services a year", "Priority service", "Labour discount", "Emergency support"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/service-hero-bg.webp"
        eyebrow="Services"
        title="Care for your robot vacuum and dishwasher"
        intro="Choose a service and book a home visit. The team confirms the appointment after your request is received."
        actions={<ButtonLink href="/book">Book Home Service</ButtonLink>}
      />

      {GROUPS.map((group, index) => {
        const imageFirst = index % 2 === 0;
        const media = (
          <div className={`relative order-1 min-h-[280px] overflow-hidden bg-brand-soft lg:min-h-full ${imageFirst ? "lg:order-1" : "lg:order-2"}`}>
            {group.key === "robot" ? (
              <Image
                src="/images/services-robot-vacuum.webp"
                alt="Robot vacuum cleaner on a wooden floor, with its dust-collecting dock in the background"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <Image
                src="/images/services-dishwasher.webp"
                alt="Stainless steel dishwasher with its racks loaded with plates, cutlery and glasses"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
        );
        const list = (
          <div className={`order-2 flex flex-col justify-center p-6 sm:p-10 ${imageFirst ? "lg:order-2" : "lg:order-1"}`}>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">{group.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{group.title}</h2>
            <ol className="mt-8 divide-y divide-border">
              {group.items.map((item, itemIndex) => {
                const content = (
                  <>
                    <span className="w-10 shrink-0 pt-0.5 font-mono text-sm font-semibold text-brand">
                      {String(itemIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{item.name}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{item.text}</span>
                    </span>
                    {"href" in item && item.href ? (
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-brand transition group-hover:translate-x-1" aria-hidden="true" />
                    ) : null}
                  </>
                );
                return (
                  <li key={item.name}>
                    {"href" in item && item.href ? (
                      <Link
                        href={item.href}
                        className="group flex items-start gap-4 py-5 transition hover:bg-brand-soft/40 focus-visible:bg-brand-soft/40 sm:px-4"
                      >
                        <span className="sr-only">Read more about </span>
                        {content}
                      </Link>
                    ) : (
                      <div className="flex items-start gap-4 py-5 sm:px-4">{content}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        );
        return (
          <section key={group.key} className="px-4 py-12 sm:px-6 sm:py-16">
            <Reveal>
              <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-black/5 lg:grid-cols-2">
                {media}
                {list}
              </div>
            </Reveal>
          </section>
        );
      })}

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Annual maintenance</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">AMC plans</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {AMC_PLANS.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 120}>
                <article
                  className={`flex h-full flex-col rounded-3xl bg-white p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10 ${
                    plan.highlight ? "shadow-card ring-2 ring-brand" : "shadow-card ring-1 ring-black/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xl font-semibold text-ink">{plan.name}</p>
                    {plan.highlight ? (
                      <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                        Most complete
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-soft p-8 sm:flex-row sm:items-center sm:p-10">
              <p className="max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                AMC plan purchase is not online yet. Send us an enquiry and we will share the current plan details.
              </p>
              <ButtonLink href="/contact">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Enquire about AMC
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
