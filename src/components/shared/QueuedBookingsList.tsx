import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CloudUpload, Loader2, RefreshCw, Save, Trash2, TriangleAlert, X } from "lucide-react";
import { flush, removeTask, type QueueTask, type QueueTaskStatus } from "@/lib/offline-queue";
import { useOfflineQueue } from "@/lib/offline-queue.hooks";
import {
  TASK_CREATE_AND_CONFIRM_BOOKING,
  type BookingSyncResult,
  type CreateAndConfirmPayload,
} from "@/lib/booking-offline-sync";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  className?: string;
  /** Compact single-line variant for tight surfaces (e.g. confirmation screen). */
  compact?: boolean;
  /** Limit how many queued cards to show. */
  limit?: number;
  /**
   * When a queued booking transitions to "confirmed", automatically navigate
   * the user to its detail page. Defaults to true.
   */
  autoNavigateOnConfirm?: boolean;
};

type BookingTask = QueueTask<CreateAndConfirmPayload, BookingSyncResult>;

/** UI-facing progression stage for a queued booking. */
type Stage = "saved" | "syncing" | "confirmed" | "failed";

function stageOf(task: BookingTask, online: boolean): Stage {
  if (task.status === "succeeded") return "confirmed";
  if (task.status === "failed") return "failed";
  if (task.status === "running") return "syncing";
  // pending: distinguish "waiting for network" vs "waiting to retry"
  return online && task.attempts > 0 ? "syncing" : "saved";
}

const STAGE_META: Record<
  Stage,
  { label: string; hint: string; toneClass: string; Icon: typeof Save }
> = {
  saved: {
    label: "Saved on this device",
    hint: "Will sync automatically when you're back online.",
    toneClass: "border-amber-300 bg-amber-50 text-amber-900",
    Icon: Save,
  },
  syncing: {
    label: "Syncing…",
    hint: "Sending your booking to Nexora.",
    toneClass: "border-primary/30 bg-primary/5 text-heading",
    Icon: Loader2,
  },
  confirmed: {
    label: "Confirmed",
    hint: "Your booking is on the schedule.",
    toneClass: "border-emerald-300 bg-emerald-50 text-emerald-900",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Couldn't sync",
    hint: "We'll keep trying — or retry manually.",
    toneClass: "border-danger/40 bg-danger/5 text-danger",
    Icon: TriangleAlert,
  },
};

const STAGE_ORDER: Stage[] = ["saved", "syncing", "confirmed"];

