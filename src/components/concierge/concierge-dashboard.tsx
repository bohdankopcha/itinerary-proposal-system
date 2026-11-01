"use client";

import { CommandPalette } from "@/components/concierge/command-palette";
import { CategoryPickerDialog } from "@/components/concierge/category-picker-dialog";
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

export function ConciergeDashboard() {
  const d = useConciergeDashboard();
  const { reservation } = d;

  if (d.reservationsQuery.isPending) {
    return (
      <ConciergeShell>
        <DashboardSkeleton />
      </ConciergeShell>
    );
  }

  if (d.reservationsQuery.isError) {
    return (
      <ConciergeShell>
        <div className="p-4 sm:p-8">
          <ErrorState
            message="Reservations could not be loaded."
            onAction={() => void d.reservationsQuery.refetch()}
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
        view={d.view}
        proposalCount={d.proposalCount}
        reservations={d.reservations}
        reservationId={reservation.id}
        onViewChange={d.setView}
        onReservationChange={d.selectReservation}
        onOpenPalette={d.palette.show}
      />
      {d.view === "itinerary" ? (
        <ItineraryView dashboard={d} reservation={reservation} />
      ) : (
        <ProposalsView
          currentProposalId={d.proposalId}
          clientName={reservation.member.name}
          onOpen={d.openProposal}
          onNew={d.startNewProposal}
        />
      )}

      <CommandPalette palette={d.palette} />
      <CategoryPickerDialog editor={d.editor} />
      <ItemSheet editor={d.editor} reservation={reservation} />
      <PreviewDialog
        open={d.previewOpen}
        onOpenChange={d.setPreviewOpen}
        reservation={reservation}
        items={d.items}
        notes={d.notes}
        sendLabel={d.locked ? STATUS_LABELS[d.status] : "Send to client"}
        canSend={d.canSend}
        onSend={d.actions.send}
      />
      <SentDialog
        result={d.actions.sentResult}
        onClose={d.actions.dismissSent}
      />
      <DiscardDialog
        open={d.discard.open}
        onConfirm={d.discard.confirm}
        onCancel={d.discard.cancel}
      />
    </ConciergeShell>
  );
}
