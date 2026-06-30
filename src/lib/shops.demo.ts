import type { Shop } from "@/components/shared/ShopCard";
import { getMockShops } from "./mock-businesses";

/**
 * Demo fallback shops — used ONLY when there is no real salon data in the
 * database yet. Pulled from the Jaipur mock-business catalog so that every
 * card here has a matching /site/:slug mock white-label page.
 */
export const DEMO_SHOPS: Shop[] = getMockShops();
