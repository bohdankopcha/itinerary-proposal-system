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

const parse = (input: string) => {
  const parsed = parseQuickAdd(input, stay);
  if (!parsed) throw new Error("expected a parse");
  return parsed;
};

const timing = (input: string) => {
  const { startMinutes, durationMinutes, title } = parse(input);
  return { startMinutes, durationMinutes, title };
};

describe("parseQuickAdd end time and duration", () => {
  it.each([
    ["dinner from 7pm till 9pm", 19 * 60, 120],
    ["dinner from 7pm until 9pm", 19 * 60, 120],
    ["dinner from 7pm til 9pm", 19 * 60, 120],
    ["dinner from 7pm to 9pm", 19 * 60, 120],
    ["dinner from 7 to 9pm", 19 * 60, 120],
    ["dinner 7pm-9pm", 19 * 60, 120],
    ["dinner 7pm - 9pm", 19 * 60, 120],
    ["dinner 7-9pm", 19 * 60, 120],
    ["dinner 7pm-9", 19 * 60, 120],
    ["brunch 11am-1pm", 11 * 60, 120],
    ["brunch 11-1pm", 11 * 60, 120],
    ["brunch 9:30-11am", 9 * 60 + 30, 90],
    ["brunch 10am-12", 10 * 60, 120],
    ["dinner 19:00-21:30", 19 * 60, 150],
    ["show 7pm-12am", 19 * 60, 300],
    ["show 7pm-midnight 9", 19 * 60, null],
    ["dinner 7pm till 9pm", 19 * 60, 120],
    ["dinner 7pm until 9:30pm", 19 * 60, 150],
    ["dinner fri 7pm till 9pm", 19 * 60, 120],
    ["dinner 7pm fri till 9pm", 19 * 60, 120],
    ["dinner 7pm to 9:00", 19 * 60, 120],
  ])("%s", (input, start, duration) => {
    expect(timing(input)).toMatchObject({
      startMinutes: start,
      durationMinutes: duration,
    });
  });

  it.each([
    ["dinner 7pm for 2h", 120],
    ["dinner 7pm for 2 hours", 120],
    ["dinner 7pm for 1.5 hours", 90],
    ["dinner 7pm for 1.5h", 90],
    ["dinner 7pm for 90 min", 90],
    ["dinner 7pm for 90 minutes", 90],
    ["dinner 7pm for 2 hours 30 minutes", 150],
    ["dinner 7pm for 2h 30m", 150],
    ["dinner 7pm for 2 hours and 15 min", 135],
    ["dinner for 2h 7pm", 120],
    ["dinner for 45 mins", 45],
  ])("%s", (input, duration) => {
    expect(parse(input).durationMinutes).toBe(duration);
  });

  it("removes the time phrases from the title and keeps price and day", () => {
    expect(parse("dinner at nobu friday 8pm till 10pm $200")).toMatchObject({
      title: "Dinner at nobu",
      dayIndex: 4,
      startMinutes: 20 * 60,
      durationMinutes: 120,
      priceCents: 20000,
    });
    expect(parse("surf lesson day 2 10am for 2h 220")).toMatchObject({
      title: "Surf lesson",
      dayIndex: 1,
      startMinutes: 10 * 60,
      durationMinutes: 120,
      priceCents: 22000,
    });
    expect(parse("massage mar 17 3-4:30pm 180")).toMatchObject({
      dayIndex: 2,
      startMinutes: 15 * 60,
      durationMinutes: 90,
      priceCents: 18000,
    });
  });

  it("keeps durations without a start time", () => {
    expect(timing("spa for 2h")).toMatchObject({
      startMinutes: null,
      durationMinutes: 120,
      title: "Spa",
    });
  });

  it.each([
    ["Trip to Tulum", "Trip to tulum"],
    ["table for two", "Table for two"],
    ["table for 2", "Table for"],
    ["dinner for two 7pm", "Dinner for two"],
    ["transfer to the airport 9am", "Transfer to the airport"],
    ["flight to cancun 7pm", "Flight to cancun"],
    ["trip to tulum from the airport", "Trip to tulum from the airport"],
    ["lunch for the group 1pm", "Lunch for the group"],
  ])("leaves ambiguous words in %s", (input, title) => {
    const parsed = parse(input);
    expect(parsed.durationMinutes).toBeNull();
    expect(parsed.title.replace(/\s+\d+$/, "")).toBe(title);
  });

  it("does not read a bare number pair as a range", () => {
    expect(timing("dinner 7-9")).toMatchObject({
      startMinutes: null,
      durationMinutes: null,
    });
    expect(timing("dinner from 7 to 9")).toMatchObject({
      startMinutes: null,
      durationMinutes: null,
    });
    expect(timing("dinner 2 to 3 people 8pm")).toMatchObject({
      startMinutes: 20 * 60,
      durationMinutes: null,
    });
  });

  it("falls back to no duration for invalid values without crashing", () => {
    expect(timing("dinner 9pm-7pm")).toMatchObject({
      startMinutes: 21 * 60,
      durationMinutes: null,
    });
    expect(timing("dinner 7pm-7:15pm").durationMinutes).toBeNull();
    expect(timing("dinner 7pm for 10 min").durationMinutes).toBeNull();
    expect(timing("dinner 7pm for 0h").durationMinutes).toBeNull();
    expect(timing("dinner 7pm till 6pm").durationMinutes).toBeNull();
    expect(timing("dinner 7pm till 13pm").startMinutes).toBe(19 * 60);
    expect(() => parseQuickAdd("7-9pm for 2h till", stay)).not.toThrow();
  });

  it("only reads 'till' after a clock start time", () => {
    expect(parse("dinner till 9pm").durationMinutes).toBeNull();
  });
});

describe("resolveQuickAdd duration", () => {
  const resolve = (input: string) => resolveQuickAdd(parse(input), stay, []);

  it("passes the duration through", () => {
    expect(resolve("dinner 7pm-9pm").durationMinutes).toBe(120);
    expect(resolve("dinner for 3h").durationMinutes).toBe(180);
  });

  it("is null when nothing was typed", () => {
    expect(resolve("dinner 7pm").durationMinutes).toBeNull();
  });

  it("clamps to the end of the day", () => {
    expect(resolve("dinner 10pm for 5h").durationMinutes).toBe(120);
  });

  it("keeps the minimum length when the start is pulled back into the day", () => {
    expect(resolve("dinner 11:45pm for 2h")).toMatchObject({
      startMinutes: 23 * 60 + 30,
      durationMinutes: 30,
    });
  });
});
