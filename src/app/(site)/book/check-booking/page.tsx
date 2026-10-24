import { CheckBookingForm } from "@/components/booking/check-booking-form";
import { PageHero, Section } from "@/components/ui/layout";

export const metadata = {
  title: "Check Your Booking",
  description: "Enter your RoboCare booking reference and mobile number to see the status of your home service visit.",
};

export default function CheckBookingPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/check-booking-bg.webp"
        eyebrow="Booking"
        title="Check your booking"
        intro="Enter the booking reference and the mobile number you gave us, for example RC-2026-0001. You will see whether your visit is confirmed."
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <CheckBookingForm />
          <p className="mt-6 text-sm text-ink-muted">
            For security, this page shows only the booking status and visit date. Keep your reference private.
          </p>
        </div>
      </Section>
    </>
  );
}
