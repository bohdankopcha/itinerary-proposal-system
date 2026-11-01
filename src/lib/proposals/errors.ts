import type { ErrorCode, ErrorDetail } from "@/lib/schemas/error";

export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const notFound = (what: string, id: string) =>
  new DomainError("NOT_FOUND", `${what} "${id}" was not found`);

export const invalidTransition = (from: string, to: string) =>
  new DomainError(
    "INVALID_TRANSITION",
    `Cannot change proposal status from "${from}" to "${to}"`,
  );
