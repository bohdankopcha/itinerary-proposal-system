import { describe, expect, it } from "vitest";

import { blockLayout, minutesAtOffset } from "./calendar";
import { formatMoney, formatRange, formatTime } from "./format";
import { firstOpenDate, groupByDay, plannedDayCount } from "./itinerary";
import { categoryBreakdown } from "./totals";

const stay = { arrivalDate: "2027-03-15", departureDate: "2027-03-17" };

const items = [
  { scheduledAt: "2027-03-16T18:00:00.000Z", priceCents: 20000 },
  { scheduledAt: "2027-03-15T09:00:00.000Z", priceCents: 10000 },
  { scheduledAt: "2027-03-16T08:00:00.000Z", priceCents: 5000 },
];

describe("groupByDay", () => {
  it("keeps every stay day, orders by time and sums subtotals", () => {
    const days = groupByDay(items, stay);
    expect(days.map((day) => day.items.length)).toEqual([1, 2, 0]);
    expect(days[1]?.items[0]?.priceCents).toBe(5000);
    expect(days[1]?.subtotalCents).toBe(25000);
  });

  it("finds the first day without items and counts planned days", () => {
    expect(firstOpenDate(items, stay)).toBe("2027-03-17");
    expect(plannedDayCount(items, stay.arrivalDate)).toBe(2);
    expect(firstOpenDate([], stay)).toBe("2027-03-15");
  });
});

describe("categoryBreakdown", () => {
  it("skips empty categories and sums the rest", () => {
    const result = categoryBreakdown([
      { category: "dining", priceCents: 100 },
      { category: "dining", priceCents: 250 },
      { category: "wellness", priceCents: 40 },
    ]);
    expect(result).toEqual([
      { category: "dining", count: 2, totalCents: 350 },
      { category: "wellness", count: 1, totalCents: 40 },
    ]);
  });
});

describe("calendar layout", () => {
  it("places blocks relative to the 7am start", () => {
    expect(blockLayout(7 * 60, 120)).toEqual({ top: 2, height: 92 });
    expect(blockLayout(8 * 60, 30).height).toBe(44);
  });

  it("snaps offsets to 30 minutes and clamps to the visible day", () => {
    expect(minutesAtOffset(0)).toBe(7 * 60);
    expect(minutesAtOffset(60)).toBe(8 * 60 + 0);
    expect(minutesAtOffset(100000)).toBe(23 * 60 + 30);
  });
});

describe("formatters", () => {
  it("formats money without decimals for whole dollars", () => {
    expect(formatMoney(95000)).toBe("$950");
    expect(formatMoney(95050)).toBe("$950.50");
  });

  it("formats times and ranges", () => {
    expect(formatTime(0)).toBe("12:00 AM");
    expect(formatTime(12 * 60)).toBe("12:00 PM");
    expect(formatTime(19 * 60 + 30)).toBe("7:30 PM");
    expect(formatRange("2027-03-15", "2027-03-22")).toBe("Mar 15 – 22");
    expect(formatRange("2027-03-30", "2027-04-02")).toBe("Mar 30 – Apr 2");
  });
});
