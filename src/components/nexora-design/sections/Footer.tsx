import { Sparkles, Globe, AtSign, MessageCircle, Video } from "lucide-react";

const footerLinks = {
  Product: ["Explore", "Membership", "For Shop Owners", "Pricing", "App Download"],
  Company: ["About Us", "Careers", "Press", "Blog", "Contact"],
  Resources: ["Help Center", "Partner Portal", "Developers", "Status", "Security"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="max-w-md">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Nexora</span>
            </a>
            <p className="mt-4 text-2xl font-semibold leading-snug text-white/90 sm:text-3xl">
              Salon Ja Rahe Ho?{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Nexora Kiya Kya?
              </span>
            </p>
            <p className="mt-4 text-sm text-slate-400">
              India's Beauty Industry Operating System. Trusted by customers, shop
              owners, brands, distributors and investors.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {[Globe, AtSign, MessageCircle, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Nexora SalonOS. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
