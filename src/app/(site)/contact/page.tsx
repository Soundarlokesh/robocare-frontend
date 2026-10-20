import { ContactForm } from "@/components/contact/contact-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, Container, PageHero } from "@/components/ui/layout";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: "Contact RoboCare about robot vacuum or dishwasher service, accessories or AMC.",
};

export default function ContactPage() {
  const waLink = whatsappLink();
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to our service team"
        intro="Send an enquiry, or reach us on WhatsApp. For a home visit, use the booking form so we get the details we need."
        actions={<ButtonLink href="/book">Book Home Service</ButtonLink>}
      />
      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <Card>
              <p className="font-semibold text-ink">Contact details</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-ink-muted">Phone</dt>
                  <dd className="font-medium text-ink">{SITE.phone || "Not published yet"}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Email</dt>
                  <dd className="font-medium text-ink">{SITE.email || "Not published yet"}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">WhatsApp</dt>
                  <dd>
                    {waLink ? (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline-offset-4 hover:underline">
                        Chat on WhatsApp
                      </a>
                    ) : (
                      <span className="text-ink">Not published yet</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Service areas</dt>
                  <dd>
                    <a href="/service-areas" className="font-medium text-brand underline-offset-4 hover:underline">
                      Check your pincode
                    </a>
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
          <Card className="p-6 sm:p-8">
            <ContactForm />
          </Card>
        </Container>
      </section>
    </>
  );
}
