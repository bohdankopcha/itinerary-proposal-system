import { Eyebrow } from "@/components/eyebrow";
import { ConciergeNote } from "@/components/member/concierge-note";
import { ItineraryExplorer } from "@/components/member/itinerary-explorer";
import { MemberHeader } from "@/components/member/member-header";
import type { ExplorerItem } from "@/components/member/pass-card";
import { formatMoney } from "@/lib/proposals/format";
import { totalCents } from "@/lib/proposals/totals";
import type { Reservation } from "@/lib/schemas/reservation";

export const ProposalPresentation = ({
  reservation,
  notes,
  items,
}: {
  reservation: Reservation;
  notes: string;
  items: ExplorerItem[];
}) => {
  return (
    <div className="bg-background flex flex-col gap-5.5 rounded-3xl border p-4 sm:p-6">
      <MemberHeader reservation={reservation} status="sent" />
      {notes.trim() && <ConciergeNote notes={notes} />}
      <ItineraryExplorer reservation={reservation} items={items} />
      <div className="border-input flex items-baseline justify-between border-t pt-4">
        <Eyebrow>Estimated total</Eyebrow>
        <span className="text-4xl font-medium tracking-tighter tabular-nums">
          {formatMoney(totalCents(items))}
        </span>
      </div>
    </div>
  );
};
