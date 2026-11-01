import { useMemo } from "react";

import { PlannerDayColumn } from "@/components/concierge/planner-day-column";
import { PlannerDayHeader } from "@/components/concierge/planner-day-header";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import {
  CALENDAR_HOURS,
  DAYS_PER_PAGE,
  flightForDay,
  pageCount,
} from "@/lib/proposals/calendar";
import type { PlannerDrag } from "@/hooks/use-planner-drag";
import type { PlannerResize } from "@/hooks/use-planner-resize";
import type { DraftItem } from "@/lib/proposals/draft";
import { formatDayShort, formatHourLabel } from "@/lib/proposals/format";
import { groupByDay } from "@/lib/proposals/itinerary";
import type { Reservation } from "@/lib/schemas/reservation";
import { ChevronLeft, ChevronRight, Lock, Plus } from "lucide-react";

export const WeekPlanner = ({
  reservation,
  items,
  locked,
  page,
  flashKey,
  drag,
  resize,
  onPageChange,
  onAdd,
  onOpenItem,
}: {
  reservation: Reservation;
  items: DraftItem[];
  locked: boolean;
  page: number;
  flashKey: string | null;
  drag: PlannerDrag;
  resize: PlannerResize;
  onPageChange: (page: number) => void;
  onAdd: (date?: string, minutes?: number | null) => void;
  onOpenItem: (item: DraftItem) => void;
}) => {
  const days = useMemo(
    () => groupByDay(items, reservation),
    [items, reservation],
  );
  const pages = pageCount(days.length);
  const currentPage = Math.min(page, pages - 1);
  const visible = days.slice(
    currentPage * DAYS_PER_PAGE,
    (currentPage + 1) * DAYS_PER_PAGE,
  );
  const first = visible[0];
  const last = visible.at(-1);
  const pageLabel =
    first && last
      ? `${formatDayShort(first.date)} – ${formatDayShort(last.date)}`
      : "";

  return (
    <Panel
      as="section"
      aria-label="Week planner"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-3.5 border-b p-3">
        <Button onClick={() => onAdd()} disabled={locked}>
          <Plus aria-hidden />
          Add item
        </Button>
        {pages > 1 && (
          <div
            role="group"
            aria-label="Week"
            className="border-input flex items-center gap-0.5 rounded-xl border px-0.5"
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous week"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <span
              aria-live="polite"
              className="min-w-28 text-center text-sm font-medium tabular-nums"
            >
              {pageLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next week"
              disabled={currentPage >= pages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        )}
        <div className="text-muted-foreground ml-auto flex items-center gap-2 text-sm">
          {locked && (
            <span className="bg-muted text-foreground inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium">
              <Lock aria-hidden className="size-3" />
              Read only
            </span>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className="grid min-w-4xl"
          style={{
            gridTemplateColumns: `3.5rem repeat(${visible.length}, minmax(7.5rem, 1fr))`,
          }}
        >
          <div className="bg-popover sticky top-0 left-0 z-40 border-b" />
          {visible.map((day) => (
            <PlannerDayHeader
              key={day.date}
              date={day.date}
              tag={
                day.index === 0
                  ? "Arrive"
                  : day.index === days.length - 1
                    ? "Depart"
                    : null
              }
              empty={day.items.length === 0}
            />
          ))}
          <div className="bg-popover sticky left-0 z-20 flex flex-col">
            {CALENDAR_HOURS.map((hour, index) => (
              <div
                key={hour}
                className={
                  index === 0
                    ? "invisible h-12"
                    : "text-muted-foreground h-12 -translate-y-2 pr-2 text-right text-xs whitespace-nowrap"
                }
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>
          {visible.map((day) => (
            <PlannerDayColumn
              key={day.date}
              date={day.date}
              items={day.items}
              flight={flightForDay(reservation, day.index, days.length)}
              locked={locked}
              flashKey={flashKey}
              drag={drag}
              resize={resize}
              onAdd={onAdd}
              onOpenItem={onOpenItem}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
};
