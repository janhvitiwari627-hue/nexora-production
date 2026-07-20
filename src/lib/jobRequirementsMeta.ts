export const PORTFOLIO_OPTIONS = [
  "Portfolio required",
  "Instagram profile required",
  "Resume preferred",
  "No portfolio needed",
] as const;

export type PortfolioOption = (typeof PORTFOLIO_OPTIONS)[number];
export type ScreeningQuestionType = "short" | "long" | "yesno" | "number";
export type ScreeningQuestion = { q: string; t: ScreeningQuestionType };

const REQ_META_KEYS = {
  certification: "Certification",
  languages: "Languages",
  portfolio: "Portfolio",
  screening: "Screening",
} as const;

export function stripRequirementsMeta(raw: string | null | undefined): string {
  if (!raw) return "";
  const keys = Object.values(REQ_META_KEYS).join("|");
  const re = new RegExp(`^\\s*(?:${keys}):\\s*.+$`, "gmi");
  return raw
    .replace(re, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseRequirementsMeta(raw: string | null | undefined): {
  certification: string;
  languages: string[];
  portfolio: PortfolioOption | "";
  screening: ScreeningQuestion[];
} {
  const out = {
    certification: "",
    languages: [] as string[],
    portfolio: "" as PortfolioOption | "",
    screening: [] as ScreeningQuestion[],
  };
  if (!raw) return out;
  const certM = raw.match(/^\s*Certification:\s*(.+)$/im);
  if (certM) out.certification = certM[1].trim();
  const langM = raw.match(/^\s*Languages:\s*(.+)$/im);
  if (langM)
    out.languages = langM[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const portM = raw.match(/^\s*Portfolio:\s*(.+)$/im);
  if (portM) {
    const val = portM[1].trim();
    if ((PORTFOLIO_OPTIONS as readonly string[]).includes(val))
      out.portfolio = val as PortfolioOption;
  }
  const screenM = raw.match(/^\s*Screening:\s*(.+)$/im);
  if (screenM) {
    try {
      const parsed = JSON.parse(screenM[1].trim());
      if (Array.isArray(parsed)) {
        out.screening = parsed
          .filter((x) => x && typeof x.q === "string" && typeof x.t === "string")
          .map((x) => ({
            q: String(x.q),
            t: (["short", "long", "yesno", "number"].includes(x.t)
              ? x.t
              : "short") as ScreeningQuestionType,
          }));
      }
    } catch {}
  }
  return out;
}
