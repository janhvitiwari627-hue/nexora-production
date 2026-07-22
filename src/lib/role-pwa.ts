export type NexoraAppKind = "master" | "customer" | "owner" | "partner" | "distributor" | "jobs";

const APP_MANIFESTS: Record<NexoraAppKind, string> = {
  master: "/manifest.webmanifest",
  customer: "/manifests/customer.webmanifest",
  owner: "/manifests/owner.webmanifest",
  partner: "/manifests/partner.webmanifest",
  distributor: "/manifests/distributor.webmanifest",
  jobs: "/manifests/jobs.webmanifest",
};

const APP_TOUCH_ICONS: Record<NexoraAppKind, string> = {
  master: "/icon-192.png",
  customer: "/customer-pwa-transparent-192.png?v=20260722-transparent-v4",
  owner: "/icon-192.png",
  partner: "/icon-192.png",
  distributor: "/icon-192.png",
  jobs: "/icon-192.png",
};

const APP_THEME_COLORS: Record<NexoraAppKind, string> = {
  master: "#2563eb",
  customer: "#050505",
  owner: "#6d28d9",
  partner: "#7c3aed",
  distributor: "#0f766e",
  jobs: "#ea580c",
};

export function appKindForPath(pathname: string): NexoraAppKind {
  if (pathname.startsWith("/app/customer")) return "customer";
  if (pathname.startsWith("/app/owner")) return "owner";
  if (pathname.startsWith("/app/jobs")) return "jobs";
  if (pathname.startsWith("/owner") || pathname === "/shop-owner-app") return "owner";
  if (
    pathname.startsWith("/partner") ||
    pathname.startsWith("/app/partner") ||
    pathname === "/growth-partner-app"
  )
    return "partner";
  if (pathname.startsWith("/portal") || pathname === "/distributor-app") return "distributor";
  if (pathname.startsWith("/jobs") || pathname.startsWith("/hire") || pathname === "/jobs-app") {
    return "jobs";
  }
  if (pathname.startsWith("/dashboard") || pathname === "/customer-app") return "customer";
  return "master";
}

export function activateRoleManifest(kind: NexoraAppKind) {
  const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (manifest) manifest.href = APP_MANIFESTS[kind];

  const touchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (touchIcon) {
    touchIcon.href = APP_TOUCH_ICONS[kind];
    touchIcon.type = "image/png";
  }

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) themeColor.content = APP_THEME_COLORS[kind];
}
