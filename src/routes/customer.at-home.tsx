import { createFileRoute } from "@tanstack/react-router";
import { Home, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/customer/at-home")({
  head: () => ({
    meta: [
      { title: "At-Home Services — Coming Soon" },
      { name: "description", content: "Book verified stylists at home. Coming soon on Nexora." },
    ],
  }),
  component: AtHomePage,
});

function AtHomePage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Home className="h-8 w-8" />
      </div>
      <div>
        <Badge variant="secondary" className="mb-3 gap-1">
          <Sparkles className="h-3 w-3" /> Coming soon
        </Badge>
        <h1 className="text-2xl font-bold">Salon-quality service at home</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verified stylists, transparent pricing, hygienic tools. We're onboarding partners
          in your city right now.
        </p>
      </div>
      <p className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        You'll get a notification when at-home booking goes live near you.
      </p>
    </main>
  );
}
