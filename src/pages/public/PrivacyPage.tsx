import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
export function PrivacyPage() {
  const updated = "January 2026";
  return (
    <PublicPageHeader />
    <div className="min-h-screen bg-background">
      <section className="border-border border-b bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h1 className="text-heading text-4xl font-black md:text-5xl" style={{ fontFamily: "Inter, sans-serif" }}>Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm">This page is maintained by Nexora to answer common privacy questions about the Nexora platform. Last updated: {updated}.</p>
        </div>
      </section>
      <article className="prose prose-slate mx-auto max-w-3xl px-4 py-12 text-foreground md:px-6">
        {[
          ["Overview", "We collect the minimum data needed to deliver a great booking experience and improve our services. You stay in control of your data at all times."],
          ["What we collect", "Account details (name, phone, email), booking history, location (with your permission), device & browser info, and content you submit such as reviews."],
          ["How we use it", "To deliver bookings, send reminders, prevent fraud, personalise recommendations and improve our services. We do not sell your personal data."],
          ["Sharing", "We share booking details with the partner salon you've booked, and limited data with vetted service providers (payments, SMS, analytics) under contract."],
          ["Cookies & analytics", "We use cookies and similar tech for session management, preferences and basic product analytics. You can disable non-essential cookies anytime."],
          ["Retention", "We retain account data while your account is active, and for a limited period after, to comply with legal obligations."],
          ["Your rights", "Access, correct, export or delete your data anytime from your account settings or by contacting us."],
          ["Contact", "Privacy questions? Email privacy@nexora.in."],
        ].map(([h, b]) => (
          <section key={h} className="mt-8 first:mt-0">
            <h2 className="text-heading text-xl font-bold">{h}</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">{b}</p>
          </section>
        ))}
        <p className="text-muted-foreground mt-10 border-t border-border pt-6 text-xs">
          This page is app-owned editable content, not an independent certification of any specific standard. Where relevant, we will request explicit consent for sensitive data and process it per applicable Indian data-protection law.
        </p>
      </article>
    </div>
  );
}
