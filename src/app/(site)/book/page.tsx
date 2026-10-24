import { BookingForm } from "@/components/booking/booking-form";
import { Card, Container, PageHero } from "@/components/ui/layout";

export const metadata = {
  title: "Book Home Service",
  description: "Request a robot vacuum or dishwasher home service visit. Upload photos and choose a preferred time slot.",
};

export default function BookPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/book-hero-bg.webp"
        backgroundClassName="object-[80%_center]"
        eyebrow="Home service"
        title="Book a home service request"
        intro="Tell us about your appliance and the problem. We save the request, give you a reference, and our team contacts you to confirm the visit."
      />
      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <Card className="p-6 sm:p-10">
            <BookingForm />
          </Card>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card interactive>
              <p className="font-semibold text-ink">Before you submit</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                <li>Have the model number and purchase year ready if you can.</li>
                <li>Photos help: the appliance, the model label and any error code.</li>
                <li>Don&apos;t open the appliance. Unplug it and wait for the technician.</li>
              </ul>
            </Card>
            <Card interactive>
              <p className="font-semibold text-ink">Prefer to message us?</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Send your name, mobile number, pincode, appliance, the problem and a preferred date on WhatsApp or email. Our
                team replies to confirm the visit. A message is a request, not a confirmed appointment.
              </p>
            </Card>
            <Card interactive>
              <p className="font-semibold text-ink">Already booked?</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Report a problem with an existing visit to our support team.
              </p>
              <a href="/support" className="mt-3 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline">
                Go to customer support
              </a>
            </Card>
          </aside>
        </Container>
      </section>
    </>
  );
}
