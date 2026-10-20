import { MessageCircle } from "lucide-react";
import { whatsappLink, WHATSAPP_PREFILL } from "@/lib/site";

/** Floating click-to-chat button. Opens WhatsApp with a pre-filled message; nothing is sent automatically. */
export function WhatsAppFloat() {
  const href = whatsappLink(WHATSAPP_PREFILL);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1d7a4a] px-4 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-offset-2"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp Us</span>
      <span className="sr-only sm:hidden">WhatsApp Us</span>
    </a>
  );
}
