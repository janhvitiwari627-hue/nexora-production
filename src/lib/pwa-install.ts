/**
 * Global capture for the browser's `beforeinstallprompt` event.
 *
 * Chrome fires this event exactly once per session, whenever the app meets
 * the install criteria — regardless of which route is mounted at the time.
 * If we only listen from inside CustomerAppPage, users who land on other
 * routes first will "miss" the prompt and clicking Install shows only the
 * manual guide.
 *
 * This module attaches the listener at app bootstrap, stashes the event
 * globally, and exposes a small pub/sub so any component can retrieve it
 * later or subscribe to future prompts.
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Listener = (evt: BeforeInstallPromptEvent | null) => void;

let cached: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<Listener>();
let wired = false;

function emit() {
  for (const fn of listeners) {
    try {
      fn(cached);
    } catch {
      // ignore listener errors
    }
  }
}

export function initInstallPromptCapture() {
  if (wired || typeof window === "undefined") return;
  wired = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    cached = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    cached = null;
    emit();
  });

  if (window.matchMedia?.("(display-mode: standalone)").matches) {
    installed = true;
  }
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return cached;
}

export function isAppInstalled(): boolean {
  return installed;
}

export function subscribeInstallPrompt(fn: Listener): () => void {
  listeners.add(fn);
  // Fire immediately so late subscribers see the current state.
  try {
    fn(cached);
  } catch {
    // ignore
  }
  return () => {
    listeners.delete(fn);
  };
}

/** Called after a successful prompt so subscribers reset their UI. */
export function clearInstallPrompt() {
  cached = null;
  emit();
}
