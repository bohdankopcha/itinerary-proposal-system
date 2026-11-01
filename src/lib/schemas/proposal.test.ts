import { describe, expect, it } from "vitest";

import {
  createProposalSchema,
  proposalItemInputSchema,
  updateStatusSchema,
} from "./proposal";

const item = {
  category: "dining",
  title: "Private chef dinner",
  description: "Five courses on the terrace",
  scheduledAt: "2027-03-16T19:00:00.000Z",
  priceCents: 120_000,
};

describe("proposalItemInputSchema", () => {
  it("accepts a valid item and trims text", () => {
    const parsed = proposalItemInputSchema.parse({
      ...item,
      title: "  Chef  ",
    });
    expect(parsed.title).toBe("Chef");
  });

  it.each([
    ["unknown category", { category: "spa" }],
    ["blank title", { title: "   " }],
    ["blank description", { description: "" }],
    ["negative price", { priceCents: -1 }],
    ["fractional price", { priceCents: 10.5 }],
    ["non-ISO date", { scheduledAt: "March 16" }],
  ])("rejects %s", (_name, override) => {
    expect(
      proposalItemInputSchema.safeParse({ ...item, ...override }).success,
    ).toBe(false);
  });

  it("allows a free (zero) price", () => {
    expect(
      proposalItemInputSchema.safeParse({ ...item, priceCents: 0 }).success,
    ).toBe(true);
  });
});

describe("createProposalSchema", () => {
  it("requires at least one item", () => {
    expect(
      createProposalSchema.safeParse({ reservationId: "r1", items: [] })
        .success,
    ).toBe(false);
  });

  it("stores empty or whitespace notes as null", () => {
    for (const notes of [undefined, null, "", "   "]) {
      const parsed = createProposalSchema.parse({
        reservationId: "r1",
        notes,
        items: [item],
      });
      expect(parsed.notes).toBeNull();
    }
  });

  it("keeps non-empty notes", () => {
    const parsed = createProposalSchema.parse({
      reservationId: "r1",
      notes: " Hi ",
      items: [item],
    });
    expect(parsed.notes).toBe("Hi");
  });
});

describe("updateStatusSchema", () => {
  it("accepts known statuses and rejects others", () => {
    expect(updateStatusSchema.safeParse({ status: "approved" }).success).toBe(
      true,
    );
    expect(updateStatusSchema.safeParse({ status: "cancelled" }).success).toBe(
      false,
    );
    expect(updateStatusSchema.safeParse({}).success).toBe(false);
  });
});
