import { useMemo, useState } from "react";
import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";
import { Copy, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";

export function WReferral({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const referralCode = useMemo(
    () =>
      `${shop.slug.toUpperCase().replace(/-/g, "").slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    [shop.slug],
  );
  const referralLink = `https://meripahalfasthelp.online/site/${shop.slug}?ref=${referralCode}`;
  const [showQR, setShowQR] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(referralLink)}`;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <section id="referral" className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Refer & Earn</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Share your link, earn {shop.loyalty.referralPoints} points per successful referral.
      </p>
      <div
        className="mx-auto mt-8 grid max-w-3xl gap-4 border p-6 shadow-sm md:grid-cols-2"
        style={{ borderRadius: template.radius, backgroundColor: template.colors.accent }}
      >
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground text-xs uppercase tracking-wider">
              Your Referral Code
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-md border bg-white px-3 py-2">
              <span className="flex-1 font-mono text-sm font-semibold">{referralCode}</span>
              <button
                onClick={() => copy(referralCode, "Code")}
                aria-label="Copy code"
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-muted-foreground text-xs uppercase tracking-wider">
              Your Referral Link
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-md border bg-white px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs">{referralLink}</span>
              <button
                onClick={() => copy(referralLink, "Link")}
                aria-label="Copy link"
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ShareButton
              title={`Join me at ${shop.name}`}
              text={`Use my code ${referralCode}`}
              url={referralLink}
              label="Share Link"
            />
            <button
              type="button"
              onClick={() => setShowQR((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-white/80 px-3 py-1 text-xs font-medium"
            >
              <QrCode className="h-3 w-3" /> {showQR ? "Hide" : "Show"} QR
            </button>
          </div>
        </div>
        <div className="grid place-items-center">
          {showQR ? (
            <img
              src={qrUrl}
              alt="Referral QR"
              className="h-44 w-44 rounded-md border bg-white p-2"
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2 text-center text-xs">
              <Share2 className="h-8 w-8" style={{ color: template.colors.primary }} />
              <p>Track every referral in your member dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
