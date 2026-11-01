import { CATEGORY_STYLES } from "@/components/category-styles";
import { PlannerResizeHandle } from "@/components/concierge/planner-resize-handle";
import type { PlannerDrag } from "@/hooks/use-planner-drag";
import type { PlannerResize } from "@/hooks/use-planner-resize";
import { blockLayout } from "@/lib/proposals/calendar";
import { CATEGORIES } from "@/lib/proposals/categories";
import type { DraftItem } from "@/lib/proposals/draft";
import { formatDayLong, formatMoney, formatTime } from "@/lib/proposals/format";
import type { SpanSlot } from "@/lib/proposals/overlap-layout";
import { dateOf } from "@/lib/proposals/trip-days";
import { cn } from "@/lib/utils";

const BLOCK_INSET = 4;

export const PlannerBlock = ({
  item,
  slot,
  highlighted,
  locked,
  drag,
  resize,
  onOpen,
}: {
  item: DraftItem;
  slot: SpanSlot;
  highlighted: boolean;
  locked: boolean;
  drag: PlannerDrag;
  resize: PlannerResize;
  onOpen: () => void;
}) => {
  const category = CATEGORIES[item.category];
  const styles = CATEGORY_STYLES[item.category];
  const { startMinutes, durationMinutes } = resize.rangeFor(item);
  const { top, height } = blockLayout(startMinutes, durationMinutes);
  const time = formatTime(startMinutes);
  const end = formatTime(startMinutes + durationMinutes);
  const price = formatMoney(item.priceCents);
  const resizing = resize.resizingKey === item.key;
  const width = 100 / slot.columns;

  return (
    <div
      draggable={!locked && !resizing}
      onDragStart={(event) => drag.start(item, event)}
      onDragEnd={drag.end}
      style={{
        top,
        height,
        left: `calc(${slot.column * width}% + ${BLOCK_INSET}px)`,
        width: `calc(${width}% - ${BLOCK_INSET * 2}px)`,
      }}
      className={cn(
        "group/block absolute hover:z-20",
        !resizing && "transition-[top,height,left,width] duration-150",
        !locked && "cursor-grab active:cursor-grabbing",
        (drag.draggingKey === item.key || resizing) && "z-20",
        drag.draggingKey === item.key && "opacity-35",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${item.title}, ${category.label}, ${formatDayLong(dateOf(item.scheduledAt))} at ${time}, ${price}`}
        className={cn(
          "focus-visible:ring-ring group-hover/block:ring-foreground/20 flex size-full flex-col gap-0.5 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover/block:-translate-y-0.5 group-hover/block:shadow-lg group-hover/block:ring-1 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:group-hover/block:translate-y-0",
          styles.block,
          resizing && "ring-foreground/30 shadow-lg ring-1",
          highlighted && "ring-ring shadow-lg ring-2",
        )}
      >
        <span className="truncate text-sm leading-tight font-semibold tracking-tight">
          {item.title}
        </span>
        <span className="text-muted-foreground truncate text-xs tabular-nums">
          {time} - {end}
        </span>

        {height > 60 && slot.columns === 1 && (
          <span className="text-muted-foreground truncate text-xs tabular-nums">
            {price}
          </span>
        )}
      </button>
      {!locked && (
        <>
          <PlannerResizeHandle item={item} edge="top" resize={resize} />
          <PlannerResizeHandle item={item} edge="bottom" resize={resize} />
        </>
      )}
    </div>
  );
};
