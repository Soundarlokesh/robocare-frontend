import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-xl text-ink-muted">The link may be out of date. You can book a service or go back to the home page.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Go to home</ButtonLink>
        <ButtonLink href="/book" variant="secondary">
          Book Home Service
        </ButtonLink>
      </div>
    </Container>
  );
}
