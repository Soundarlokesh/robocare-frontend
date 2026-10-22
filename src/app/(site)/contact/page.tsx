import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: "Contact RoboCare about robot vacuum or dishwasher service, accessories or AMC.",
};

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{label}</p>
        <div className="mt-1 text-base font-medium text-white">{children}</div>
      </div>
    </div>
  );
}

const LINK = "inline-flex items-center gap-1.5 break-all underline-offset-4 transition hover:text-accent hover:underline";

export default function ContactPage() {
  const waLink = whatsappLink();
  return (
    <>
      <PageHero
        backgroundImage="/images/contact-hero-bg.webp"
        backgroundClassName="object-[80%_center] brightness-110 saturate-105"
        eyebrow="Contact"
        title="Talk to our service team"
        intro="Send an enquiry, or reach us on WhatsApp. For a home visit, use the booking form so we get the details we need."
        actions={<ButtonLink href="/book">Book Home Service</ButtonLink>}
      />

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <aside className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white shadow-card sm:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/40 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">Contact details</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">We are here to help</h2>
                <div className="mt-8 divide-y divide-white/10">
                  <ContactRow icon={Phone} label="Phone">
                    {SITE.phone ? (
                      <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className={LINK}>
                        {SITE.phone}
                      </a>
                    ) : (
                      <span className="text-white/70">Not published yet</span>
                    )}
                  </ContactRow>
                  <ContactRow icon={Mail} label="Email">
                    {SITE.email ? (
                      <a href={`mailto:${SITE.email}`} className={LINK}>
                        {SITE.email}
                      </a>
                    ) : (
                      <span className="text-white/70">Not published yet</span>
                    )}
                  </ContactRow>
                  <ContactRow icon={MessageCircle} label="WhatsApp">
                    {waLink ? (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className={LINK}>
                        Chat on WhatsApp <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-white/70">Not published yet</span>
                    )}
                  </ContactRow>
                  <ContactRow icon={MapPin} label="Service areas">
                    <a href="/service-areas" className={LINK}>
                      Check your pincode <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </ContactRow>
                </div>
              </div>
            </aside>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Send an enquiry</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Tell us what you need</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Fields marked with * are required. For a home visit, the booking form is the quickest route.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
