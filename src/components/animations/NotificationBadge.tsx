import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  /** When true, the dot pulses to draw attention. Defaults to count > 0. */
  pulse?: boolean;
  max?: number;
  children?: ReactNode;
  className?: string;
}

/**
 * Wraps a trigger (e.g. a bell icon) and overlays an unread-count dot that
 * pulses while unread > 0.
 */
export function NotificationBadge({
  count,
  pulse,
  max = 99,
  children,
  className,
}: NotificationBadgeProps) {
  const show = count > 0;
  const display = count > max ? `${max}+` : String(count);
  const shouldPulse = pulse ?? show;

  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      {show && (
        <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center">
          {shouldPulse && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          )}
          <span className="relative inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
            {display}
          </span>
        </span>
      )}
    </span>
  );
}
