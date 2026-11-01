import { ErrorState } from "@/components/error-state";
import { Panel } from "@/components/panel";
import { ProposalPanel } from "@/components/concierge/proposal-panel";
import { TripHeader } from "@/components/concierge/trip-header";
import { WeekPlanner } from "@/components/concierge/week-planner";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConciergeDashboardState } from "@/hooks/use-concierge-dashboard";
import type { Reservation } from "@/lib/schemas/reservation";

export function ItineraryView({
  dashboard: d,
  reservation,
}: {
  dashboard: ConciergeDashboardState;
  reservation: Reservation;
}) {
  if (d.proposalFailed) {
    return (
      <div className="p-4 sm:p-8">
        <ErrorState
          title="Proposal not available"
          message="This proposal could not be loaded. It may have been removed."
          actionLabel="Start a new proposal"
          onAction={d.startNewProposal}
        />
      </div>
    );
  }

  return (
    <>
      <TripHeader reservation={reservation} />
      <div className="flex flex-col gap-5 px-4 pb-6 sm:px-8 lg:min-h-0 lg:flex-1 lg:flex-row">
        {d.proposalLoading ? (
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
                items={d.items}
                locked={d.locked}
                page={d.page}
                flashKey={d.editor.flashKey}
                drag={d.drag}
                resize={d.resize}
                onPageChange={d.setPage}
                onAdd={d.editor.openNew}
                onOpenItem={d.editor.openItem}
              />
            </div>
            <div className="flex lg:w-85 lg:shrink-0">
              <ProposalPanel
                reservation={reservation}
                proposal={d.proposal}
                proposalId={d.proposalId}
                status={d.status}
                items={d.items}
                notes={d.notes}
                actions={d.actions}
                onNotesChange={d.builder.setNotes}
                onPreview={() => d.setPreviewOpen(true)}
                dirty={d.builder.dirty}
                onDiscard={d.requestDiscard}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
