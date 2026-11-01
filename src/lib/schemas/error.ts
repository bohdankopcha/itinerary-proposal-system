import { z } from "zod";

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "INVALID_TRANSITION",
  "NOT_EDITABLE",
  "EMPTY_PROPOSAL",
  "INTERNAL_ERROR",
] as const;

export const errorCodeSchema = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const errorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
});
export type ErrorDetail = z.infer<typeof errorDetailSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    details: z.array(errorDetailSchema).optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
