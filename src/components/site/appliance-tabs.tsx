"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";

export type ApplianceTab = {
  key: string;
  label: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  services: string[];
};

// Accessible tab switcher: arrow keys move between tabs, and each panel is labelled by its tab.
export function ApplianceTabs({ tabs }: { tabs: ApplianceTab[] }) {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setActive(next);
    document.getElementById(`appliance-tab-${tabs[next].key}`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Appliances we service" className="mx-auto flex w-full max-w-md gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-black/5">
        {tabs.map((tab, index) => {
          const selected = index === active;
          return (
            <button
              key={tab.key}
              id={`appliance-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`appliance-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`min-h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                selected ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:bg-brand-soft hover:text-brand-strong"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        key={current.key}
        id={`appliance-panel-${current.key}`}
        role="tabpanel"
        aria-labelledby={`appliance-tab-${current.key}`}
        className="animate-fade-up mt-10 grid items-center gap-10 rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-10 lg:grid-cols-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-brand-soft">
          <Image src={current.image} alt={current.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{current.title}</h3>
          <p className="mt-3 leading-relaxed text-ink-muted">{current.text}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {current.services.map((service) => (
              <li key={service} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                {service}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ButtonLink href="/services">Explore Services</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
