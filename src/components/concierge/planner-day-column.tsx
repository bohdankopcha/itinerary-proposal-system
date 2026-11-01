import { PlannerBlock } from "@/components/concierge/planner-block";
import { Button } from "@/components/ui/button";
import type { PlannerDrag } from "@/hooks/use-planner-drag";
import {
  CALENDAR_HOURS,
  blockLayout,
  minutesAtOffset,
} from "@/lib/proposals/calendar";
import type { DraftItem } from "@/lib/proposals/draft";
import { formatTime } from "@/lib/proposals/format";
import { cn } from "@/lib/utils";

export function PlannerDayColumn({
  date,
  items,
  locked,
  flashKey,
  drag,
  onAdd,
  onOpenItem,
}: {
  date: string;
  items: DraftItem[];
  locked: boolean;
  flashKey: string | null;
  drag: PlannerDrag;
  onAdd: (date: string, minutes: number | null) => void;
  onOpenItem: (item: DraftItem) => void;
}) {
  function handleDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (locked || (event.target as HTMLElement).closest("button")) return;
    const top = event.currentTarget.getBoundingClientRect().top;
    onAdd(date, minutesAtOffset(event.clientY - top));
  }

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
      {items.map((item) => (
        <PlannerBlock
          key={item.key}
          item={item}
          highlighted={flashKey === item.key}
          locked={locked}
          drag={drag}
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
}
