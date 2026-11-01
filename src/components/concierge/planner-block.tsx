import { CATEGORY_STYLES } from "@/components/category-styles";
import type { PlannerDrag } from "@/hooks/use-planner-drag";
import { blockLayout } from "@/lib/proposals/calendar";
import { CATEGORIES } from "@/lib/proposals/categories";
import type { DraftItem } from "@/lib/proposals/draft";
import { formatDayLong, formatMoney, formatTime } from "@/lib/proposals/format";
import { dateOf, minutesOf } from "@/lib/proposals/trip-days";
import { cn } from "@/lib/utils";

export function PlannerBlock({
  item,
  highlighted,
  locked,
  drag,
  onOpen,
}: {
  item: DraftItem;
  highlighted: boolean;
  locked: boolean;
  drag: PlannerDrag;
  onOpen: () => void;
}) {
  const category = CATEGORIES[item.category];
  const styles = CATEGORY_STYLES[item.category];
  const start = minutesOf(item.scheduledAt);
  const { top, height } = blockLayout(start, category.durationMinutes);
  const time = formatTime(start);
  const price = formatMoney(item.priceCents);

  return (
    <div
      draggable={!locked}
      onDragStart={(event) => drag.start(item, event)}
      onDragEnd={drag.end}
      style={{ top, height }}
      className={cn(
        "absolute inset-x-1 transition duration-200 hover:-translate-y-px",
        !locked && "cursor-grab active:cursor-grabbing",
        drag.draggingKey === item.key && "opacity-35",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${item.title}, ${category.label}, ${formatDayLong(dateOf(item.scheduledAt))} at ${time}, ${price}`}
        className={cn(
          "focus-visible:ring-ring flex size-full flex-col gap-0.5 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none",
          styles.block,
          highlighted && "ring-ring shadow-lg ring-2",
        )}
      >
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-full", styles.dot)}
          />
          {category.label}
        </span>
        <span className="truncate text-sm leading-tight font-semibold tracking-tight">
          {item.title}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {time}
          {height > 60 && ` · ${price}`}
        </span>
      </button>
    </div>
  );
}
