import { describe, expect, it } from "vitest";

import { layoutOverlaps } from "./overlap-layout";

const span = (key: string, start: number, end: number) => ({
  key,
  startMinutes: start,
  endMinutes: end,
});
const slotOf = (slots: ReturnType<typeof layoutOverlaps>, key: string) =>
  slots.find((slot) => slot.key === key);

describe("layoutOverlaps", () => {
  it("gives a lone span the full width", () => {
    expect(layoutOverlaps([span("a", 600, 660)])).toEqual([
      { key: "a", column: 0, columns: 1 },
    ]);
  });

  it("keeps back-to-back spans full width", () => {
    const slots = layoutOverlaps([span("a", 600, 660), span("b", 660, 720)]);
    expect(slots.every((slot) => slot.columns === 1)).toBe(true);
  });

  it("splits two overlapping spans in half", () => {
    const slots = layoutOverlaps([span("a", 600, 720), span("b", 660, 780)]);
    expect(slotOf(slots, "a")).toMatchObject({ column: 0, columns: 2 });
    expect(slotOf(slots, "b")).toMatchObject({ column: 1, columns: 2 });
  });

  it("uses three columns for three mutual overlaps", () => {
    const slots = layoutOverlaps([
      span("a", 600, 720),
      span("b", 610, 720),
      span("c", 620, 720),
    ]);
    expect(slots.map((slot) => slot.columns)).toEqual([3, 3, 3]);
    expect(new Set(slots.map((slot) => slot.column)).size).toBe(3);
  });

  it("reuses a freed column inside a chained cluster", () => {
    const slots = layoutOverlaps([
      span("a", 600, 700),
      span("b", 650, 800),
      span("c", 700, 760),
    ]);
    expect(slotOf(slots, "c")).toMatchObject({ column: 0, columns: 2 });
  });

  it("sizes separate clusters independently", () => {
    const slots = layoutOverlaps([
      span("a", 600, 700),
      span("b", 620, 700),
      span("c", 900, 960),
    ]);
    expect(slotOf(slots, "c")).toMatchObject({ column: 0, columns: 1 });
    expect(slotOf(slots, "a")?.columns).toBe(2);
  });
});
