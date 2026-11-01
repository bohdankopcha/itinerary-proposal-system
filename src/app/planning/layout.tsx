import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { ConciergeDashboard } from "@/components/concierge/concierge-dashboard";
import { ConciergeShell } from "@/components/concierge/concierge-shell";
import { DashboardSkeleton } from "@/components/concierge/dashboard-skeleton";

export const metadata: Metadata = { title: "Planning · Detour" };

const PlanningLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Suspense
      fallback={
        <ConciergeShell>
          <DashboardSkeleton />
        </ConciergeShell>
      }
    >
      <ConciergeDashboard />
    </Suspense>
    {children}
  </>
);

export default PlanningLayout;
