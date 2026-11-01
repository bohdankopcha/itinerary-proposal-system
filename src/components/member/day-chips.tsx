import { dateParts } from "@/lib/proposals/format";
import type { ItineraryDay } from "@/lib/proposals/itinerary";
import { cn } from "@/lib/utils";

export const DayChips = ({
  days,
  current,
  onPick,
}: {
  days: ItineraryDay<unknown>[];
  current: number;
  onPick: (index: number) => void;
}) => {
  return (
    <div
      role="group"
      aria-label="Days"
      className="flex gap-1 overflow-x-auto pb-0.5"
    >
      {days.map((day) => {
        const {
          weekday,
          day: number,
          month,
          weekdayLong,
        } = dateParts(day.date);
        const count = day.items.length;
        const active = day.index === current;
        return (
          <button
            key={day.date}
            type="button"
            aria-pressed={active}
            aria-label={`${weekdayLong} ${month} ${number}, ${count ? `${count} ${count === 1 ? "experience" : "experiences"}` : "open day"}`}
            onClick={() => onPick(day.index)}
            className={cn(
              "focus-visible:ring-ring flex min-h-14.5 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-transparent transition-colors duration-300 focus-visible:ring-2 focus-visible:outline-none",
              active && "border-input bg-card shadow-md",
            )}
          >
            <span className="text-muted-foreground text-xs tracking-wider uppercase">
              {weekday}
            </span>
            <span className="text-lg font-medium tracking-tight tabular-nums">
              {number}
            </span>
            <span
              aria-hidden
              className={cn(
                "bg-foreground/55 size-1 rounded-full",
                !count && "opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
