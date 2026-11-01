import { daySummary } from "@/components/member/day-cards";
import type { ExplorerItem } from "@/components/member/pass-card";
import { PASS_COLORS } from "@/components/member/pass-styles";
import { Panel } from "@/components/panel";
import { CATEGORIES } from "@/lib/proposals/categories";
import { dateParts, formatMoney, formatTime } from "@/lib/proposals/format";
import type { ItineraryDay } from "@/lib/proposals/itinerary";
import { minutesOf } from "@/lib/proposals/trip-days";
import { cn } from "@/lib/utils";

export function TimelineDay({
  day,
  delay,
}: {
  day: ItineraryDay<ExplorerItem>;
  delay: number;
}) {
  const { day: number, weekdayLong, monthLong } = dateParts(day.date);

  return (
    <li>
      <Panel
        className="motion-safe:animate-rise rounded-2xl px-4.5 py-4"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="mb-1.5 flex items-center gap-3.5">
          <span className="min-w-11 text-3xl leading-none font-medium tracking-tighter tabular-nums">
            {number}
          </span>
          <div>
            <div className="font-semibold tracking-tight">
              {weekdayLong}, {monthLong} {number}
            </div>
            <div className="text-muted-foreground text-sm">
              Day {day.index + 1} · {daySummary(day)}
            </div>
          </div>
        </div>
        {day.items.length === 0 && (
          <div className="text-muted-foreground border-t pt-2.5 text-sm">
            Open day. Nothing scheduled.
          </div>
        )}
        <ul>
          {day.items.map((item, index) => {
            const category = CATEGORIES[item.category];
            const start = minutesOf(item.scheduledAt);
            return (
              <li
                key={`${item.scheduledAt}-${index}`}
                className="flex items-baseline gap-2.5 border-t py-2.5"
              >
                <span className="text-muted-foreground w-21 shrink-0 text-sm tabular-nums">
                  {formatTime(start)}
                  <span className="block text-xs opacity-85">
                    until {formatTime(start + category.durationMinutes)}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 shrink-0 self-center rounded-full",
                    PASS_COLORS[item.category],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium tracking-tight">{item.title}</div>
                  <div className="text-muted-foreground text-sm">
                    {category.label}
                  </div>
                </div>
                <span className="text-sm tabular-nums">
                  {formatMoney(item.priceCents)}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </li>
  );
}
