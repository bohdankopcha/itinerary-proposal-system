export const totalCents = (items: { priceCents: number }[]) =>
  items.reduce((sum, item) => sum + item.priceCents, 0);
