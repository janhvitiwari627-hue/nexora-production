import { defineMcp } from "@lovable.dev/mcp-js";
import searchSalons from "./tools/search-salons";
import getSalon from "./tools/get-salon";

export default defineMcp({
  name: "nexora-mcp",
  title: "Nexora SalonOS",
  version: "0.1.0",
  instructions:
    "Public tools for the Nexora SalonOS directory. Use `search_salons` to find salons/spas/barbershops by name, category, or location, and `get_salon` to fetch full details (services, reviews) by slug.",
  tools: [searchSalons, getSalon],
});
