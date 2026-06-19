import type { ReactNode } from "react";
import type { ShopData, WebsiteConfig, SectionId } from "./types";
import { getTemplate } from "./templates";
import { WHero } from "./sections/WHero";
import { WServices } from "./sections/WServices";
import { WGallery } from "./sections/WGallery";
import { WStaff } from "./sections/WStaff";
import { WReviews } from "./sections/WReviews";
import { WTestimonials } from "./sections/WTestimonials";
import { WFAQ } from "./sections/WFAQ";
import { WOffers } from "./sections/WOffers";
import { WContact } from "./sections/WContact";
import { WMap } from "./sections/WMap";
import { WAppointmentForm } from "./sections/WAppointmentForm";
import { WMembership } from "./sections/WMembership";
import { WCoupons } from "./sections/WCoupons";
import { WInstagramFeed } from "./sections/WInstagramFeed";
import { WYouTubeFeed } from "./sections/WYouTubeFeed";
import { WWhatsAppCTA } from "./sections/WWhatsAppCTA";
import { WBookingBar } from "./sections/WBookingBar";
import { WBeforeAfter } from "./sections/WBeforeAfter";
import { WAwards } from "./sections/WAwards";
import { WBrands } from "./sections/WBrands";

export function WebsiteRenderer({ shop, config }: { shop: ShopData; config: WebsiteConfig }) {
  const template = getTemplate(config.template);
  const ordered = [...config.sections].filter(s => s.enabled).sort((a, b) => a.order - b.order);

  const map: Record<SectionId, ReactNode> = {
    hero: <WHero shop={shop} template={template} />,
    services: <section id="services"><WServices shop={shop} template={template} /></section>,
    gallery: <WGallery shop={shop} template={template} />,
    staff: <WStaff shop={shop} template={template} />,
    reviews: <WReviews shop={shop} template={template} />,
    testimonials: <WTestimonials shop={shop} template={template} />,
    faq: <WFAQ shop={shop} template={template} />,
    offers: <WOffers shop={shop} template={template} />,
    contact: <WContact shop={shop} template={template} />,
    map: <WMap shop={shop} template={template} />,
    appointment: <section id="appointment"><WAppointmentForm shop={shop} template={template} /></section>,
    membership: <WMembership shop={shop} template={template} />,
    coupons: <WCoupons shop={shop} template={template} />,
    instagram: <WInstagramFeed shop={shop} />,
    youtube: <WYouTubeFeed shop={shop} />,
    whatsapp: <WWhatsAppCTA shop={shop} />,
    bookingBar: <WBookingBar shop={shop} template={template} />,
    beforeAfter: <WBeforeAfter shop={shop} template={template} />,
    awards: <WAwards shop={shop} template={template} />,
    brands: <WBrands shop={shop} template={template} />,
  };

  return (
    <>
      {ordered.map(s => <div key={s.id}>{map[s.id]}</div>)}
    </>
  );
}
