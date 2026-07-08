import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Globe,
} from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);

  const navLinks = [
    { label: "Explore", href: "#explore" },
    { label: "Membership", href: "#membership" },
  ];

  const ownerLinks = [
    {
      label: "Dashboard / Login",
      href: "/owner",
      description: "Manage your shop",
      icon: LayoutDashboard,
    },
    {
      label: "Create Shop Website",
      href: "/create-shop-website",
      description: "Launch your own site",
      icon: Globe,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nexora
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
            >
              {link.label}
            </a>
          ))}

          {/* Shop Owner Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOwnerOpen(true)}
            onMouseLeave={() => setOwnerOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOwnerOpen((v) => !v)}
              className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
              aria-expanded={ownerOpen}
              aria-haspopup="menu"
            >
              Shop Owner
              <ChevronDown
                className={`h-4 w-4 transition-transform ${ownerOpen ? "rotate-180" : ""}`}
              />
            </button>

            {ownerOpen && (
              <>
                {/* hover bridge */}
                <div className="absolute left-0 right-0 top-full h-2" />
                <div
                  role="menu"
                  className="absolute left-1/2 top-[calc(100%+0.5rem)] w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 ring-1 ring-slate-900/[0.02]"
                >
                  {ownerLinks.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      role="menuitem"
                      onClick={() => setOwnerOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-700">
            <Search className="h-5 w-5" />
          </button>
          <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-700">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <a
            href="#"
            className="ml-1 whitespace-nowrap text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
          >
            Login
          </a>
          <a
            href="#"
            className="whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
          >
            Register
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-200/70 bg-white/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="mt-2 rounded-xl bg-slate-50 p-2">
              <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Shop Owner
              </p>
              {ownerLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4 text-indigo-600" />
                  {item.label}
                </Link>
              ))}
            </div>

            <hr className="my-3 border-slate-200" />
            <a
              href="#"
              className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </a>
            <a
              href="#"
              className="mt-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-base font-medium text-white"
            >
              Register
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
