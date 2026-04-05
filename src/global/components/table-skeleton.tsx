import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-48 mb-6" />
      <div className="bg-white rounded-lg overflow-hidden border border-border">
        <div className="bg-brand-dark h-10" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-t border-border"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
