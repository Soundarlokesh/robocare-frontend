import { ButtonLink } from "@/components/ui/button";
import { Card, PageHero, Section } from "@/components/ui/layout";

export const metadata = {
  title: "Robot Vacuum Repair",
  description:
    "Robot vacuum repair and home service for not charging, navigation, brush, mopping, battery and error-code problems.",
};

const PROBLEMS = [
  "Not switching on",
  "Not charging",
  "Not cleaning",
  "Brush problem",
  "Water or mopping problem",
  "Navigation problem",
  "Battery issue",
  "Error code",
  "Noise",
];

const BRANDS = ["Xiaomi", "Dreame", "Roborock", "Ecovacs", "iRobot"];

export default function RobotVacuumRepairPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/service-hero-bg.webp"
        eyebrow="Robot vacuum repair"
        title="Robot vacuum repair at your doorstep"
        intro="Book a home visit for your robot vacuum. A technician inspects the robot and tells you what they find before any work starts."
        actions={<ButtonLink href="/book">Book Home Service</ButtonLink>}
      />
      <Section title="Problems we handle" intro="Choose the closest match when you book. You can describe anything else in the form.">
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
            <p className="mt-2 text-sm text-ink-muted">Choose your brand and problem, and add the model number and a photo if you have them.</p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">2. We confirm the visit</p>
            <p className="mt-2 text-sm text-ink-muted">Our service team contacts you to confirm the date and time slot.</p>
          </Card>
          <Card>
            <p className="font-semibold text-ink">3. Inspection</p>
            <p className="mt-2 text-sm text-ink-muted">The technician inspects the robot. A repair is never promised before inspection.</p>
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
        <p className="mt-6 text-sm text-ink-muted">
          Brand not listed? Choose Other on the booking form and tell us the model.
        </p>
      </Section>
      <Section tone="muted" title="Safety first">
        <Card>
          <p className="text-ink-muted">
            Don&apos;t open the robot&apos;s casing or touch the battery and charging electronics yourself. Switch the charger off at the
            socket and call a qualified technician for anything inside the appliance.
          </p>
        </Card>
      </Section>
    </>
  );
}
