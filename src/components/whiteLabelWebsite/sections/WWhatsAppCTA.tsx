import type { ShopData } from "../types";
import { MessageCircle } from "lucide-react";

export function WWhatsAppCTA({ shop }: { shop: ShopData }) {
  const number = shop.whatsapp.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(`Hi! I'd like to book at ${shop.name}.`)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-2xl transition-transform hover:scale-110 md:bottom-8"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
