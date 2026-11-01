import type { ExplorerItem } from "@/components/member/pass-card";
import { TimelineDay } from "@/components/member/timeline-day";
import type { ItineraryDay } from "@/lib/proposals/itinerary";

export const DayTimeline = ({
  days,
}: {
  days: ItineraryDay<ExplorerItem>[];
}) => {
  return (
    <ol className="flex flex-col gap-1.5">
      {days.map((day) => (
        <TimelineDay key={day.date} day={day} delay={day.index * 50} />
      ))}
    </ol>
  );
};
