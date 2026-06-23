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

import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { ServiceWorkerUpdatePrompt } from "@/components/pwa/ServiceWorkerUpdatePrompt";
import { Toaster } from "@/components/ui/sonner";

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
      { name: "theme-color", content: "#635BFF" },
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
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/232256ad-c4f3-4f72-84f1-0c97aa408c63/id-preview-d451d0e4--822fe342-2aa4-466c-8092-9280657c85a5.lovable.app-1781852479510.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/232256ad-c4f3-4f72-84f1-0c97aa408c63/id-preview-d451d0e4--822fe342-2aa4-466c-8092-9280657c85a5.lovable.app-1781852479510.png" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
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
    void import("@/stores/authStore").then(({ useAuthStore }) => {
      useAuthStore.getState().initialize().then((unsub) => {
        unsubscribe = unsub;
      });
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <PWAInstallPrompt />
      <ServiceWorkerUpdatePrompt />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
