import type { z } from "zod";

import { apiErrorSchema } from "@/lib/schemas/error";

import { ApiError } from "./api-error";

export type Requester = <S extends z.ZodType>(
  schema: S,
  path: string,
  init?: { method?: string; body?: unknown },
) => Promise<z.output<S>>;

export const createRequester = (baseUrl = ""): Requester => {
  return async (schema, path, init = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: init.method,
      headers:
        init.body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const parsed = apiErrorSchema.safeParse(payload);
      if (parsed.success) {
        const { code, message, details } = parsed.data.error;
        throw new ApiError(code, message, response.status, details);
      }
      throw new ApiError(
        "INTERNAL_ERROR",
        "Unexpected server response",
        response.status,
      );
    }

    return schema.parse(payload);
  };
};
