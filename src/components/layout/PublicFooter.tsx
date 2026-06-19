import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-border bg-card mt-24 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-lg font-extrabold">Nexora</span>
          </div>
          <p className="text-muted-foreground mt-4 max-w-xs text-sm">
            The operating system for modern salons, spas & barbershops. Discover, book,
            and grow — all in one place.
          </p>
        </div>
        <FooterCol
          title="Discover"
          links={[
            { label: "Search salons", to: "/search" },
            { label: "Membership", to: "/" },
            { label: "Referrals", to: "/" },
            { label: "Offers", to: "/" },
          ]}
        />
        <FooterCol
          title="Business"
          links={[
            { label: "For owners", to: "/" },
            { label: "Become a partner", to: "/" },
            { label: "Job portal", to: "/" },
            { label: "Academy", to: "/" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "About", to: "/" },
            { label: "Contact", to: "/" },
            { label: "Privacy", to: "/" },
            { label: "Terms", to: "/" },
          ]}
        />
      </div>
      <div className="border-border text-muted-foreground border-t py-5 text-center text-xs">
        © {new Date().getFullYear()} Nexora SalonOS. Crafted in India.
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="text-heading text-sm font-bold">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-muted-foreground hover:text-primary transition">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
