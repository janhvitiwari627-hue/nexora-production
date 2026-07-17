import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_salon",
  title: "Get salon details",
  description:
    "Fetch detailed public information for a single Nexora salon by its slug, including services and recent reviews.",
  inputSchema: {
    slug: z.string().trim().min(1).max(200).describe("Salon slug (from search_salons results)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return { content: [{ type: "text", text: "Backend not configured." }], isError: true };
    }
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: salon, error } = await supabase
      .from("public_salon_cards")
      .select(
        "id, slug, name, category, rating, reviews_count, location, address, phone, whatsapp, price_range, discount, description, tagline, is_verified, is_home_service",
      )
      .eq("slug", slug)
      .eq("website_created", true)
      .maybeSingle();

    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    if (!salon) {
      return { content: [{ type: "text", text: "Salon not found." }], isError: true };
    }

    const [{ data: services }, { data: reviews }] = await Promise.all([
      supabase
        .from("services")
        .select("name, category, duration_minutes, price")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("price", { ascending: true })
        .limit(30),
      supabase
        .from("reviews")
        .select("rating, comment, created_at")
        .eq("salon_id", salon.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const text = [
      `# ${salon.name}${salon.is_verified ? " ✓" : ""}`,
      salon.tagline ? `_${salon.tagline}_` : "",
      `Category: ${salon.category ?? "n/a"} · Rating: ★${salon.rating ?? "n/a"} (${salon.reviews_count ?? 0} reviews)`,
      `Location: ${salon.location ?? "—"}${salon.address ? ` — ${salon.address}` : ""}`,
      salon.phone ? `Phone: ${salon.phone}` : "",
      salon.description ? `\n${salon.description}` : "",
      services?.length
        ? `\n## Services\n${services.map((s) => `- ${s.name} — ₹${s.price} (${s.duration_minutes ?? "?"} min)`).join("\n")}`
        : "",
      reviews?.length
        ? `\n## Recent reviews\n${reviews.map((r) => `- ★${r.rating}: ${r.comment ?? ""}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      content: [{ type: "text", text }],
      structuredContent: { salon, services: services ?? [], reviews: reviews ?? [] },
    };
  },
});
