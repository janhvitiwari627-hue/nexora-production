/**
 * Runtime guard: ensures public-website layout components never render
 * on customer-app routes. If a /customer/* route accidentally imports a
 * public layout component, we log an error and refuse to render it so
 * the customer app stays visually isolated from the marketing site.
 *
 * Returns true when the caller should render null.
 */
export function isCustomerRoute(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/customer");
}

export function assertPublicOnly(componentName: string): boolean {
  if (isCustomerRoute()) {
    // eslint-disable-next-line no-console
    console.error(
      `[layout-guard] ${componentName} is a public-website component and must not render on /customer/* routes. Rendering null.`,
    );
    return true;
  }
  return false;
}
