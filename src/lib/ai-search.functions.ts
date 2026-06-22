import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const CATEGORIES = [
  "Hair Salon",
  "Beauty Salon",
  "Spa",
  "Nail Studio",
  "Barber Shop",
  "Unisex Salon",
  "Tattoo Studio",
  "Massage Center",
] as const;

const ParsedSchema = z.object({
  service: z.string().describe("Core service searched, e.g. 'haircut', 'bridal makeup'. Empty string if none."),
  category: z.enum(CATEGORIES).nullable().describe("Best matching salon category, or null."),
  maxBudget: z.number().nullable().describe("Max budget in INR if user mentioned 'under X' / 'below X', else null."),
  minRating: z.number().min(0).max(5).nullable().describe("Min rating if user said 'top rated', 'best' → 4.5; 'good' → 4.0; else null."),
  area: z.string().nullable().describe("Locality / area name extracted, e.g. 'Malviya Nagar'. Null if user said 'near me' or none."),
  nearMe: z.boolean().describe("True if user implied proximity ('near me', 'nearby', 'closest')."),
  intent: z.string().describe("One-line natural summary of what user wants, for the UI to confirm."),
});

export type ParsedQuery = z.infer<typeof ParsedSchema>;

const InputSchema = z.object({ query: z.string().trim().min(1).max(300) });

export const parseSmartQuery = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<ParsedQuery> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system =
      "You parse natural-language salon search queries from Indian users (Hindi/English mix OK). " +
      "Extract structured intent. Be conservative — only fill fields the user clearly mentioned. " +
      "Categories: " + CATEGORIES.join(", ") + ". " +
      "Budget is INR; '500' or '₹500' means 500. " +
      "Map service words to category: haircut/beard → Barber Shop or Hair Salon; nails → Nail Studio; " +
      "massage → Massage Center; bridal/makeup/facial → Beauty Salon; spa → Spa; tattoo → Tattoo Studio.";

    try {
      const { experimental_output } = await generateText({
        model,
        system,
        prompt: `User query: "${data.query}"`,
        experimental_output: Output.object({ schema: ParsedSchema }),
      });
      return experimental_output;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`AI parse failed: ${message}`);
    }
  });
