import { ButtonLink } from "@/components/ui/button";
import { Card, PageHero, Section } from "@/components/ui/layout";

export const metadata = {
  title: "Dishwasher Repair",
  description:
    "Dishwasher repair and home service for drainage, water inlet, leakage, door, heating, noise and error-code problems.",
};

const PROBLEMS = [
  "Water not draining",
  "Water not entering",
  "Not cleaning",
  "Not heating",
  "Leakage",
  "Door problem",
  "Noise",
  "Error code",
];

const BRANDS = ["Bosch", "IFB", "LG", "Samsung", "Siemens", "Whirlpool"];

export default function DishwasherRepairPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/service-hero-bg.webp"
        eyebrow="Dishwasher repair"
        title="Dishwasher repair at your doorstep"
        intro="Book a home visit for your dishwasher. A technician inspects the appliance and explains what they find before any work starts."
        actions={<ButtonLink href="/book">Book Home Service</ButtonLink>}
      />
      <Section title="Problems we handle" intro="Pick the closest match when you book. If the dishwasher shows an error code, add it in the form.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <Card key={problem} className="p-5">
              <p className="font-medium text-ink">{problem}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section tone="muted" eyebrow="How it works" title="From request to visit">
        <ol className="grid gap-5 md:grid-cols-3">
          <Card>
            <p className="font-semibold text-ink">1. Describe the problem</p>
            <p className="mt-2 text-sm text-ink-muted">Choose your brand, the issue, and add a photo of the model label if you can.</p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">2. We confirm the visit</p>
            <p className="mt-2 text-sm text-ink-muted">Our service team contacts you to confirm the date and time slot.</p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">3. Inspection</p>
            <p className="mt-2 text-sm text-ink-muted">The technician inspects the dishwasher. A repair is never promised before inspection.</p>
          </Card>
        </ol>
      </Section>
      <Section title="Brands we work with">
        <ul className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <li key={brand} className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink">
              {brand}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-muted">Brand not listed? Choose Other on the booking form and tell us the model.</p>
      </Section>
      <Section tone="muted" title="Safety first">
        <Card>
          <p className="text-ink-muted">
            Turn off the dishwasher and its power at the wall before you check anything. Don&apos;t open panels or touch electrical
            components. For leakage or water near the electrics, call a qualified technician.
          </p>
        </Card>
      </Section>
    </>
  );
}
