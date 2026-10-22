import { CalendarCheck, MapPin, Search } from "lucide-react";
import { ServiceAreaChecker, ServiceAreaList } from "@/components/areas/service-area-checker";
import { PageHero } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Service Areas",
  description: "Cities and pincodes where RoboCare offers home service for robot vacuums and dishwashers.",
};

const STEPS = [
  { icon: Search, title: "Enter your pincode", text: "Type the 6-digit pincode of the address where the appliance is." },
  { icon: MapPin, title: "We check our service areas", text: "The check uses the areas we currently cover." },
  { icon: CalendarCheck, title: "Book or contact us", text: "Book a home service if we cover your pincode. If not, contact us to ask." },
];

export default function ServiceAreasPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/service-areas-bg.webp"
        eyebrow="Service areas"
        title="Where we provide home service"
        intro="Home service is offered in selected cities. Check your pincode to see if we can reach you."
      />

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Check your pincode</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">See if we can reach you</h2>
              <ol className="mt-10 space-y-6">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand">Step {index + 1}</p>
                      <p className="mt-1 font-semibold text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ServiceAreaChecker />
          </Reveal>
        </div>
      </section>

      <section className="bg-surface-muted px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Coverage</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Areas we currently cover</h2>
            </div>
          </Reveal>
          <div className="mt-12">
            <ServiceAreaList />
          </div>
        </div>
      </section>
    </>
  );
}
