import { ButtonLink } from "@/components/ui/button";
import { Card, PageHero, Section } from "@/components/ui/layout";

export const metadata = {
  title: "Services",
  description:
    "Robot vacuum and dishwasher services: maintenance, deep cleaning, repair, installation, accessories and annual maintenance contracts.",
};

const GROUPS = [
  {
    heading: "Robot vacuum cleaners",
    items: [
      { name: "Service & maintenance", text: "Routine checks and cleaning to keep the robot running well." },
      { name: "Deep cleaning", text: "A more thorough cleaning session for a robot vacuum that has built-up dirt." },
      { name: "Repair", text: "Diagnosis and repair for charging, navigation, brush, mopping and error-code problems.", href: "/services/robot-vacuum-repair" },
      { name: "Installation", text: "Set-up and first run for a newly bought robot vacuum." },
    ],
  },
  {
    heading: "Dishwashers",
    items: [
      { name: "Service & cleaning", text: "Routine service and cleaning to keep the dishwasher performing well." },
      { name: "Repair", text: "Diagnosis for drainage, water inlet, leakage, door, heating and noise problems.", href: "/services/dishwasher-repair" },
      { name: "Installation", text: "Installation of a new dishwasher at your home." },
      { name: "Accessories", text: "Spare parts and accessories, checked against your brand and model." },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Care for your robot vacuum and dishwasher"
        intro="Choose a service and book a home visit. The team confirms the appointment after your request is received."
        actions={
          <ButtonLink href="/book">Book Home Service</ButtonLink>
        }
      />
      {GROUPS.map((group) => (
        <Section key={group.heading} title={group.heading} tone={group.heading === "Dishwashers" ? "muted" : "default"}>
          <div className="grid gap-5 md:grid-cols-2">
            {group.items.map((item) => (
              <Card key={item.name}>
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
                {"href" in item && item.href ? (
                  <a href={item.href} className="mt-4 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline">
                    Read more
                  </a>
                ) : null}
              </Card>
            ))}
          </div>
        </Section>
      ))}
      <Section tone="muted" eyebrow="Annual maintenance" title="AMC plans">
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <p className="font-semibold text-ink">Basic AMC</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
              <li>2 preventive services a year</li>
              <li>Service discount</li>
              <li>Accessory discount</li>
            </ul>
          </Card>
          <Card>
            <p className="font-semibold text-ink">Premium AMC</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
              <li>4 preventive services a year</li>
              <li>Priority service</li>
              <li>Labour discount</li>
              <li>Emergency support</li>
            </ul>
          </Card>
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          AMC plan purchase is not online yet. Send us an enquiry and we will share the current plan details.
        </p>
        <div className="mt-4">
          <ButtonLink href="/contact" variant="secondary">
            Enquire about AMC
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
