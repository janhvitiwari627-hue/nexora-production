import { useState } from "react";
import {
  Menu,
  X,
  Search,
  Bell,
  Sparkles,
} from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Explore", href: "#explore" },
    { label: "Membership", href: "#membership" },
    { label: "For Shop Owners", href: "#dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nexora
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-700">
            <Search className="h-5 w-5" />
          </button>
          <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-700">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <a
            href="#"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
          >
            Login
          </a>
          <a
            href="#"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
          >
            Register
          </a>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 ring-2 ring-white shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
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
        <div className="border-t border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3">
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
            <hr className="my-2 border-slate-200" />
            <a
              href="#"
              className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Search
            </a>
            <a
              href="#"
              className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Notifications
            </a>
            <a
              href="#"
              className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </a>
            <a
              href="#"
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-base font-medium text-white"
            >
              Register
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
