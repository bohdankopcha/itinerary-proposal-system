import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

export const MemberSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading your itinerary"
      className="flex flex-col gap-5.5"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Panel className="h-20 rounded-3xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-49 w-full rounded-3xl" />
    </div>
  );
};
