interface Section { id: string; title: string; body: string }

function LegalLayout({ title, lastUpdated, sections }: { title: string; lastUpdated: string; sections: Section[] }) {
  return (
    <div className="mx-auto max-w-5xl p-6 md:p-12">
      <header className="mb-8">
        <h1 className="text-heading text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
      </header>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav className="sticky top-4 self-start text-sm md:max-h-[80vh] md:overflow-auto">
          <div className="text-muted-foreground mb-2 text-xs uppercase tracking-wider">On this page</div>
          <ul className="space-y-1.5">
            {sections.map(s => <li key={s.id}><a href={`#${s.id}`} className="text-primary hover:underline">{s.title}</a></li>)}
          </ul>
        </nav>
        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed">
          {sections.map(s => (
            <section key={s.id} id={s.id}>
              <h2 className="text-foreground text-xl font-bold">{s.title}</h2>
              <p className="text-muted-foreground mt-2 whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

const PRIVACY: Section[] = [
  { id: "intro", title: "1. Introduction", body: "Nexora SalonOS (\"we\", \"our\", \"us\") respects your privacy. This Policy explains how we collect, use, and protect your information." },
  { id: "data", title: "2. Data We Collect", body: "We collect account details, booking history, device information, and approximate location for service delivery." },
  { id: "use", title: "3. How We Use It", body: "To operate the platform, enable bookings, send notifications, prevent fraud, and improve our services." },
  { id: "sharing", title: "4. Sharing", body: "We share data with salons you book, payment processors, and trusted vendors under strict confidentiality." },
  { id: "rights", title: "5. Your Rights", body: "Access, correct, export, or delete your data anytime from Settings. Contact privacy@nexora.app for assistance." },
  { id: "security", title: "6. Security", body: "We use industry-standard encryption and access controls. No system is 100% secure; please use strong passwords." },
  { id: "cookies", title: "7. Cookies", body: "We use cookies for session management and analytics. Disable in your browser if you prefer." },
  { id: "changes", title: "8. Changes", body: "We may update this Policy. We'll notify you of material changes via email or in-app." },
];

export function PrivacyPolicyPage() {
  return <LegalLayout title="Privacy Policy" lastUpdated="June 1, 2026" sections={PRIVACY} />;
}

const TERMS: Section[] = [
  { id: "acceptance", title: "1. Acceptance", body: "By using Nexora, you agree to these Terms. If not, please don't use the service." },
  { id: "accounts", title: "2. Accounts", body: "You must be 18+ to create an account. Keep your credentials secure; you're responsible for activity on your account." },
  { id: "bookings", title: "3. Bookings & Cancellations", body: "Confirmed bookings are contracts with the salon. Cancellation policies vary by business and are shown at checkout." },
  { id: "payments", title: "4. Payments", body: "Payments are processed by third-party providers. A platform fee may apply per transaction." },
  { id: "content", title: "5. User Content", body: "You retain rights to content you post. By posting, you grant us a license to display it on the platform." },
  { id: "conduct", title: "6. Acceptable Use", body: "No fraud, harassment, or unlawful activity. Violations may result in suspension." },
  { id: "liability", title: "7. Liability", body: "Nexora is not liable for service quality at third-party salons. We facilitate but don't perform services." },
  { id: "governing", title: "8. Governing Law", body: "These Terms are governed by Indian law. Disputes resolved in Bangalore courts." },
];

export function TermsPage() {
  return <LegalLayout title="Terms of Service" lastUpdated="June 1, 2026" sections={TERMS} />;
}
