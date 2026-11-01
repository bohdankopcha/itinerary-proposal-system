import { afterEach, describe, expect, it, vi } from "vitest";

import { DomainError } from "@/lib/proposals/errors";

import { handle } from "./respond";

afterEach(() => vi.restoreAllMocks());

describe("handle", () => {
  it("maps domain errors to their status and shared shape", async () => {
    const details = [{ path: "items.0", message: "bad" }];
    const response = await handle(async () => {
      throw new DomainError("EMPTY_PROPOSAL", "Needs items", details);
    });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: { code: "EMPTY_PROPOSAL", message: "Needs items", details },
    });
  });

  it("returns a generic 500 and never leaks internals", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await handle(async () => {
      throw new Error("SQLITE_CORRUPT: secret path /var/db");
    });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
    });
    expect(JSON.stringify(body)).not.toContain("SQLITE");
    expect(log).toHaveBeenCalledOnce();
  });
});
