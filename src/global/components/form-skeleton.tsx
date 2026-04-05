import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-white rounded-md p-6 border border-border space-y-4">
        <Skeleton className="h-6 w-40 mx-auto" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full bg-primary/20" />
      </div>
    </div>
  );
}
