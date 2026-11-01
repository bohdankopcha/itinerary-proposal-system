import { describe, expect, it } from "vitest";

import {
  dayIndexOf,
  minutesOf,
  nightsBetween,
  parseTimeInput,
  toScheduledAt,
  toTimeInput,
  tripDates,
} from "./trip-days";

describe("trip days", () => {
  it("counts nights and lists every date inclusive", () => {
    expect(nightsBetween("2027-03-15", "2027-03-22")).toBe(7);
    const dates = tripDates("2027-03-15", "2027-03-22");
    expect(dates).toHaveLength(8);
    expect(dates[0]).toBe("2027-03-15");
    expect(dates.at(-1)).toBe("2027-03-22");
  });

  it("crosses month boundaries", () => {
    expect(tripDates("2027-03-30", "2027-04-02")).toEqual([
      "2027-03-30",
      "2027-03-31",
      "2027-04-01",
      "2027-04-02",
    ]);
  });

  it("derives day index and minutes from wall-clock timestamps", () => {
    const scheduledAt = "2027-03-17T09:30:00.000Z";
    expect(dayIndexOf(scheduledAt, "2027-03-15")).toBe(2);
    expect(minutesOf(scheduledAt)).toBe(9 * 60 + 30);
  });

  it("round-trips date and minutes through scheduledAt", () => {
    expect(toScheduledAt("2027-03-17", 19 * 60 + 5)).toBe(
      "2027-03-17T19:05:00.000Z",
    );
  });

  it("formats and parses time input values", () => {
    expect(toTimeInput(9 * 60 + 5)).toBe("09:05");
    expect(parseTimeInput("09:05")).toBe(9 * 60 + 5);
    expect(parseTimeInput("")).toBeNull();
    expect(parseTimeInput("24:00")).toBeNull();
  });
});
