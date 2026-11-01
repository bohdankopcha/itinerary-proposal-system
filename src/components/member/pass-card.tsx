import { PASS_COLORS } from "@/components/member/pass-styles";
import { CATEGORIES } from "@/lib/proposals/categories";
import { formatMoney, formatTime } from "@/lib/proposals/format";
import { minutesOf } from "@/lib/proposals/trip-days";
import type { ProposalItemInput } from "@/lib/schemas/proposal";
import { cn } from "@/lib/utils";

export type ExplorerItem = Pick<
  ProposalItemInput,
  "category" | "title" | "description" | "scheduledAt" | "priceCents"
>;

export function PassCard({
  item,
  open,
  offset,
  layer,
  delay,
  collapsing,
  onToggle,
}: {
  item: ExplorerItem;
  open: boolean;
  offset: number;
  layer: number;
  delay: number;
  collapsing: boolean;
  onToggle: () => void;
}) {
  const category = CATEGORIES[item.category];
  const start = minutesOf(item.scheduledAt);

  return (
    <article
      style={{ marginTop: offset, zIndex: layer, animationDelay: `${delay}ms` }}
      className={cn(
        "text-primary-foreground relative min-h-49 overflow-hidden rounded-3xl shadow-lg transition-[margin,transform,box-shadow] duration-500",
        PASS_COLORS[item.category],
        collapsing ? "animate-collapse-up" : "animate-pass-in",
        open && "-translate-y-0.5 shadow-2xl",
      )}
    >
      <div
        aria-hidden
        className="from-primary-foreground/20 to-foreground/25 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent"
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="focus-visible:ring-primary-foreground relative z-10 flex min-h-19 w-full flex-col gap-1.5 rounded-3xl px-5 pt-4 pb-3 text-left focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
      >
        <span className="text-primary-foreground/90 flex items-center justify-between gap-2.5 text-xs font-medium tracking-widest uppercase">
          <span>{category.label}</span>
          <span className="tabular-nums">
            {formatTime(start)} – {formatTime(start + category.durationMinutes)}
          </span>
        </span>
        <span className="text-2xl leading-tight font-semibold tracking-tight">
          {item.title}
        </span>
      </button>
      <div className="border-primary-foreground/35 relative z-10 border-t border-dashed px-5 pt-3 pb-4.5">
        <p
          className={cn(
            "text-primary-foreground/95 mb-3.5 text-sm leading-normal",
            !open && "line-clamp-2",
          )}
        >
          {item.description}
        </p>
        <div className="text-right">
          <span className="text-primary-foreground/85 mb-0.5 block text-xs tracking-widest uppercase">
            Estimated
          </span>
          <span className="text-3xl leading-none font-medium tracking-tighter tabular-nums">
            {formatMoney(item.priceCents)}
          </span>
        </div>
      </div>
    </article>
  );
}
