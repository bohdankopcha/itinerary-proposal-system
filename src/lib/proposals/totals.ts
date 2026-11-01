import { ITEM_CATEGORIES, type ItemCategory } from "@/lib/schemas/proposal";

export const totalCents = (items: { priceCents: number }[]) =>
  items.reduce((sum, item) => sum + item.priceCents, 0);

export function categoryBreakdown(
  items: { category: ItemCategory; priceCents: number }[],
) {
  return ITEM_CATEGORIES.map((category) => {
    const matching = items.filter((item) => item.category === category);
    return {
      category,
      count: matching.length,
      totalCents: totalCents(matching),
    };
  }).filter((entry) => entry.count > 0);
}
