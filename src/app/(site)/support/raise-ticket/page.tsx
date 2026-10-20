import { RaiseTicketForm } from "@/components/support/raise-ticket-form";
import { Card, Container, PageHero } from "@/components/ui/layout";

export const metadata = {
  title: "Raise a Support Ticket",
  description: "Report a problem with a RoboCare visit, repair, delay or bill. Your request is saved with a reference.",
};

export default function RaiseTicketPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Raise a support ticket"
        intro="Tell us what went wrong. We save your request, give you a reference number and our support team reviews it."
      />
      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <Card className="p-6 sm:p-10">
            <RaiseTicketForm />
          </Card>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <p className="font-semibold text-ink">Before you submit</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                <li>Add your booking reference if you have one. It helps us find your visit.</li>
                <li>Photos of the appliance or any error code help the team.</li>
                <li>Do not open the appliance. Unplug it and wait for our team.</li>
              </ul>
            </Card>
          </aside>
        </Container>
      </section>
    </>
  );
}
