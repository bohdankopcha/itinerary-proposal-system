import { ErrorState } from "@/components/error-state";
import { Panel } from "@/components/panel";
import { ProposalPanel } from "@/components/concierge/proposal-panel";
import { TripHeader } from "@/components/concierge/trip-header";
import { WeekPlanner } from "@/components/concierge/week-planner";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConciergeDashboardState } from "@/hooks/use-concierge-dashboard";
import type { Reservation } from "@/lib/schemas/reservation";

export const ItineraryView = ({
  dashboard,
  reservation,
}: {
  dashboard: ConciergeDashboardState;
  reservation: Reservation;
}) => {
  if (dashboard.proposalFailed) {
    return (
      <div className="p-4 sm:p-8">
        <ErrorState
          title="Proposal not available"
          message="This proposal could not be loaded. It may have been removed."
          actionLabel="Start a new proposal"
          onAction={dashboard.startNewProposal}
        />
      </div>
    );
  }

  return (
    <>
      <TripHeader reservation={reservation} />
      <div className="flex flex-col gap-5 px-4 pb-6 sm:px-8 lg:min-h-0 lg:flex-1 lg:flex-row">
        {dashboard.proposalLoading ? (
          <>
            <Panel
              role="status"
              aria-label="Loading proposal"
              className="h-160 flex-1 p-4 lg:h-auto"
            >
              <Skeleton className="size-full" />
            </Panel>
            <Panel className="h-96 p-5 lg:h-auto lg:w-85">
              <Skeleton className="size-full" />
            </Panel>
          </>
        ) : (
          <>
            <div className="flex h-160 min-w-0 flex-col lg:h-auto lg:flex-1">
              <WeekPlanner
                reservation={reservation}
                items={dashboard.items}
                locked={dashboard.locked}
                page={dashboard.page}
                flashKey={dashboard.editor.flashKey}
                drag={dashboard.drag}
                resize={dashboard.resize}
                onPageChange={dashboard.setPage}
                onAdd={dashboard.editor.openNew}
                onOpenItem={dashboard.editor.openItem}
              />
            </div>
            <div className="flex lg:w-85 lg:shrink-0">
              <ProposalPanel
                reservation={reservation}
                proposal={dashboard.proposal}
                proposalId={dashboard.proposalId}
                status={dashboard.status}
                items={dashboard.items}
                notes={dashboard.notes}
                actions={dashboard.actions}
                onNotesChange={dashboard.builder.setNotes}
                onPreview={() => dashboard.setPreviewOpen(true)}
                dirty={dashboard.builder.dirty}
                onDiscard={dashboard.requestDiscard}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};
