import { CheckCircle2, Clock, Lock, ShieldCheck } from "lucide-react";
import { RaiseTicketForm } from "@/components/support/raise-ticket-form";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/layout";
import Image from "next/image";

import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Raise a Support Ticket",
  description: "Report a problem with a RoboCare visit, repair, delay or bill. Your request is saved with a reference.",
};

const TIPS = [
  "Add your booking reference if you have one. It helps us find your visit.",
  "Photos of the appliance or any error code help the team prepare.",
  "Do not open the appliance. Unplug it and wait for our team.",
];

export default function RaiseTicketPage() {
  return (
    <>
      <PageHero
        backgroundImage="/images/raise-ticket-bg.webp"
        backgroundClassName="object-[80%_center]"
        eyebrow="Support"
        title="Raise a support ticket"
        intro="Tell us what went wrong. We save your request, give you a reference number and our support team reviews it."
      />

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <Reveal>
            <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-10">
              <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">New support ticket</p>
                  <p className="text-xs text-ink-muted">Fields marked with * are required</p>
                </div>
              </div>
              <RaiseTicketForm />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <aside className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-3xl bg-ink p-7 text-white shadow-card">
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">Before you submit</p>
                <ul className="mt-5 space-y-4">
                  {TIPS.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm leading-relaxed text-white/85">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-black/5">
                <p className="font-semibold text-ink">Supported appliances</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-brand-soft p-3">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl"><Image src="/images/support-robot-vacuum.jpg" alt="White robot vacuum cleaner on its docking station" fill sizes="160px" className="object-contain" /></div>
                    <p className="mt-2 text-center text-xs font-medium text-ink">Robot vacuum cleaners</p>
                  </div>
                  <div className="rounded-2xl bg-brand-soft p-3">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl"><Image src="/images/support-dishwasher.webp" alt="Stainless steel dishwasher with its racks open" fill sizes="160px" className="object-contain" /></div>
                    <p className="mt-2 text-center text-xs font-medium text-ink">Dishwashers</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-black/5">
                <p className="font-semibold text-ink">Need help?</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  You can also check your booking status or an existing ticket.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <ButtonLink href="/book/check-booking">Check Booking Status</ButtonLink>
                  <ButtonLink href="/support/check-ticket" variant="secondary">
                    Check a Ticket
                  </ButtonLink>
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Your details are used only for this request.
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Our team reviews each request.
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
