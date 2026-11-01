import { describe, expect, it } from "vitest";

import { totalCents } from "./totals";

describe("totalCents", () => {
  it("sums item prices", () => {
    expect(
      totalCents([
        { priceCents: 12_500 },
        { priceCents: 999 },
        { priceCents: 0 },
      ]),
    ).toBe(13_499);
  });

  it("is zero for no items", () => {
    expect(totalCents([])).toBe(0);
  });
});
