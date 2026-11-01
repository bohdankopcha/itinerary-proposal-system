import { totalCents } from "./totals";
import { dateOf, dayIndexOf, tripDates } from "./trip-days";

export type ItineraryDay<T> = {
  index: number;
  date: string;
  items: T[];
  subtotalCents: number;
};

/** Groups items by stay day, in time order; days without items are kept so callers can show open days. */
export function groupByDay<
  T extends { scheduledAt: string; priceCents: number },
>(
  items: T[],
  stay: { arrivalDate: string; departureDate: string },
): ItineraryDay<T>[] {
  const sorted = [...items].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  );
  return tripDates(stay.arrivalDate, stay.departureDate).map((date, index) => {
    const dayItems = sorted.filter((item) => dateOf(item.scheduledAt) === date);
    return {
      index,
      date,
      items: dayItems,
      subtotalCents: totalCents(dayItems),
    };
  });
}

export function firstOpenDate(
  items: { scheduledAt: string }[],
  stay: { arrivalDate: string; departureDate: string },
) {
  const dates = tripDates(stay.arrivalDate, stay.departureDate);
  const used = new Set(items.map((item) => dateOf(item.scheduledAt)));
  return dates.find((date) => !used.has(date)) ?? dates[0] ?? stay.arrivalDate;
}

export const plannedDayCount = (
  items: { scheduledAt: string }[],
  arrivalDate: string,
) =>
  new Set(items.map((item) => dayIndexOf(item.scheduledAt, arrivalDate))).size;
