import { CATEGORY_STYLES } from "@/components/category-styles";
import { CATEGORIES } from "@/lib/proposals/categories";
import { formatMoney } from "@/lib/proposals/format";
import type { categoryBreakdown } from "@/lib/proposals/totals";
import { cn } from "@/lib/utils";

export function CategoryBreakdown({
  entries,
}: {
  entries: ReturnType<typeof categoryBreakdown>;
}) {
  if (entries.length === 0) return null;
  return (
    <ul className="flex flex-col border-t pt-2.5">
      {entries.map((entry) => (
        <li
          key={entry.category}
          className="flex min-h-6 items-center gap-2 text-sm"
        >
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              CATEGORY_STYLES[entry.category].dot,
            )}
          />
          <span>{CATEGORIES[entry.category].label}</span>
          <span className="text-muted-foreground ml-0.5 tabular-nums">
            {entry.count}
          </span>
          <span className="ml-auto tabular-nums">
            {formatMoney(entry.totalCents)}
          </span>
        </li>
      ))}
    </ul>
  );
}
