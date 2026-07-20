import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export function OfflineFallbackPage({ cachedShops = [] as { name: string; slug: string }[] }) {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md text-center">
        <div className="bg-muted mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full">
          <WifiOff className="text-muted-foreground h-8 w-8" />
        </div>
        <h1 className="text-heading text-2xl font-bold">You're offline</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This page isn't cached. Please reconnect to load fresh content.
        </p>

        {cachedShops.length > 0 && (
          <div className="mt-6 text-left">
            <div className="text-muted-foreground mb-2 text-xs uppercase tracking-wider">
              Recently viewed (cached)
            </div>
            <ul className="space-y-2">
              {cachedShops.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`/site/${s.slug}`}
                    className="hover:bg-muted block rounded-lg border px-4 py-3 text-sm"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button className="mt-6" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
