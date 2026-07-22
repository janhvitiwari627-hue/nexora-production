export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallState =
  | "checking"
  | "available"
  | "installing"
  | "installed"
  | "ios"
  | "unsupported"
  | "cancelled";

let deferredPrompt: InstallPromptEvent | null = null;
let currentState: InstallState = "checking";
let listenersReady = false;
let installPromptPending = false;
let installAcceptedAt = 0;
let installCompletionTimer: number | null = null;
const subscribers = new Set<(state: InstallState) => void>();
const MINIMUM_VISIBLE_INSTALL_MS = 2200;

function publish(state: InstallState) {
  currentState = state;
  subscribers.forEach((subscriber) => subscriber(state));
}

function publishInstalledAfterProgress() {
  deferredPrompt = null;

  if (installPromptPending) return;
  if (!installAcceptedAt) {
    publish("installed");
    return;
  }

  if (installCompletionTimer !== null) window.clearTimeout(installCompletionTimer);
  const elapsed = Date.now() - installAcceptedAt;
  const remaining = Math.max(0, MINIMUM_VISIBLE_INSTALL_MS - elapsed);
  installCompletionTimer = window.setTimeout(() => {
    installCompletionTimer = null;
    installAcceptedAt = 0;
    publish("installed");
  }, remaining);
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroidDevice() {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /; wv\)|\bwv\b|FBAN|FBAV|Instagram|WhatsApp|Telegram|Line\/|Snapchat|Pinterest/i.test(ua);
}

export function initializePwaInstall() {
  if (typeof window === "undefined" || listenersReady) return;
  listenersReady = true;

  if (isStandalonePwa()) publish("installed");
  else if (isIosDevice()) publish("ios");
  else publish("unsupported");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    publish("available");
  });
  window.addEventListener("appinstalled", publishInstalledAfterProgress);
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", (event) => {
    if (event.matches) publishInstalledAfterProgress();
  });
}

export function subscribeToPwaInstall(subscriber: (state: InstallState) => void) {
  initializePwaInstall();
  subscribers.add(subscriber);
  subscriber(currentState);
  return () => {
    subscribers.delete(subscriber);
  };
}

export function getPwaInstallState() {
  return currentState;
}

export async function showPwaInstallPrompt() {
  if (!deferredPrompt) return false;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  installPromptPending = true;
  publish("installing");

  // Paint the progress state before the browser opens its native install UI.
  await new Promise<void>((resolve) => window.setTimeout(resolve, 75));
  await prompt.prompt();
  const choice = await prompt.userChoice;
  installPromptPending = false;

  if (choice.outcome === "dismissed") {
    installAcceptedAt = 0;
    publish("cancelled");
    return true;
  }

  // Chromium may emit `appinstalled` before `userChoice` resolves. Starting
  // the timer here keeps the progress confirmation visible after acceptance.
  installAcceptedAt = Date.now();
  publish("installing");
  publishInstalledAfterProgress();
  return true;
}

// RolePwaManager is part of the root app shell, so importing this module there
// captures the browser event before a user later navigates to Settings.
initializePwaInstall();
