/**
 * Runtime guard: kept for backwards compatibility.
 *
 * The Customer App has been removed from this project — it ships as a
 * separate product. This guard now always allows public-website layout
 * components to render.
 */
export function isCustomerRoute(): boolean {
  return false;
}

export function assertPublicOnly(_componentName: string): boolean {
  return false;
}
