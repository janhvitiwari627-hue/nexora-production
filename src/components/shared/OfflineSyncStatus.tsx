import { CloudUpload, CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";
import { useOfflineQueue } from "@/lib/offline-queue.hooks";
import { flush, removeTask } from "@/lib/offline-queue";
import { useOnlineStatus } from "@/hooks/use-online-status";

type Props = {
  /** Only show items of this task type. If omitted, shows the whole queue. */
  type?: string;
  className?: string;
  /** Short label describing what "1 action" means for this surface. */
  itemLabel?: string; // e.g. "booking" -> "1 booking will sync"
};

/**
 * Compact status card summarising pending / failed offline tasks and offering
 * a manual "Retry now" action. Renders nothing when there is nothing to sync.
 */
export function OfflineSyncStatus({ type, className, itemLabel = "action" }: Props) {
  const queue = useOfflineQueue();
  const online = useOnlineStatus();
  const relevant = type ? queue.filter((t) => t.type === type) : queue;
  if (relevant.length === 0) return null;

  const pending = relevant.filter((t) => t.status !== "failed").length;
  const failed = relevant.filter((t) => t.status === "failed");

  const noun = (n: number) => (n === 1 ? itemLabel : `${itemLabel}s`);

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "border-primary/30 bg-primary/5 text-heading flex items-start gap-3 rounded-xl border px-4 py-3 text-sm " +
        (className ?? "")
      }
    >
      {online ? (
        <CloudUpload className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-semibold">
          {pending > 0
            ? `${pending} ${noun(pending)} saved — will sync automatically`
            : `${failed.length} ${noun(failed.length)} failed to sync`}
        </div>
        <div className="text-muted-foreground text-xs">
          {online
            ? pending > 0
              ? "You're back online. Syncing in the background."
              : "Some items couldn't be synced. Retry or discard them."
            : "You're offline. Actions will send when the connection returns."}
        </div>

        {failed.length > 0 && (
          <ul className="mt-2 space-y-1">
            {failed.slice(0, 3).map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-background/60 px-2 py-1 text-xs"
              >
                <span className="text-danger inline-flex items-center gap-1 truncate">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="truncate">{t.lastError ?? "Sync failed"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeTask(t.id)}
                  className="text-muted-foreground hover:text-heading text-[11px] font-semibold uppercase"
                >
                  Discard
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {online && (
        <button
          type="button"
          onClick={() => void flush()}
          className="border-primary/40 hover:bg-primary/10 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
        >
          <RefreshCw className="h-3 w-3" /> Retry now
        </button>
      )}
    </div>
  );
}
