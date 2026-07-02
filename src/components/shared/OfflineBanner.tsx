import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

type Props = {
  /** Optional message override. */
  message?: string;
  /** Optional secondary hint under the message. */
  hint?: string;
  /** If true, always renders (for previews/tests). */
  forceShow?: boolean;
  className?: string;
};

/**
 * A dismissable-less, always-visible banner shown when the user is offline.
 * Renders nothing when the user is online.
 */
export function OfflineBanner({ message, hint, forceShow, className }: Props) {
  const online = useOnlineStatus();
  if (online && !forceShow) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100 " +
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm " +
        (className ?? "")
      }
    >
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <div className="font-semibold">
          {message ?? "You're offline"}
        </div>
        <div className="text-xs opacity-90">
          {hint ??
            "You can keep browsing your saved booking, but confirming and payment need internet."}
        </div>
      </div>
    </div>
  );
}

/**
 * Small inline pill variant for headers/toolbars.
 */
export function OfflinePill({ className }: { className?: string }) {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 " +
        (className ?? "")
      }
    >
      <WifiOff className="h-3 w-3" aria-hidden /> Offline
    </span>
  );
}
