import type { ReactNode } from "react";
import { BadgeCheck, Crown, Flame, Megaphone, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "verified" | "trending" | "new" | "premium" | "offer" | "sponsored";

const CONFIG: Record<BadgeVariant, { icon: ReactNode; classes: string; label: string }> = {
  verified: {
    icon: <BadgeCheck className="h-3 w-3" />,
    classes: "bg-primary text-primary-foreground",
    label: "Verified",
  },
  trending: {
    icon: <Flame className="h-3 w-3" />,
    classes: "bg-danger/15 text-danger",
    label: "Trending",
  },
  new: {
    icon: <Sparkles className="h-3 w-3" />,
    classes: "bg-success/15 text-success",
    label: "New",
  },
  premium: {
    icon: <Crown className="h-3 w-3" />,
    classes: "bg-gradient-gold text-heading",
    label: "Premium",
  },
  offer: {
    icon: <Tag className="h-3 w-3" />,
    classes: "bg-warning/20 text-heading",
    label: "Offer",
  },
  sponsored: {
    icon: <Megaphone className="h-3 w-3" />,
    classes: "bg-muted text-muted-foreground",
    label: "Sponsored",
  },
};

export function Badge({
  variant,
  children,
  className,
}: {
  variant: BadgeVariant;
  children?: ReactNode;
  className?: string;
}) {
  const cfg = CONFIG[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        cfg.classes,
        className,
      )}
    >
      {cfg.icon}
      {children ?? cfg.label}
    </span>
  );
}
