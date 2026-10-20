// Public business details come from NEXT_PUBLIC_* variables. Nothing here is invented:
// unset values make the UI show a "not configured" state instead of a fake number or email.

const digitsOnly = (value: string | undefined) => (value ?? "").replace(/\D/g, "");

export const SITE = {
  name: "RoboCare",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  tagline: "Smart Appliance Care at Your Doorstep",
  // Digits with country code, e.g. 919XXXXXXXXX. Empty when not configured.
  whatsappNumber: digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "",
};

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/support/raise-ticket", label: "Raise Ticket" },
] as const;

export function whatsappLink(message?: string): string | null {
  if (!SITE.whatsappNumber) return null;
  const text = message ?? "Hi RoboCare, I need service for my appliance.";
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_PREFILL =
  "Hi RoboCare, I need service for my [Robot Vacuum/Dishwasher].\nBrand:\nModel:\nProblem:\nLocation:";
