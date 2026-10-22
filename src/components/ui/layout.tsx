import Image from "next/image";
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
  visual,
  backgroundImage,
  backgroundClassName,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  actions?: ReactNode;
  visual?: ReactNode;
  backgroundImage?: string;
  backgroundClassName?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden border-b border-border ${backgroundImage ? "flex min-h-[88svh] flex-col bg-surface md:min-h-[480px]" : "bg-gradient-to-b from-surface to-background"}`}
    >
      {backgroundImage ? (
        <>
          <Image src={backgroundImage} alt="" fill priority sizes="100vw" className={`object-cover ${backgroundClassName ?? "object-[72%_center]"}`} />
          {/* Phones: light veil over the top where the text sits, clear over the centred appliances.
              Larger screens: veil over the text side only. */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/45 to-transparent md:bg-gradient-to-r md:from-white/85 md:via-white/40 md:to-transparent"
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-soft/70 blur-3xl"
          aria-hidden="true"
        />
      )}
      <Container
        className={`relative py-14 sm:py-16 ${backgroundImage ? "flex flex-1 flex-col justify-start pt-16 md:justify-center" : ""} ${visual ? "grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]" : ""}`}
      >
        <div className="animate-fade-up">
          {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p> : null}
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{intro}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {visual ? <div className="animate-fade-up hidden md:block">{visual}</div> : null}
      </Container>
    </section>
  );
}

export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const lift = interactive
    ? "transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
    : "";
  return (
    <div className={`rounded-2xl border border-border bg-surface p-6 shadow-card ${lift} ${className}`}>{children}</div>
  );
}
