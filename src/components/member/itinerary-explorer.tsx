import { DayCards } from "@/components/member/day-cards";
import { DayTimeline } from "@/components/member/day-timeline";
import { ItineraryViewToggle } from "@/components/member/itinerary-view-toggle";
import type { ExplorerItem } from "@/components/member/pass-card";
import { useItineraryExplorer } from "@/hooks/use-itinerary-explorer";
import { groupByDay } from "@/lib/proposals/itinerary";
import type { Reservation } from "@/lib/schemas/reservation";

export const ItineraryExplorer = ({
  reservation,
  items,
  collapsing = false,
}: {
  reservation: Reservation;
  items: ExplorerItem[];
  collapsing?: boolean;
}) => {
  const days = groupByDay(items, reservation);
  const explorer = useItineraryExplorer(days.length);

  return (
    <div className="flex flex-col gap-5.5">
      {!collapsing && (
        <ItineraryViewToggle mode={explorer.mode} onChange={explorer.setMode} />
      )}
      {explorer.mode === "cards" ? (
        <DayCards days={days} explorer={explorer} collapsing={collapsing} />
      ) : (
        <DayTimeline days={days} />
      )}
    </div>
  );
};
