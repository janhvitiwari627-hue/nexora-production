import { Link } from "@tanstack/react-router";
import { Building2, Check, Mail, Megaphone, Phone, Star, Target } from "lucide-react";
import { PortalLayout, PortalHeading, EmptyHint } from "./PortalLayout";
import { NEXORA_CALL_DISPLAY, NEXORA_CALL_URL } from "@/config/contact";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SponsoredListingsPage() {
  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Sponsored Listings"
        title="Boost discovery across Nexora"
        description="Sponsored placements get prime visibility in directories, category pages, search results and salon feeds."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Directory Spotlight",
            body: "Top placement in Brand & Distributor directories.",
          },
          { title: "Search Boost", body: "Appear above organic results for relevant queries." },
          { title: "Salon Feed Cards", body: "Native sponsored cards shown to salon owners." },
        ].map((x) => (
          <div
            key={x.title}
            className="rounded-[var(--radius-card)] border border-border/60 bg-card p-5"
          >
            <Star className="mb-2 h-6 w-6 text-primary" />
            <h3 className="font-bold text-heading">{x.title}</h3>
            <p className="mt-1 text-sm text-body">{x.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Button asChild className="bg-gradient-cta text-primary-foreground">
          <Link to="/portal/contact">Talk to sales</Link>
        </Button>
      </div>
    </PortalLayout>
  );
}

export function BusinessPagesPage() {
  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Business Pages"
        title="Your branded microsite on Nexora"
        description="A full business page for your brand or distributor company — story, products, gallery, team, contact, and lead capture."
      />
      <Card className="p-8">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <ul className="space-y-2 text-sm text-body">
            {[
              "Custom cover and logo",
              "Rich about / story section",
              "Product catalog grid",
              "Team & contact",
              "Direct lead capture",
              "Verified badge on profile",
            ].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" /> {x}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <Button asChild className="bg-gradient-cta text-primary-foreground">
              <Link to="/portal/brands/register">Create Brand Page</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portal/distributors/register">Create Distributor Page</Link>
            </Button>
          </div>
        </div>
      </Card>
    </PortalLayout>
  );
}

export function PromotionCenterPage() {
  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Promotion Center"
        title="Campaigns, launches and offers"
        description="Run product launches, seasonal campaigns and offers visible across the platform."
      />
      <EmptyHint
        icon={Megaphone}
        title="Campaigns coming soon"
        body="Register your brand or distributor to get notified when campaigns open up."
        action={
          <Button asChild>
            <Link to="/portal/brands/register">Register Brand</Link>
          </Button>
        }
      />
    </PortalLayout>
  );
}

export function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      features: [
        "Public brand or distributor profile",
        "Up to 5 products",
        "Receive inquiries",
        "Basic visibility",
      ],
      cta: "Get started",
    },
    {
      name: "Growth",
      price: "₹2,499/mo",
      features: [
        "Everything in Starter",
        "Up to 50 products",
        "Featured in directory",
        "Priority lead routing",
        "Analytics dashboard",
      ],
      cta: "Talk to sales",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited products",
        "Sponsored placements",
        "Promotion campaigns",
        "Dedicated account manager",
        "Custom integrations",
      ],
      cta: "Contact us",
    },
  ];
  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Pricing"
        title="Choose your growth plan"
        description="Simple plans built for brands and distributors at any stage."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-[var(--radius-card-lg)] border bg-card p-6 ${t.highlight ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/60"}`}
          >
            <h3 className="text-lg font-bold text-heading">{t.name}</h3>
            <p className="mt-1 text-3xl font-black text-primary">{t.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-body">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={`mt-6 w-full ${t.highlight ? "bg-gradient-cta text-primary-foreground" : ""}`}
              variant={t.highlight ? "default" : "outline"}
            >
              <Link to="/portal/contact">{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}

export function PortalContactPage() {
  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Contact"
        title="Get in touch with the portal team"
        description="Tell us about your brand or distribution business. We typically reply within one business day."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold text-heading">Reach us</h3>
          <ul className="mt-3 space-y-2 text-sm text-body">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> partners@nexora.app
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <a href={NEXORA_CALL_URL} className="hover:text-primary hover:underline">
                {NEXORA_CALL_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Nexora HQ, India
            </li>
          </ul>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-heading">Next steps</h3>
          <p className="mt-2 text-sm text-body">
            Create a profile and our team will reach out with onboarding details.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="bg-gradient-cta text-primary-foreground">
              <Link to="/portal/brands/register">Register Brand</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portal/distributors/register">Register Distributor</Link>
            </Button>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}

export function LeadOpportunitiesPage() {
  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Lead Opportunities"
        title="Inquiries from salons and beauty businesses"
        description="When a salon clicks Contact on your profile, the inquiry lands in your portal dashboard."
      />
      <EmptyHint
        icon={Target}
        title="Sign in to view your leads"
        body="Register your brand or distributor profile to start receiving inquiries."
        action={
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link to="/portal/dashboard">Open dashboard</Link>
            </Button>
          </div>
        }
      />
    </PortalLayout>
  );
}
