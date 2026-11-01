import { describe, expect, it } from "vitest";

import { DomainError } from "./errors";
import { validateItemsWithinTrip } from "./trip-window";

const stay = {
  arrivalDate: new Date("2027-03-15T00:00:00.000Z"),
  departureDate: new Date("2027-03-22T00:00:00.000Z"),
};
const at = (scheduledAt: string) => ({ scheduledAt });

describe("validateItemsWithinTrip", () => {
  it("accepts the first and last moments of the stay", () => {
    expect(() =>
      validateItemsWithinTrip(
        [at("2027-03-15T00:00:00.000Z"), at("2027-03-22T23:59:59.000Z")],
        stay,
      ),
    ).not.toThrow();
  });

  it("rejects times before arrival and after departure day, naming each item", () => {
    try {
      validateItemsWithinTrip(
        [
          at("2027-03-14T23:59:59.000Z"),
          at("2027-03-16T10:00:00.000Z"),
          at("2027-03-23T00:00:00.000Z"),
        ],
        stay,
      );
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      const { code, details } = error as DomainError;
      expect(code).toBe("VALIDATION_ERROR");
      expect(details?.map((d) => d.path)).toEqual([
        "items.0.scheduledAt",
        "items.2.scheduledAt",
      ]);
    }
  });
});
