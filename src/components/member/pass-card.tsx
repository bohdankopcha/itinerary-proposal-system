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

export const PassCard = ({
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
}) => {
  const category = CATEGORIES[item.category];
  const start = minutesOf(item.scheduledAt);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggle();
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={onKeyDown}
      style={{ marginTop: offset, zIndex: layer, animationDelay: `${delay}ms` }}
      className={cn(
        "text-pass-foreground focus-visible:ring-pass-foreground relative cursor-pointer overflow-hidden rounded-3xl shadow-md transition-[margin,transform] duration-300 ease-out select-none focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none",
        PASS_COLORS[item.category],
        collapsing ? "animate-collapse-up" : "animate-pass-in",
        open && "-translate-y-0.5 shadow-xl",
      )}
    >
      <div
        aria-hidden
        className="from-pass-foreground/10 to-foreground/20 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent"
      />
      <div className="relative z-10 flex min-h-32 w-full flex-col justify-between gap-3 px-5 pt-5 pb-9 text-left">
        <span className="flex items-center justify-between gap-2.5 text-xs font-medium tracking-widest uppercase">
          <span>{category.label}</span>
          <span className="tabular-nums">
            {formatTime(start)} – {formatTime(start + category.durationMinutes)}
          </span>
        </span>
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-2xl leading-tight font-semibold tracking-tight">
            {item.title}
          </span>
          <span className="shrink-0 text-xl font-medium tracking-tight tabular-nums">
            {formatMoney(item.priceCents)}
          </span>
        </span>
      </div>
      <div
        className={cn(
          "relative z-10 grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="border-pass-foreground/35 mx-5 border-t border-dashed pt-3 pb-5 text-sm leading-normal">
            {item.description}
          </p>
        </div>
      </div>
    </article>
  );
};
