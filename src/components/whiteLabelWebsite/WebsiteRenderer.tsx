import type { ReactNode } from "react";
import type { ShopData, WebsiteConfig, SectionId } from "./types";
import { getTemplate } from "./templates";
import { WHero } from "./sections/WHero";
import { WAbout } from "./sections/WAbout";
import { WServices } from "./sections/WServices";
import { WRateCard } from "./sections/WRateCard";
import { WPackages } from "./sections/WPackages";
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
import { WLoyalty } from "./sections/WLoyalty";
import { WReferral } from "./sections/WReferral";
import { WBlog } from "./sections/WBlog";
import { WCoupons } from "./sections/WCoupons";
import { WSocialMedia } from "./sections/WSocialMedia";
import { WInstagramFeed } from "./sections/WInstagramFeed";
import { WYouTubeFeed } from "./sections/WYouTubeFeed";
import { WWhatsAppCTA } from "./sections/WWhatsAppCTA";
import { WBookingBar } from "./sections/WBookingBar";
import { WBeforeAfter } from "./sections/WBeforeAfter";
import { WAwards } from "./sections/WAwards";
import { WBrands } from "./sections/WBrands";

export function WebsiteRenderer({ shop, config }: { shop: ShopData; config: WebsiteConfig }) {
  const baseTemplate = getTemplate(config.template);
  const template = {
    ...baseTemplate,
    colors: {
      ...baseTemplate.colors,
      primary: config.branding.primaryColor,
      secondary: config.branding.secondaryColor,
    },
  };
  const enabled = new Set(config.sections.filter((s) => s.enabled).map((s) => s.id));
  const ordered = template.sectionOrder
    .filter((id) => enabled.has(id))
    .map((id, index) => ({ id, enabled: true, order: index + 1 }));

  const map: Record<SectionId, ReactNode> = {
    hero: <WHero shop={shop} template={template} />,
    about: <WAbout shop={shop} template={template} />,
    services: (
      <section id="services">
        <WServices shop={shop} template={template} />
      </section>
    ),
    rateCard: <WRateCard shop={shop} template={template} />,
    packages: <WPackages shop={shop} template={template} />,
    gallery: <WGallery shop={shop} template={template} />,
    staff: <WStaff shop={shop} template={template} />,
    reviews: <WReviews shop={shop} template={template} />,
    testimonials: <WTestimonials shop={shop} template={template} />,
    faq: <WFAQ shop={shop} template={template} />,
    offers: <WOffers shop={shop} template={template} />,
    contact: <WContact shop={shop} template={template} />,
    map: <WMap shop={shop} template={template} />,
    appointment: (
      <section id="appointment">
        <WAppointmentForm shop={shop} template={template} />
      </section>
    ),
    membership: <WMembership shop={shop} template={template} />,
    loyalty: <WLoyalty shop={shop} template={template} />,
    referral: <WReferral shop={shop} template={template} />,
    blog: <WBlog shop={shop} template={template} />,
    coupons: <WCoupons shop={shop} template={template} />,
    socialMedia: <WSocialMedia shop={shop} template={template} />,
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
      {ordered.map((s) => (
        <div key={s.id} data-section={s.id}>
          {map[s.id]}
        </div>
      ))}
    </>
  );
}
