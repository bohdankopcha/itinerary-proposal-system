import type { z } from "zod";

import { DomainError } from "@/lib/proposals/errors";
import type { ApiErrorBody, ErrorCode, ErrorDetail } from "@/lib/schemas/error";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  INVALID_TRANSITION: 409,
  NOT_EDITABLE: 409,
  EMPTY_PROPOSAL: 422,
  INTERNAL_ERROR: 500,
};

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status });

const errorResponse = (
  code: ErrorCode,
  message: string,
  details?: ErrorDetail[],
) => {
  const body: ApiErrorBody = {
    error: { code, message, ...(details && { details }) },
  };
  return Response.json(body, { status: STATUS_BY_CODE[code] });
};

const toErrorResponse = (error: unknown) => {
  if (error instanceof DomainError) {
    return errorResponse(error.code, error.message, error.details);
  }
  console.error("Unhandled API error", error);
  return errorResponse("INTERNAL_ERROR", "Something went wrong");
};

export const handle = async (run: () => Promise<Response>) => {
  try {
    return await run();
  } catch (error) {
    return toErrorResponse(error);
  }
};

export const parseInput = <S extends z.ZodType>(
  schema: S,
  data: unknown,
): z.output<S> => {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const details = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  throw new DomainError(
    "VALIDATION_ERROR",
    "Request validation failed",
    details,
  );
};

export const readJson = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    throw new DomainError(
      "VALIDATION_ERROR",
      "Request body must be valid JSON",
    );
  }
};
