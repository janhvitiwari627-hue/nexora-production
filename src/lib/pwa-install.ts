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
const subscribers = new Set<(state: InstallState) => void>();

function publish(state: InstallState) {
  currentState = state;
  subscribers.forEach((subscriber) => subscriber(state));
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
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    publish("installed");
  });
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", (event) => {
    if (event.matches) publish("installed");
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
  await prompt.prompt();
  const choice = await prompt.userChoice;
  publish(choice.outcome === "accepted" ? "installing" : "cancelled");
  return true;
}

// RolePwaManager is part of the root app shell, so importing this module there
// captures the browser event before a user later navigates to Settings.
initializePwaInstall();
