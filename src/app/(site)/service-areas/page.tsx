import { ServiceAreaChecker, ServiceAreaList } from "@/components/areas/service-area-checker";
import { PageHero, Section } from "@/components/ui/layout";

export const metadata = {
  title: "Service Areas",
  description: "Cities and pincodes where RoboCare offers home service for robot vacuums and dishwashers.",
};

export default function ServiceAreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Service areas"
        title="Where we provide home service"
        intro="Home service is offered in selected cities. Check your pincode to see if we can reach you."
      />
      <Section title="Check your pincode">
        <ServiceAreaChecker />
      </Section>
      <Section tone="muted" title="Areas we currently cover">
        <ServiceAreaList />
      </Section>
    </>
  );
}
