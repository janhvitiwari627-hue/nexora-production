import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Globe, Lock, MapPin, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/customer/settings")({
  head: () => ({ meta: [{ title: "Settings — Nexora" }] }),
  component: SettingsPage,
});

const ITEMS = [
  { icon: Bell, label: "Notifications", hint: "Booking updates, offers" },
  { icon: MapPin, label: "Location", hint: "Precise or approximate" },
  { icon: Globe, label: "Language", hint: "English" },
  { icon: Lock, label: "Privacy & data", hint: "Export or delete account" },
] as const;

function SettingsPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <ul className="divide-y divide-border rounded-xl border bg-card">
        {ITEMS.map(({ icon: Icon, label, hint }) => (
          <li key={label}>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{hint}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Need help? <Link to="/customer/support" className="underline">Contact support</Link>
      </div>
    </main>
  );
}
