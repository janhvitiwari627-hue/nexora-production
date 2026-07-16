export type NexoraAppKind = "master" | "customer" | "owner" | "partner" | "distributor" | "jobs";

const APP_MANIFESTS: Record<NexoraAppKind, string> = {
  master: "/manifest.webmanifest",
  customer: "/manifests/customer.webmanifest",
  owner: "/manifests/owner.webmanifest",
  partner: "/manifests/partner.webmanifest",
  distributor: "/manifests/distributor.webmanifest",
  jobs: "/manifests/jobs.webmanifest",
};

export function appKindForPath(pathname: string): NexoraAppKind {
  if (pathname.startsWith("/app/customer")) return "customer";
  if (pathname.startsWith("/app/owner")) return "owner";
  if (pathname.startsWith("/app/jobs")) return "jobs";
  if (pathname.startsWith("/owner") || pathname === "/shop-owner-app") return "owner";
  if (pathname.startsWith("/partner") || pathname === "/growth-partner-app") return "partner";
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
}
