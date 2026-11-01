import { dateParts } from "@/lib/proposals/format";
import { cn } from "@/lib/utils";

export function PlannerDayHeader({
  date,
  tag,
  empty,
}: {
  date: string;
  tag: string | null;
  empty: boolean;
}) {
  const { weekday, day, month } = dateParts(date);
  return (
    <div className="bg-popover sticky top-0 z-30 flex min-w-0 flex-col gap-1 border-b border-l px-3 py-2.5">
      <div className="flex min-h-5 items-center justify-between gap-1.5">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {weekday}
        </span>
        {tag && (
          <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
            {tag}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-2xl leading-none font-medium tracking-tighter tabular-nums",
            empty && "text-muted-foreground",
          )}
        >
          {day}
        </span>
        <span className="text-muted-foreground text-sm font-medium">
          {month}
        </span>
      </div>
    </div>
  );
}
