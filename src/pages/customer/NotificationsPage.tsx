import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bell,
  Calendar,
  CheckCheck,
  Gift,
  Settings,
  Sparkles,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications.functions";
import { useAuthStore } from "@/stores/authStore";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

type NotificationType = "booking" | "reward" | "wallet" | "offer" | "referral" | "system";
type Row = {
  id: string;
  title: string;
  body: string | null;
  type: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

const TYPE_META: Record<NotificationType, { label: string; icon: typeof Bell; tint: string }> = {
  booking: {
    label: "Bookings",
    icon: Calendar,
    tint: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  },
  reward: {
    label: "Rewards",
    icon: Sparkles,
    tint: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  },
  wallet: {
    label: "Wallet",
    icon: Wallet,
    tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
  offer: { label: "Offers", icon: Ticket, tint: "bg-pink-500/15 text-pink-600 dark:text-pink-300" },
  referral: {
    label: "Referrals",
    icon: Users,
    tint: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  },
  system: {
    label: "System",
    icon: Settings,
    tint: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  },
};
const FILTERS: Array<{ key: "all" | NotificationType; label: string }> = [
  { key: "all", label: "All" },
  { key: "booking", label: "Bookings" },
  { key: "reward", label: "Rewards" },
  { key: "wallet", label: "Wallet" },
  { key: "offer", label: "Offers" },
  { key: "referral", label: "Referrals" },
  { key: "system", label: "System" },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const resolveType = (t: string | null | undefined): NotificationType =>
  (t && t in TYPE_META ? t : "system") as NotificationType;

export function NotificationsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const listFn = useServerFn(listMyNotifications);
  const readFn = useServerFn(markNotificationRead);
  const readAllFn = useServerFn(markAllNotificationsRead);

  useRealtimeNotifications(user?.id);

  const { data: items = [] } = useQuery<Row[]>({
    queryKey: ["notifications", "mine"],
    queryFn: () => listFn(),
    enabled: !!user,
  });

  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const [confirming, setConfirming] = useState(false);

  const unreadCount = items.filter((n) => !n.is_read).length;
  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((n) => resolveType(n.type) === filter)),
    [items, filter],
  );

  const readMut = useMutation({
    mutationFn: (id: string) => readFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", "mine"] }),
  });
  const readAllMut = useMutation({
    mutationFn: () => readAllFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", "mine"] });
      toast.success("All notifications marked as read");
      setConfirming(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="size-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
              : "You're all caught up."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <CheckCheck className="size-4" /> Mark all read
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground/80 hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {filtered.length === 0 && (
          <li className="p-10 text-center text-muted-foreground">
            <Gift className="mx-auto mb-2 size-6 opacity-60" />
            No notifications here yet.
          </li>
        )}
        {filtered.map((n) => (
          <NotificationItem key={n.id} item={n} onRead={(id) => readMut.mutate(id)} />
        ))}
      </ul>

      {confirming && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg">Mark all as read?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All {unreadCount} unread notifications will be marked as read.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => readAllMut.mutate()}
                disabled={readAllMut.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                Mark all read
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ item, onRead }: { item: Row; onRead: (id: string) => void }) {
  const meta = TYPE_META[resolveType(item.type)];
  const Icon = meta.icon;
  const handleClick = () => {
    if (!item.is_read) onRead(item.id);
  };
  const content = (
    <>
      <div className="relative shrink-0">
        <span className={`grid place-items-center size-10 rounded-full ${meta.tint}`}>
          <Icon className="size-4" />
        </span>
        {!item.is_read && (
          <span
            className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-indigo-500 ring-2 ring-card"
            aria-label="Unread"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`text-sm leading-tight ${
              item.is_read ? "font-medium text-foreground/80" : "font-semibold text-foreground"
            }`}
          >
            {item.title}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.created_at)}</span>
        </div>
        {item.body && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
        )}
      </div>
    </>
  );
  const cls = "flex items-start gap-3 p-4 transition hover:bg-muted/40 cursor-pointer";
  if (item.link) {
    return (
      <li>
        <Link to={item.link} onClick={handleClick} className={cls}>
          {content}
        </Link>
      </li>
    );
  }
  return (
    <li onClick={handleClick} className={cls}>
      {content}
    </li>
  );
}
