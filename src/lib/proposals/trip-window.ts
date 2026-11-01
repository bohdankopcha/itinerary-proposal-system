import type { ErrorDetail } from "@/lib/schemas/error";
import type { ProposalItemInput } from "@/lib/schemas/proposal";

import { DomainError } from "./errors";

const DAY_MS = 24 * 60 * 60 * 1000;

export function validateItemsWithinTrip(
  items: Pick<ProposalItemInput, "scheduledAt">[],
  stay: { arrivalDate: Date; departureDate: Date },
) {
  const start = stay.arrivalDate.getTime();
  const end = stay.departureDate.getTime() + DAY_MS;

  const details: ErrorDetail[] = [];
  items.forEach((item, index) => {
    const time = new Date(item.scheduledAt).getTime();
    if (time < start || time >= end) {
      details.push({
        path: `items.${index}.scheduledAt`,
        message:
          "Must fall within the trip dates (arrival to departure, inclusive)",
      });
    }
  });

  if (details.length > 0) {
    throw new DomainError(
      "VALIDATION_ERROR",
      "Some items are scheduled outside the trip dates",
      details,
    );
  }
}
