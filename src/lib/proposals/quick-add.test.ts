import { describe, expect, it } from "vitest";

import { dropStartMinutes } from "./calendar";
import { parseQuickAdd, resolveQuickAdd } from "./quick-add";

const stay = { arrivalDate: "2027-03-15", departureDate: "2027-03-22" };

describe("parseQuickAdd", () => {
  it("returns null for blank input", () => {
    expect(parseQuickAdd("   ", stay)).toBeNull();
  });

  it("reads title, day, time and trailing price", () => {
    const parsed = parseQuickAdd("surf lesson day 2 10am 220", stay);
    expect(parsed).toMatchObject({
      title: "Surf lesson",
      category: "activities",
      categorySource: "inferred",
      dayIndex: 1,
      startMinutes: 10 * 60,
      priceCents: 22000,
    });
  });

  it("does not mistake 'sunset' for Sunday", () => {
    const parsed = parseQuickAdd("sunset cocktails fri 7pm 260", stay);
    expect(parsed).toMatchObject({
      title: "Sunset cocktails",
      category: "experiences",
      dayIndex: 4,
      startMinutes: 19 * 60,
      priceCents: 26000,
    });
  });

  it("reads month names, dollar prices with separators and typed categories", () => {
    const parsed = parseQuickAdd(
      "wellness mar 17 9:30am $1,200 morning facial",
      stay,
    );
    expect(parsed).toMatchObject({
      category: "wellness",
      categorySource: "typed",
      dayIndex: 2,
      startMinutes: 9 * 60 + 30,
      priceCents: 120000,
    });
  });

  it("flags days outside the stay", () => {
    const parsed = parseQuickAdd("spa day 12", stay);
    expect(parsed).toMatchObject({ dayIndex: null, dayOutOfRange: true });
  });

  it("understands arrival and departure keywords", () => {
    expect(parseQuickAdd("airport transfer arrival", stay)?.dayIndex).toBe(0);
    expect(parseQuickAdd("airport transfer departure", stay)?.dayIndex).toBe(7);
  });
});

describe("resolveQuickAdd", () => {
  it("uses the first open day and category default time when nothing was typed", () => {
    const parsed = parseQuickAdd("private chef dinner", stay);
    if (!parsed) throw new Error("expected a parse");
    const resolved = resolveQuickAdd(parsed, stay, [
      { scheduledAt: "2027-03-15T10:00:00.000Z" },
    ]);
    expect(resolved).toMatchObject({
      date: "2027-03-16",
      startMinutes: 19 * 60 + 30,
      priceCents: 0,
      scheduledAt: "2027-03-16T19:30:00.000Z",
    });
  });
});

describe("dropStartMinutes", () => {
  it("snaps to 15 minutes, keeps the grab point and clamps to the day", () => {
    expect(dropStartMinutes(96, 0, 120)).toBe(9 * 60);
    expect(dropStartMinutes(110, 20, 120)).toBe(9 * 60);
    expect(dropStartMinutes(-50, 0, 120)).toBe(7 * 60);
    expect(dropStartMinutes(5000, 0, 120)).toBe(22 * 60);
  });
});
