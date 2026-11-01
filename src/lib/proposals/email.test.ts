import { describe, expect, it } from "vitest";

import { buildEmailBody } from "./email";

const proposal = {
  id: "abc123",
  notes: null as string | null,
  items: [{ priceCents: 45_000 }, { priceCents: 12_050 }],
  reservation: {
    destination: "Punta Mita, Mexico",
    villa: "Villa Punta Mita",
    arrivalDate: new Date("2027-03-15T00:00:00.000Z"),
    departureDate: new Date("2027-03-22T00:00:00.000Z"),
    member: { name: "James Whitfield" },
  },
};

describe("buildEmailBody", () => {
  it("includes greeting, stay, count, total and absolute link", () => {
    const body = buildEmailBody(proposal);
    expect(body).toContain("Dear James Whitfield,");
    expect(body).toContain("Villa Punta Mita, Punta Mita, Mexico");
    expect(body).toContain("March 15, 2027 to March 22, 2027");
    expect(body).toContain("2 experiences");
    expect(body).toContain("$570.50");
    expect(body).toContain("/proposal/abc123");
    expect(body).not.toContain("note from your concierge");
  });

  it("includes the note when present", () => {
    expect(
      buildEmailBody({ ...proposal, notes: "Looking forward to hosting you." }),
    ).toContain("A note from your concierge: Looking forward to hosting you.");
  });
});
