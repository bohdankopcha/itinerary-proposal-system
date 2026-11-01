import { describe, expect, it } from "vitest";

import { formatDayMonth } from "./format";

describe("formatDayMonth", () => {
  it("formats short weekday, day and month", () => {
    expect(formatDayMonth("2026-03-12")).toBe("Thu 12 Mar");
  });
});
