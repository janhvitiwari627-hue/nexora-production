import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
export function TermsPage() {
  return (
  <div className="min-h-screen bg-background">
    <PublicPageHeader />
      <section className="border-border border-b bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h1 className="text-heading text-4xl font-black md:text-5xl" style={{ fontFamily: "Inter, sans-serif" }}>Terms of Service</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: January 2026</p>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {[
          ["Acceptance", "By accessing or using Nexora you agree to these terms. If you don't agree, please don't use the platform."],
          ["Eligibility", "You must be 18+ to create an account. Bookings made on behalf of minors require an adult guardian."],
          ["Bookings & payments", "Bookings are confirmed once advance payment is captured. Free cancellation up to 4 hours before your slot; within 4 hours the 25% advance is non-refundable."],
          ["User conduct", "Don't post unlawful, abusive or misleading content. We may remove content and suspend accounts that violate these terms."],
          ["Partner responsibilities", "Partners are responsible for the services they deliver, their staff, hygiene, and compliance with local laws."],
          ["Intellectual property", "All Nexora branding, software and content is owned by Nexora or licensed to us. You may not copy or redistribute it."],
          ["Limitation of liability", "Nexora acts as a marketplace connecting customers and partners. We're not liable for services delivered by partners."],
          ["Changes", "We may update these terms from time to time. Material changes will be notified via email or in-app banner."],
          ["Contact", "Questions? Email legal@nexora.in."],
        ].map(([h, b]) => (
          <section key={h} className="mt-8 first:mt-0">
            <h2 className="text-heading text-xl font-bold">{h}</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">{b}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
