import { CheckTicketForm } from "@/components/support/check-ticket-form";
import { PageHero, Section } from "@/components/ui/layout";
import { ApplianceVisual } from "@/components/site/illustrations";

export const metadata = {
  title: "Check a Support Ticket",
  description: "Enter your RoboCare support reference to see the latest response from our team.",
};

export default function CheckTicketPage() {
  return (
    <>
      <PageHero
        visual={<ApplianceVisual />}
        eyebrow="Support"
        title="Check your support ticket"
        intro="Enter the reference we sent you, for example SUP-2026-0002. You will see the current status and any response our team has published."
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <CheckTicketForm />
          <p className="mt-6 text-sm text-ink-muted">
            For security, this page shows only the reference details. Please do not share your reference publicly. To add
            information to your request, contact us through the support page.
          </p>
        </div>
      </Section>
    </>
  );
}
