import { toast } from "sonner";
import { isPreviewOrDev } from "@/lib/pwa-guards";

const KEY = "nexora_push_requested";

/**
 * Call after the user's first successful booking to opt-in to push notifications.
 * No-ops in preview/dev or if the user already responded.
 */
export async function requestPushPermission(): Promise<NotificationPermission | "skipped"> {
  if (typeof window === "undefined" || isPreviewOrDev()) return "skipped";
  if (!("Notification" in window)) return "skipped";
  if (localStorage.getItem(KEY)) return Notification.permission;

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(KEY, permission);
    if (permission === "granted") {
      toast.success("Notifications enabled", { description: "We'll remind you of upcoming appointments." });
    }
    return permission;
  } catch {
    return "skipped";
  }
}
