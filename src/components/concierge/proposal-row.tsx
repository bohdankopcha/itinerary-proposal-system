import { PROPOSALS_GRID_STYLE } from "@/components/concierge/proposals-grid";
import { StatusBadge } from "@/components/status-badge";
import type { ProposalRow as Row } from "@/hooks/use-proposal-rows";
import { formatMoney, formatRange } from "@/lib/proposals/format";
import { cn } from "@/lib/utils";

export function ProposalRow({
  row,
  current,
  index,
  onOpen,
}: {
  row: Row;
  current: boolean;
  index: number;
  onOpen: () => void;
}) {
  const { summary, reservation, activity } = row;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        style={{
          ...PROPOSALS_GRID_STYLE,
          animationDelay: `${Math.min(index, 10) * 40}ms`,
        }}
        className={cn(
          "fill-mode-both hover:bg-muted focus-visible:ring-ring motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 grid min-h-14 w-full items-center gap-3 rounded-xl border-t px-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none motion-safe:duration-300",
          current && "bg-accent",
        )}
      >
        <span className="truncate font-semibold">
          {reservation.member.name}
        </span>
        <span className="text-muted-foreground truncate">
          {reservation.villa}, {reservation.destination.split(",")[0]}
        </span>
        <span className="tabular-nums">
          {formatRange(reservation.arrivalDate, reservation.departureDate)}
        </span>
        <span className="text-right tabular-nums">{summary.itemCount}</span>
        <span className="text-right font-semibold tabular-nums">
          {formatMoney(summary.totalCents)}
        </span>
        <span>
          <StatusBadge status={summary.status} />
        </span>
        <span className="text-muted-foreground text-sm">{activity.label}</span>
      </button>
    </li>
  );
}
