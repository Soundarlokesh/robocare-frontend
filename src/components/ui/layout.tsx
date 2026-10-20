import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Section({
  id,
  title,
  eyebrow,
  intro,
  children,
  tone = "default",
}: {
  id?: string;
  title?: string;
  eyebrow?: string;
  intro?: string;
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  const background = tone === "muted" ? "bg-surface-muted/60" : "";
  return (
    <section id={id} className={`py-16 sm:py-20 ${background}`}>
      <Container>
        {title ? (
          <div className="mb-10 max-w-2xl">
            {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p> : null}
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
            {intro ? <p className="mt-3 text-base leading-relaxed text-ink-muted">{intro}</p> : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  actions?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <Container className="py-14 sm:py-16">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{intro}</p>
        {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
      </Container>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-6 shadow-card ${className}`}>{children}</div>
  );
}
