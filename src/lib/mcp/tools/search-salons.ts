import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_salons",
  title: "Search salons",
  description:
    "Search Nexora's public directory of salons, spas, and barbershops. Filters by optional query text (matched against name), category, and city/location. Returns up to 20 results.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .max(200)
      .optional()
      .describe("Free-text search matched against salon name."),
    category: z
      .string()
      .trim()
      .max(100)
      .optional()
      .describe("Category filter, e.g. 'Hair Salon', 'Spa', 'Barber Shop'."),
    location: z
      .string()
      .trim()
      .max(200)
      .optional()
      .describe("City or area name to filter by (matched against location field)."),
    limit: z.number().int().min(1).max(20).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, location, limit }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return { content: [{ type: "text", text: "Backend not configured." }], isError: true };
    }
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let q = supabase
      .from("public_salon_cards")
      .select(
        "id, slug, name, category, rating, reviews_count, location, address, price_range, is_verified",
      )
      .eq("website_created", true)
      .limit(limit ?? 10);

    if (query) q = q.ilike("name", `%${query}%`);
    if (category) q = q.eq("category", category);
    if (location) q = q.ilike("location", `%${location}%`);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    const rows = data ?? [];
    return {
      content: [
        {
          type: "text",
          text: rows.length
            ? `Found ${rows.length} salon(s):\n\n${rows
                .map(
                  (s) =>
                    `- ${s.name} (${s.category ?? "n/a"}) — ${s.location ?? "—"} — ★${s.rating ?? "n/a"} (${s.reviews_count ?? 0} reviews) — slug: ${s.slug}`,
                )
                .join("\n")}`
            : "No salons matched.",
        },
      ],
      structuredContent: { salons: rows },
    };
  },
});
