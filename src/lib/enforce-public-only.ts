/**
 * Protected customer dashboard routes own their header and mobile navigation,
 * so public marketing chrome must not render inside them.
 */
export function isCustomerRoute(): boolean {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function assertPublicOnly(_componentName: string): boolean {
  return isCustomerRoute();
}
