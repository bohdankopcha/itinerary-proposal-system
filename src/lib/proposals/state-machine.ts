import type { ProposalStatus } from "@/lib/schemas/proposal";

import { invalidTransition } from "./errors";

export const TRANSITIONS: Record<ProposalStatus, ProposalStatus | null> = {
  draft: "sent",
  sent: "approved",
  approved: "paid",
  paid: null,
};

export const nextStatus = (from: ProposalStatus) => TRANSITIONS[from];

export const canTransition = (from: ProposalStatus, to: ProposalStatus) =>
  TRANSITIONS[from] === to;

export function transition(from: ProposalStatus, to: ProposalStatus) {
  if (!canTransition(from, to)) throw invalidTransition(from, to);
  return to;
}

export const isEditable = (status: ProposalStatus) => status === "draft";

/** `sent` has a side effect (the email), so it is reachable only through `/send`. */
export const MEMBER_TARGETS: readonly ProposalStatus[] = ["approved", "paid"];
