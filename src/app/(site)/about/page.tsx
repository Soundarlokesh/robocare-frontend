import { ButtonLink } from "@/components/ui/button";
import { Card, PageHero, Section } from "@/components/ui/layout";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `${SITE.name} provides home service for robot vacuum cleaners and dishwashers.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={`About ${SITE.name}`}
        intro="We look after robot vacuum cleaners and dishwashers in your home. We focus on a clear booking process and an honest diagnosis."
        actions={<ButtonLink href="/book">Book Home Service</ButtonLink>}
      />
      <Section title="What we do">
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <p className="font-semibold text-ink">Robot vacuums</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">Service, deep cleaning, repair, installation and accessories.</p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">Dishwashers</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">Service, cleaning, repair, installation and accessories.</p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">Annual maintenance</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">Preventive services and discounts through our AMC plans.</p>
          </Card>
        </div>
      </Section>
      <Section tone="muted" title="How we work">
        <ul className="grid gap-5 md:grid-cols-2">
          <Card>
            <p className="font-semibold text-ink">Requests are requests</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              A booking is recorded with a reference. Our team then confirms the appointment with you.
            </p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">Inspection before promises</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              We don&apos;t guarantee a repair or a cost until the technician has inspected the appliance.
            </p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">Safe guidance</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              We never ask customers to open high-voltage parts. Anything inside the appliance is for a qualified technician.
            </p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">A person is always available</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              The assistant can help with simple questions. You can ask for a human through the contact page at any time.
            </p>
          </Card>
        </ul>
      </Section>
    </>
  );
}
