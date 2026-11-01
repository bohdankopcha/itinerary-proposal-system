import { describe, expect, it } from "vitest";

import { PROPOSAL_STATUSES, type ProposalStatus } from "@/lib/schemas/proposal";

import { DomainError } from "./errors";
import {
  canTransition,
  isEditable,
  nextStatus,
  transition,
} from "./state-machine";

const VALID: [ProposalStatus, ProposalStatus][] = [
  ["draft", "sent"],
  ["sent", "approved"],
  ["approved", "paid"],
];

const isValid = (from: ProposalStatus, to: ProposalStatus) =>
  VALID.some(([f, t]) => f === from && t === to);

const ALL_PAIRS = PROPOSAL_STATUSES.flatMap((from) =>
  PROPOSAL_STATUSES.map((to) => [from, to] as const),
);

describe("state machine", () => {
  it.each(VALID)("allows %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(transition(from, to)).toBe(to);
  });

  it.each(ALL_PAIRS.filter(([from, to]) => !isValid(from, to)))(
    "rejects %s -> %s",
    (from, to) => {
      expect(canTransition(from, to)).toBe(false);
      expect(() => transition(from, to)).toThrow(DomainError);
      try {
        transition(from, to);
      } catch (error) {
        expect(error).toMatchObject({ code: "INVALID_TRANSITION" });
        expect((error as Error).message).toContain(from);
        expect((error as Error).message).toContain(to);
      }
    },
  );

  it("covers every status pair", () => {
    expect(ALL_PAIRS).toHaveLength(16);
  });

  it("exposes the next status, none after paid", () => {
    expect(nextStatus("draft")).toBe("sent");
    expect(nextStatus("paid")).toBeNull();
  });

  it("only drafts are editable", () => {
    expect(PROPOSAL_STATUSES.filter(isEditable)).toEqual(["draft"]);
  });
});
