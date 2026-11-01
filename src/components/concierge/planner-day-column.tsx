import { PlannerBlock } from "@/components/concierge/planner-block";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";

import type { PlannerDrag } from "@/hooks/use-planner-drag";
import type { PlannerResize } from "@/hooks/use-planner-resize";
import {
  CALENDAR_HOURS,
  MIN_VISUAL_MINUTES,
  blockLayout,
  flightTop,
  minutesAtOffset,
  type FlightKind,
} from "@/lib/proposals/calendar";
import { layoutOverlaps } from "@/lib/proposals/overlap-layout";
import type { DraftItem } from "@/lib/proposals/draft";
import { formatTime } from "@/lib/proposals/format";
import { cn } from "@/lib/utils";

export const PlannerDayColumn = ({
  date,
  items,
  flight,
  locked,
  flashKey,
  drag,
  resize,
  onAdd,
  onOpenItem,
}: {
  date: string;
  items: DraftItem[];
  flight: { kind: FlightKind; minutes: number } | null;
  locked: boolean;
  flashKey: string | null;
  drag: PlannerDrag;
  resize: PlannerResize;
  onAdd: (date: string, minutes: number | null) => void;
  onOpenItem: (item: DraftItem) => void;
}) => {
  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (locked || (event.target as HTMLElement).closest("button")) return;
    const top = event.currentTarget.getBoundingClientRect().top;
    onAdd(date, minutesAtOffset(event.clientY - top));
  };

  const slots = layoutOverlaps(
    items.map((item) => {
      const { startMinutes, durationMinutes } = resize.rangeFor(item);
      return {
        key: item.key,
        startMinutes,
        endMinutes:
          startMinutes + Math.max(durationMinutes, MIN_VISUAL_MINUTES),
      };
    }),
  );

  const ghost = drag.over?.date === date ? drag.over : null;
  const ghostLayout = ghost
    ? blockLayout(ghost.startMinutes, ghost.durationMinutes)
    : null;

  return (
    <div
      className={cn("relative border-l", ghost && "bg-accent")}
      onDoubleClick={handleDoubleClick}
      onDragOver={(event) => drag.overDay(date, event)}
      onDrop={(event) => drag.dropOnDay(date, event)}
    >
      {CALENDAR_HOURS.map((hour) => (
        <div key={hour} aria-hidden className="h-12 border-b" />
      ))}
      {items.length === 0 && !ghost && (
        <div className="absolute inset-x-2 top-52 flex flex-col items-center gap-2.5 text-center">
          <span className="text-sm font-semibold">Open day</span>
          {!locked && (
            <Button variant="outline" onClick={() => onAdd(date, null)}>
              + Add
            </Button>
          )}
        </div>
      )}
      {flight && (
        <div
          aria-hidden
          style={{ top: flightTop(flight.minutes) }}
          className="bg-foreground pointer-events-none absolute inset-x-0 z-10 h-px"
        >
          <span className="bg-foreground text-background absolute top-0 left-2 inline-flex h-5 -translate-y-1/2 items-center gap-1 rounded-full px-2 text-xs font-semibold whitespace-nowrap">
            <Plane aria-hidden className="size-3" />
            {flight.kind === "arrival" ? "Lands" : "Departs"}{" "}
            {formatTime(flight.minutes)}
          </span>
        </div>
      )}
      {items.map((item) => (
        <PlannerBlock
          key={item.key}
          item={item}
          slot={slots.find((slot) => slot.key === item.key) ?? FULL_WIDTH}
          highlighted={flashKey === item.key}
          locked={locked}
          drag={drag}
          resize={resize}
          onOpen={() => onOpenItem(item)}
        />
      ))}
      {ghost && ghostLayout && (
        <div
          aria-hidden
          style={ghostLayout}
          className="border-primary bg-accent pointer-events-none absolute inset-x-1 rounded-lg border-2 border-dashed px-2 py-1.5 text-xs font-medium"
        >
          {formatTime(ghost.startMinutes)}
        </div>
      )}
    </div>
  );
};

const FULL_WIDTH = { key: "", column: 0, columns: 1 };
