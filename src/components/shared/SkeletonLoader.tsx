import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("bg-muted animate-pulse rounded-md", className)} />;
}

export function ShopCardSkeleton() {
  return (
    <div className="bg-card rounded-[var(--radius-card)] p-2">
      <Shimmer className="aspect-[3/2] w-full rounded-[var(--radius-card)]" />
      <div className="space-y-2 pt-3">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
        <Shimmer className="h-3 w-2/3" />
        <Shimmer className="mt-2 h-9 w-full rounded-[var(--radius-button)]" />
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-card border-border space-y-3 rounded-[var(--radius-card)] border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-1/2" />
          <Shimmer className="h-3 w-3/4" />
          <Shimmer className="h-5 w-20 rounded-full" />
        </div>
        <Shimmer className="h-6 w-14" />
      </div>
      <Shimmer className="h-9 w-full rounded-[var(--radius-button)]" />
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-card border-border rounded-[var(--radius-card)] border p-5">
      <div className="flex gap-3">
        <Shimmer className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-1/3" />
          <Shimmer className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export function StaffCardSkeleton() {
  return (
    <div className="bg-card border-border flex flex-col items-center gap-3 rounded-[var(--radius-card)] border p-4">
      <Shimmer className="h-20 w-20 rounded-full" />
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Shimmer className="h-5 w-14 rounded-full" />
        <Shimmer className="h-5 w-12 rounded-full" />
      </div>
      <Shimmer className="h-9 w-full rounded-[var(--radius-button)]" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border-border space-y-3 rounded-[var(--radius-card)] border p-5">
      <Shimmer className="h-3 w-24" />
      <Shimmer className="h-8 w-32" />
      <Shimmer className="h-3 w-20" />
    </div>
  );
}