function ProgressRail({ stage }: { stage: Stage }) {
  const activeIdx = stage === "failed" ? 1 : STAGE_ORDER.indexOf(stage);
  return (
    <ol
      className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider"
      aria-label="Sync progress"
    >
      {STAGE_ORDER.map((s, i) => {
        const done = i < activeIdx;
        const current = i === activeIdx;
        const failed = stage === "failed" && i === 1;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={
                "grid h-5 w-5 place-items-center rounded-full border text-[10px] " +
                (failed
                  ? "border-danger bg-danger text-white"
                  : done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : current
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground")
              }
            >
              {failed ? "!" : done ? "✓" : i + 1}
            </span>
            <span
              className={
                "truncate " +
                (failed
                  ? "text-danger"
                  : done || current
                    ? "text-heading"
                    : "text-muted-foreground")
              }
            >
              {STAGE_META[s].label.replace("…", "")}
            </span>
            {i < STAGE_ORDER.length - 1 && (
              <span
                aria-hidden
                className={
                  "h-px flex-1 " +
                  (done ? "bg-emerald-400" : current ? "bg-primary/40" : "bg-border")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function formatWhen(date: string, time: string) {
  try {
    const d = new Date(`${date}T${time}`);
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return `${date} · ${time}`;
  }
}

function QueuedBookingCard({
  task,
  compact,
}: {
  task: BookingTask;
  compact?: boolean;
}) {
  const online = useOnlineStatus();
  const stage = stageOf(task, online);
  const meta = STAGE_META[stage];
  const Icon = meta.Icon;
  const payload = task.payload;
  const spinning = stage === "syncing";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancellable = stage === "saved" || stage === "syncing";

  const doCancel = () => {
    removeTask(task.id);
    setConfirmOpen(false);
    toast.success("Queued booking cancelled");
  };

  return (
    <article
      className={
        "rounded-xl border px-4 py-3 shadow-sm " +
        meta.toneClass +
        (compact ? " text-xs" : " text-sm")
      }
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 font-semibold">
            <Icon className={"h-4 w-4 shrink-0" + (spinning ? " animate-spin" : "")} />
            <span>{meta.label}</span>
            {task.result?.booking_reference && (
              <span className="ml-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                #{task.result.booking_reference}
              </span>
            )}
          </div>
          <div className={"mt-1 truncate font-medium " + (compact ? "text-xs" : "text-sm")}>
            {payload.shop_name ?? "Your booking"} · {formatWhen(payload.booking_date, payload.booking_time)}
          </div>
          <div className="text-muted-foreground mt-0.5 truncate text-[11px]">
            {payload.service_name}
          </div>
          {stage === "failed" && task.lastError && (
            <div className="text-danger mt-1 truncate text-[11px]">{task.lastError}</div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {(stage === "failed" || stage === "saved") && online && (
            <button
              type="button"
              onClick={() => void flush()}
              className="border-primary/40 hover:bg-primary/10 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
          {cancellable && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-label="Cancel queued booking"
              className="border-danger/40 text-danger hover:bg-danger/10 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            >
              <Trash2 className="h-3 w-3" /> Cancel
            </button>
          )}
          {(stage === "failed" || stage === "confirmed") && (
            <button
              type="button"
              onClick={() => removeTask(task.id)}
              aria-label={stage === "confirmed" ? "Dismiss" : "Discard"}
              className="text-muted-foreground hover:text-heading grid h-6 w-6 place-items-center rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {!compact && <ProgressRail stage={stage} />}
      {!compact && (
        <p className="text-muted-foreground mt-2 text-[11px]">{meta.hint}</p>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this queued booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {payload.shop_name ?? "Your booking"} on{" "}
              <span className="font-semibold text-heading">
                {formatWhen(payload.booking_date, payload.booking_time)}
              </span>{" "}
              hasn't been sent yet. Cancelling removes it from this device and it
              won't sync. This can't be undone.
              {stage === "syncing" && (
                <span className="mt-2 block text-xs text-amber-700">
                  A sync is in progress — if it completes before you confirm, the
                  booking may still go through.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={doCancel}
              className="bg-danger text-white hover:bg-danger/90"
            >
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

/**
 * Renders all queued booking tasks (create + confirm) with per-item status.
 * Empty when there's nothing pending or recently confirmed.
 */
export function QueuedBookingsList({
  className,
  compact,
  limit,
  autoNavigateOnConfirm = true,
}: Props) {
  const queue = useOfflineQueue();
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const notifiedRef = useRef<Set<string>>(new Set());
  const tasks = queue.filter(
    (t) => t.type === TASK_CREATE_AND_CONFIRM_BOOKING,
  ) as BookingTask[];

  useEffect(() => {
    if (!autoNavigateOnConfirm) return;
    const seenKey = "nx_offline_queue_navigated_v1";
    let seen: Set<string>;
    try {
      seen = new Set<string>(
        JSON.parse(sessionStorage.getItem(seenKey) || "[]") as string[],
      );
    } catch {
      seen = new Set<string>();
    }
    const justConfirmed = tasks.find(
      (t) =>
        t.status === "succeeded" &&
        t.result?.booking_id &&
        !seen.has(t.id) &&
        !notifiedRef.current.has(t.id),
    );
    if (!justConfirmed || !justConfirmed.result?.booking_id) return;

    const bookingId = justConfirmed.result.booking_id;
    const ref = justConfirmed.result.booking_reference;

    // Mark this task as handled immediately — both in-memory and in
    // sessionStorage — so any re-render (or a second mounted list) that
    // observes the same succeeded task can't fire another navigation.
    notifiedRef.current.add(justConfirmed.id);
    seen.add(justConfirmed.id);
    try {
      sessionStorage.setItem(seenKey, JSON.stringify(Array.from(seen)));
    } catch {
      // ignore
    }

    // If the user is already on this booking's detail page, don't navigate
    // again — just refresh its data in place.
    const currentPath = router.state.location.pathname;
    const targetPath = `/dashboard/bookings/${bookingId}`;
    const alreadyThere = currentPath === targetPath;

    queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });

    if (alreadyThere) {
      toast.success(
        ref ? `Booking #${ref} confirmed` : "Your booking is confirmed",
        { description: "Refreshing your booking details…" },
      );
      void router.invalidate();
      return;
    }

    toast.success(
      ref ? `Booking #${ref} confirmed` : "Your booking is confirmed",
      { description: "Opening your booking details…" },
    );
    void navigate({
      to: "/dashboard/bookings/$id",
      params: { id: bookingId },
    }).then(() => {
      void router.invalidate();
    });
  }, [tasks, autoNavigateOnConfirm, navigate, router, queryClient]);


  if (tasks.length === 0) return null;


  const list = limit ? tasks.slice(0, limit) : tasks;
  const pending = tasks.filter((t) => t.status !== "succeeded" && t.status !== "failed").length;

  return (
    <section className={"space-y-2 " + (className ?? "")}>
      {!compact && (
        <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CloudUpload className="h-3.5 w-3.5" />
          Queued bookings
          <span className="text-heading">({tasks.length})</span>
          {pending > 0 && (
            <span
              className={
                "ml-auto rounded-full px-2 py-0.5 text-[10px] " +
                (online
                  ? "bg-primary/10 text-primary"
                  : "bg-amber-100 text-amber-900")
              }
            >
              {online ? "Syncing" : "Waiting for internet"}
            </span>
          )}
        </header>
      )}
      <div className="space-y-2">
        {list.map((t) => (
          <QueuedBookingCard key={t.id} task={t} compact={compact} />
        ))}
      </div>
    </section>
  );
}

/** Public helper if a surface wants to render exactly one task by status filter. */
export { QueuedBookingCard };
export type { Stage as QueuedBookingStage, QueueTaskStatus };
