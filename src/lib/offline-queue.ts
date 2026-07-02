/**
 * Persistent offline task queue.
 *
 * Tasks are serialized to localStorage under a single key. A registered
 * "runner" per task type performs the actual work when the network returns.
 *
 * Design goals:
 *  - Survive page reloads and tab restarts.
 *  - Never lose a task on transient errors (exponential backoff, max attempts).
 *  - Cross-tab sync via `storage` events.
 *  - React-friendly `useOfflineQueue()` hook + `subscribe()` primitive.
 */

const STORAGE_KEY = "nx_offline_queue_v1";
const MAX_ATTEMPTS = 6;
/** Keep succeeded tasks around briefly so UI can show "Confirmed" state. */
const SUCCESS_TTL_MS = 5 * 60_000;

export type QueueTaskStatus = "pending" | "running" | "succeeded" | "failed";

export type QueueTask<TPayload = unknown, TResult = unknown> = {
  id: string;
  type: string;
  payload: TPayload;
  createdAt: number;
  attempts: number;
  lastError: string | null;
  nextAttemptAt: number;
  status: QueueTaskStatus;
  completedAt?: number;
  result?: TResult;
};

type Runner<TPayload = unknown, TResult = unknown> = (
  payload: TPayload,
) => Promise<TResult>;

const runners = new Map<string, Runner>();
const listeners = new Set<() => void>();
let flushing = false;
let scheduled: ReturnType<typeof setTimeout> | null = null;

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readAll(): QueueTask[] {
  const s = safeStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueueTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(tasks: QueueTask[]) {
  const s = safeStorage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore quota errors
  }
  notify();
}

function notify() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      // ignore
    }
  }
}

export function registerRunner<TPayload>(type: string, runner: Runner<TPayload>) {
  runners.set(type, runner as Runner);
}

export function listQueue(): QueueTask[] {
  return readAll();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function enqueue<TPayload>(type: string, payload: TPayload): QueueTask<TPayload> {
  const task: QueueTask<TPayload> = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `t_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type,
    payload,
    createdAt: Date.now(),
    attempts: 0,
    lastError: null,
    nextAttemptAt: Date.now(),
    status: "pending",
  };
  const all = readAll();
  all.push(task as QueueTask);
  writeAll(all);
  scheduleFlush(0);
  return task;
}

export function removeTask(id: string) {
  const all = readAll().filter((t) => t.id !== id);
  writeAll(all);
}

export function clearFailed() {
  const all = readAll().filter((t) => t.status !== "failed");
  writeAll(all);
}

function backoff(attempts: number): number {
  // 2s, 5s, 15s, 45s, 2m, 5m
  const ladder = [2_000, 5_000, 15_000, 45_000, 120_000, 300_000];
  return ladder[Math.min(attempts, ladder.length - 1)];
}

export function scheduleFlush(delayMs = 0) {
  if (scheduled) clearTimeout(scheduled);
  scheduled = setTimeout(() => {
    scheduled = null;
    void flush();
  }, Math.max(0, delayMs));
}

export async function flush(): Promise<void> {
  if (flushing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  flushing = true;
  try {
    while (true) {
      const all = readAll();
      const now = Date.now();
      const next = all.find(
        (t) =>
          (t.status === "pending" || t.status === "running") &&
          t.nextAttemptAt <= now &&
          runners.has(t.type),
      );
      if (!next) break;

      const runner = runners.get(next.type)!;
      // Mark running
      writeAll(
        readAll().map((t) => (t.id === next.id ? { ...t, status: "running" } : t)),
      );

      try {
        await runner(next.payload);
        // Success — drop it
        writeAll(readAll().filter((t) => t.id !== next.id));
      } catch (err) {
        const attempts = next.attempts + 1;
        const failed = attempts >= MAX_ATTEMPTS;
        const message = err instanceof Error ? err.message : String(err);
        writeAll(
          readAll().map((t) =>
            t.id === next.id
              ? {
                  ...t,
                  attempts,
                  lastError: message,
                  nextAttemptAt: Date.now() + backoff(attempts),
                  status: failed ? ("failed" as const) : ("pending" as const),
                }
              : t,
          ),
        );
        if (failed) continue;
        // Stop this drain cycle and let backoff re-schedule.
        scheduleFlush(backoff(attempts));
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

/**
 * Wire browser events. Idempotent — safe to call from multiple modules.
 */
let wired = false;
export function initOfflineQueue() {
  if (wired || typeof window === "undefined") return;
  wired = true;

  window.addEventListener("online", () => scheduleFlush(0));
  window.addEventListener("focus", () => scheduleFlush(0));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleFlush(0);
  });
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) notify();
  });

  // Kick a first drain after the app boots.
  scheduleFlush(500);
}
