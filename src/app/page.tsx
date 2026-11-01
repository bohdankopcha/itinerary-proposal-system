import { Suspense } from "react";

import { ConciergeDashboard } from "@/components/concierge/concierge-dashboard";
import { ConciergeShell } from "@/components/concierge/concierge-shell";
import { DashboardSkeleton } from "@/components/concierge/dashboard-skeleton";

export default function Home() {
  return (
    <Suspense
      fallback={
        <ConciergeShell>
          <DashboardSkeleton />
        </ConciergeShell>
      }
    >
      <ConciergeDashboard />
    </Suspense>
  );
}
