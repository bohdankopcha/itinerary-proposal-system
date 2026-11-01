import { describe, expect, it } from "vitest";

import {
  durationBetween,
  flightForDay,
  flightTop,
  parseEndInput,
  resizeRange,
  toEndInput,
} from "./calendar";

const range = { startMinutes: 600, durationMinutes: 120 };

describe("resizeRange", () => {
  it("moves the bottom edge and snaps to 15 minutes", () => {
    expect(resizeRange(range, "bottom", 22)).toEqual({
      startMinutes: 600,
      durationMinutes: 135,
    });
  });

  it("moves the top edge and keeps the end fixed", () => {
    expect(resizeRange(range, "top", -30)).toEqual({
      startMinutes: 570,
      durationMinutes: 150,
    });
  });

  it("enforces the minimum duration from either edge", () => {
    expect(resizeRange(range, "bottom", -500).durationMinutes).toBe(30);
    expect(resizeRange(range, "top", 500)).toEqual({
      startMinutes: 690,
      durationMinutes: 30,
    });
  });

  it("clamps to the visible day", () => {
    expect(resizeRange(range, "top", -500).startMinutes).toBe(7 * 60);
    const late = resizeRange(range, "bottom", 5000);
    expect(late.startMinutes + late.durationMinutes).toBe(24 * 60);
  });
});

describe("flightForDay", () => {
  const stay = { arrivalMinutes: 700, departureMinutes: 900 };

  it("maps landing to the first day and takeoff to the last", () => {
    expect(flightForDay(stay, 0, 8)).toEqual({ kind: "arrival", minutes: 700 });
    expect(flightForDay(stay, 7, 8)).toEqual({
      kind: "departure",
      minutes: 900,
    });
    expect(flightForDay(stay, 3, 8)).toBeNull();
  });

  it("returns nothing when the time is unknown", () => {
    expect(
      flightForDay({ arrivalMinutes: null, departureMinutes: null }, 0, 8),
    ).toBeNull();
  });

  it("positions the marker from the top of the grid", () => {
    expect(flightTop(8 * 60)).toBe(48);
    expect(flightTop(0)).toBe(0);
  });
});

describe("end time helpers", () => {
  it("derives a duration only for a valid range inside the day", () => {
    expect(durationBetween(600, 690)).toBe(90);
    expect(durationBetween(600, 600)).toBeNull();
    expect(durationBetween(600, 615)).toBeNull();
    expect(durationBetween(600, 500)).toBeNull();
    expect(durationBetween(600, 24 * 60)).toBe(840);
    expect(durationBetween(23 * 60, 25 * 60)).toBeNull();
    expect(durationBetween(6 * 60, 8 * 60)).toBeNull();
  });

  it("round-trips the end of the day through the time input", () => {
    expect(toEndInput(24 * 60)).toBe("23:59");
    expect(parseEndInput("23:59")).toBe(24 * 60);
    expect(parseEndInput(toEndInput(13 * 60 + 15))).toBe(13 * 60 + 15);
    expect(parseEndInput("bad")).toBeNull();
  });
});
