import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import nexoraLogo from "@/assets/nexora-logo.jpg.asset.json";


import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { Toaster } from "@/components/ui/sonner";
import { useApplicationStatusNotifications } from "@/hooks/useApplicationStatusNotifications";

function NotFoundComponent() {
  return <NotFoundPage />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#2563eb" },
      { title: "Nexora — Book salons, spas & barbers near you" },
      {
        name: "description",
        content:
          "Discover top-rated salons, spas and barbershops. Instant booking, member rewards, and exclusive offers on Nexora SalonOS.",
      },
      { property: "og:title", content: "Nexora — Book salons, spas & barbers near you" },
      {
        property: "og:description",
        content: "Discover, book, and grow with the operating system for modern salons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nexora — Book salons, spas & barbers near you" },
      { name: "description", content: "Nexora SalonOS is a comprehensive platform for salon discovery, booking, and management." },
      { property: "og:description", content: "Nexora SalonOS is a comprehensive platform for salon discovery, booking, and management." },
      { name: "twitter:description", content: "Nexora SalonOS is a comprehensive platform for salon discovery, booking, and management." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/da4bf8e9-fc45-4add-8224-b9561fb25cd4" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/da4bf8e9-fc45-4add-8224-b9561fb25cd4" },
    ],
    links: [
      { rel: "icon", href: nexoraLogo.url, type: "image/jpeg", sizes: "any" },
      { rel: "shortcut icon", href: nexoraLogo.url, type: "image/jpeg" },
      { rel: "apple-touch-icon", href: nexoraLogo.url, sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },


      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&family=Playfair+Display:wght@500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Dancing+Script:wght@600&family=Instrument+Serif&family=Work+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const initializeAuthStore = () => {
      void import("@/stores/authStore").then(({ useAuthStore }) => {
        useAuthStore.getState().initialize().then((unsub) => {
          unsubscribe = unsub;
        });
      });
    };

    if (window.location.pathname === "/auth/callback") {
      timer = setTimeout(initializeAuthStore, 3000);
    } else {
      initializeAuthStore();
    }

    // Kill-switch: any previously-installed customer-app service worker
    // gets replaced by /sw.js which unregisters itself on activate. We
    // additionally best-effort unregister here so returning visitors on
    // browsers that already cached the old SW get evicted immediately.
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations?.()
        .then((regs) => regs.forEach((r) => { void r.unregister(); }))
        .catch(() => { /* ignore */ });
    }

    void import("@/lib/booking-offline-sync").then(({ initBookingOfflineSync }) => {
      initBookingOfflineSync();
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppSideEffects />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

function AppSideEffects() {
  useApplicationStatusNotifications();
  return null;
}
