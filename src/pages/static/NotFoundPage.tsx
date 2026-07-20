import { Button } from "@/components/ui/button";
import { Home, Search, Sparkles } from "lucide-react";

export function StaticNotFoundPage() {
  return (
    <div className="grid min-h-[80vh] place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="relative mx-auto mb-6 h-32 w-32">
          <div className="bg-gradient-to-br from-primary to-accent absolute inset-0 rounded-full opacity-20 blur-2xl" />
          <div className="bg-gradient-to-br from-primary to-accent relative grid h-full w-full place-items-center rounded-full text-white shadow-2xl">
            <Sparkles className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-heading text-6xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2 text-lg">We couldn't find that page</p>
        <p className="text-muted-foreground mt-1 text-sm">
          The page may have moved, or the link is broken.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="bg-gradient-to-r from-primary to-accent">
            <a href="/">
              <Home className="h-4 w-4" /> Go Home
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/">
              <Search className="h-4 w-4" /> Search Services
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
