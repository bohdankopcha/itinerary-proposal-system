"use client";

import { CommandPalette } from "@/components/concierge/command-palette";
import { ConciergeShell } from "@/components/concierge/concierge-shell";
import { ConciergeTopBar } from "@/components/concierge/concierge-top-bar";
import { DashboardSkeleton } from "@/components/concierge/dashboard-skeleton";
import { DiscardDialog } from "@/components/concierge/discard-dialog";
import { ItemSheet } from "@/components/concierge/item-sheet";
import { ItineraryView } from "@/components/concierge/itinerary-view";
import { PreviewDialog } from "@/components/concierge/preview-dialog";
import { ProposalsView } from "@/components/concierge/proposals-view";
import { SentDialog } from "@/components/concierge/sent-dialog";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useConciergeDashboard } from "@/hooks/use-concierge-dashboard";
import { STATUS_LABELS } from "@/lib/proposals/format";

export const ConciergeDashboard = () => {
  const dashboard = useConciergeDashboard();
  const { reservation } = dashboard;

  if (dashboard.reservationsQuery.isPending || dashboard.resolvingReservation) {
    return (
      <ConciergeShell>
        <DashboardSkeleton />
      </ConciergeShell>
    );
  }

  if (dashboard.reservationsQuery.isError) {
    return (
      <ConciergeShell>
        <div className="p-4 sm:p-8">
          <ErrorState
            message="Reservations could not be loaded."
            onAction={() => void dashboard.reservationsQuery.refetch()}
          />
        </div>
      </ConciergeShell>
    );
  }

  if (!reservation) {
    return (
      <ConciergeShell>
        <div className="p-4 sm:p-8">
          <EmptyState
            title="No reservations yet"
            description="Proposals are built for a member's stay. Reservations will appear here once they exist."
          />
        </div>
      </ConciergeShell>
    );
  }

  return (
    <ConciergeShell>
      <ConciergeTopBar
        view={dashboard.view}
        proposalCount={dashboard.proposalCount}
        reservations={dashboard.reservations}
        reservationId={reservation.id}
        onViewChange={dashboard.setView}
        onReservationChange={dashboard.selectReservation}
        onOpenPalette={dashboard.palette.show}
      />
      {dashboard.view === "itinerary" ? (
        <ItineraryView dashboard={dashboard} reservation={reservation} />
      ) : (
        <ProposalsView
          currentProposalId={dashboard.proposalId}
          clientName={reservation.member.name}
          onOpen={dashboard.openProposal}
          onNew={dashboard.startNewProposal}
        />
      )}

      <CommandPalette palette={dashboard.palette} />
      <ItemSheet editor={dashboard.editor} reservation={reservation} />
      <PreviewDialog
        open={dashboard.previewOpen}
        onOpenChange={dashboard.setPreviewOpen}
        reservation={reservation}
        items={dashboard.items}
        notes={dashboard.notes}
        sendLabel={
          dashboard.locked ? STATUS_LABELS[dashboard.status] : "Send to client"
        }
        canSend={dashboard.canSend}
        onSend={dashboard.actions.send}
      />
      <SentDialog
        result={dashboard.actions.sentResult}
        onClose={dashboard.actions.dismissSent}
      />
      <DiscardDialog
        open={dashboard.discard.open}
        onConfirm={dashboard.discard.confirm}
        onCancel={dashboard.discard.cancel}
      />
    </ConciergeShell>
  );
};
