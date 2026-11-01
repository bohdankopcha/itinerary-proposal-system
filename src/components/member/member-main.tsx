import { ConciergeNote } from "@/components/member/concierge-note";
import { ItineraryExplorer } from "@/components/member/itinerary-explorer";
import { MemberHeader } from "@/components/member/member-header";
import { TripPass } from "@/components/member/trip-pass";
import { Button } from "@/components/ui/button";
import type { MemberProposalState } from "@/hooks/use-member-proposal";
import type { Proposal } from "@/lib/schemas/proposal";

export function MemberMain({
  proposal,
  member,
}: {
  proposal: Proposal;
  member: MemberProposalState;
}) {
  const collapsing = member.phase === "collapse";
  const showTrip = proposal.status !== "sent" && !collapsing;
  const showItinerary =
    proposal.status === "sent" || collapsing || member.showDetails;

  return (
    <>
      <MemberHeader
        reservation={proposal.reservation}
        status={proposal.status}
      />
      {proposal.notes && <ConciergeNote notes={proposal.notes} />}
      {showTrip && (
        <>
          <TripPass
            reservation={proposal.reservation}
            itemCount={proposal.items.length}
            totalCents={proposal.totalCents}
            paid={proposal.status === "paid"}
            stamping={member.phase === "lock"}
          />
          <Button
            variant="outline"
            className="border-input bg-card self-center rounded-xl"
            aria-expanded={member.showDetails}
            onClick={member.toggleDetails}
          >
            {member.showDetails ? "Hide day-by-day" : "View day-by-day"}
          </Button>
        </>
      )}
      {showItinerary && (
        <ItineraryExplorer
          reservation={proposal.reservation}
          items={proposal.items}
          collapsing={collapsing}
        />
      )}
    </>
  );
}
