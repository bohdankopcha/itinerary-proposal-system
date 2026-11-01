import { ReservationSelect } from "@/components/concierge/reservation-select";
import { Button } from "@/components/ui/button";
import type { ConciergeView } from "@/hooks/concierge-view";
import type { Reservation } from "@/lib/schemas/reservation";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const TABS: { view: ConciergeView; label: string }[] = [
  { view: "itinerary", label: "Itinerary" },
  { view: "proposals", label: "Proposals" },
];

export function ConciergeTopBar({
  view,
  proposalCount,
  reservations,
  reservationId,
  onViewChange,
  onReservationChange,
  onOpenPalette,
}: {
  view: ConciergeView;
  proposalCount: number;
  reservations: Reservation[];
  reservationId: string;
  onViewChange: (view: ConciergeView) => void;
  onReservationChange: (id: string) => void;
  onOpenPalette: () => void;
}) {
  return (
    <header className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-8">
      <div className="mr-2 flex items-center gap-2.5 font-semibold tracking-tight">
        <span
          aria-hidden
          className="bg-foreground after:border-background relative size-5.5 rounded-md after:absolute after:inset-1.5 after:rounded-full after:border"
        />
        Detour
      </div>
      <nav aria-label="Views" className="bg-muted flex gap-0.5 rounded-xl p-1">
        {TABS.map((tab) => {
          const active = view === tab.view;
          return (
            <Button
              key={tab.view}
              variant="ghost"
              aria-pressed={active}
              onClick={() => onViewChange(tab.view)}
              className={cn(
                "rounded-lg px-4",
                active
                  ? "bg-popover text-foreground hover:bg-popover shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {tab.label}
              {tab.view === "proposals" && (
                <span className="text-muted-foreground text-xs tabular-nums">
                  {proposalCount}
                </span>
              )}
            </Button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onOpenPalette}
        className="border-input bg-field text-muted-foreground hover:border-primary hover:ring-accent focus-visible:ring-ring/50 hidden h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border pr-2.5 pl-3.5 text-left transition-shadow hover:ring-3 focus-visible:ring-3 focus-visible:outline-none sm:flex sm:max-w-md sm:basis-64"
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <span className="flex-1 truncate">Add or find anything…</span>
        <kbd className="border-input bg-field rounded-md border px-2 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>
      </button>
      <div className="w-full sm:ml-auto sm:w-auto">
        <ReservationSelect
          reservations={reservations}
          value={reservationId}
          onChange={onReservationChange}
        />
      </div>
    </header>
  );
}
