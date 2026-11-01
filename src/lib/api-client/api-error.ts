import type { ErrorCode, ErrorDetail } from "@/lib/schemas/error";

export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly status: number,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
