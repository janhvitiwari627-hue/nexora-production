import { useSyncExternalStore } from "react";
import { listQueue, subscribe, type QueueTask } from "./offline-queue";

export function useOfflineQueue(): QueueTask[] {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => listQueue(),
    () => [] as QueueTask[],
  );
}

export function useQueueCountByType(type?: string): number {
  const q = useOfflineQueue();
  return type ? q.filter((t) => t.type === type).length : q.length;
}
