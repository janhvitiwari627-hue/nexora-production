import {
  Calendar,
  Star,
  Sparkles,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { mockActivity, type ActivityType } from "../mockDashboard";

const ICONS: Record<ActivityType, { Icon: LucideIcon; bg: string; fg: string }> = {
  booking: { Icon: Calendar, bg: "bg-indigo-100", fg: "text-indigo-600" },
  review: { Icon: Star, bg: "bg-amber-100", fg: "text-amber-600" },
  reward: { Icon: Sparkles, bg: "bg-fuchsia-100", fg: "text-fuchsia-600" },
  offer: { Icon: Tag, bg: "bg-emerald-100", fg: "text-emerald-600" },
  referral: { Icon: Users, bg: "bg-sky-100", fg: "text-sky-600" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function RecentActivityFeed() {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Recent Activity</h2>
      <ul className="mt-4 space-y-3">
        {mockActivity.slice(0, 5).map((e) => {
          const cfg = ICONS[e.type];
          return (
            <li key={e.id} className="flex items-start gap-3">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${cfg.bg}`}>
                <cfg.Icon className={`h-4 w-4 ${cfg.fg}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.title}</p>
                <p className="truncate text-xs text-muted-foreground">{e.subtitle}</p>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                {timeAgo(e.timestamp)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
