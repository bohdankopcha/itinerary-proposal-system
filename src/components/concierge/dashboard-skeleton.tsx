import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="flex flex-1 flex-col"
    >
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-8">
        <Skeleton className="h-11 w-64 rounded-xl" />
        <Skeleton className="ml-auto h-11 w-72 rounded-xl" />
      </div>
      <div className="flex flex-col gap-3 px-4 pt-2.5 pb-5 sm:px-8">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex flex-col gap-5 px-4 pb-6 sm:px-8 lg:flex-row">
        <Panel className="h-96 flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </Panel>
        <Panel className="h-96 p-5 lg:w-85">
          <Skeleton className="h-full w-full" />
        </Panel>
      </div>
    </div>
  );
}
