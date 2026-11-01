import { DayChips } from "@/components/member/day-chips";
import { PassCard, type ExplorerItem } from "@/components/member/pass-card";
import { Button } from "@/components/ui/button";
import type { ItineraryExplorerState } from "@/hooks/use-itinerary-explorer";
import { formatDayFull, formatMoney } from "@/lib/proposals/format";
import type { ItineraryDay } from "@/lib/proposals/itinerary";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STACK_OVERLAP = -28;
const OPEN_GAP = 12;

export const daySummary = (day: ItineraryDay<ExplorerItem>) => {
  const count = day.items.length;
  return count
    ? `${count} ${count === 1 ? "experience" : "experiences"} · ${formatMoney(day.subtotalCents)}`
    : "Open day";
};

export const DayCards = ({
  days,
  explorer,
  collapsing,
}: {
  days: ItineraryDay<ExplorerItem>[];
  explorer: ItineraryExplorerState;
  collapsing: boolean;
}) => {
  const current = days[explorer.day];
  if (!current) return null;
  const items = current.items;

  return (
    <>
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="icon"
          className="border-input bg-card rounded-2xl"
          aria-label="Previous day"
          disabled={explorer.atFirst}
          onClick={explorer.prev}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <div aria-live="polite" className="min-w-0 flex-1 text-center">
          <div className="text-xl leading-tight font-semibold tracking-tight">
            {formatDayFull(current.date)}
          </div>
          <div className="text-muted-foreground text-sm">
            Day {current.index + 1} of {days.length} · {daySummary(current)}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="border-input bg-card rounded-2xl"
          aria-label="Next day"
          disabled={explorer.atLast}
          onClick={explorer.next}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <DayChips days={days} current={explorer.day} onPick={explorer.goTo} />

      <div
        key={explorer.day}
        onPointerDown={explorer.onPointerDown}
        onPointerUp={explorer.onPointerUp}
        className={cn(
          "relative flex min-h-55 touch-pan-y flex-col pt-0.5",
          explorer.direction === "right"
            ? "animate-from-right"
            : "animate-from-left",
        )}
      >
        {items.length === 0 && (
          <div className="border-input bg-card text-muted-foreground animate-pass-in flex min-h-49 flex-col items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed p-6 text-center">
            <b className="text-foreground text-lg tracking-tight">Open day</b>
            <span>Nothing scheduled. Time is yours.</span>
          </div>
        )}
        {items.map((item, index) => (
          <PassCard
            key={`${item.scheduledAt}-${item.title}`}
            item={item}
            open={explorer.openCard === index}
            offset={
              index === 0
                ? 0
                : explorer.openCard === index - 1
                  ? OPEN_GAP
                  : STACK_OVERLAP
            }
            layer={index + 1}
            delay={collapsing ? (items.length - index) * 60 : index * 60}
            collapsing={collapsing}
            onToggle={() => explorer.toggleCard(index)}
          />
        ))}
      </div>
    </>
  );
};
