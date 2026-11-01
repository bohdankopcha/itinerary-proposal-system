import { useState } from "react";

import { ApiError } from "@/lib/api-client";
import { MEMBER_TARGETS, nextStatus } from "@/lib/proposals/state-machine";
import type { ProposalStatus } from "@/lib/schemas/proposal";

import { useApproveProposal } from "./use-approve-proposal";
import { usePayProposal } from "./use-pay-proposal";
import { useProposal } from "./use-proposal";

export const MEMBER_ACTION_LABELS: Partial<Record<ProposalStatus, string>> = {
  approved: "Approve",
  paid: "Pay & Lock In",
};

const COLLAPSE_MS = 650;
const LOCK_MS = 1300;

type Screen = "main" | "confirm";
type Phase = "collapse" | "lock";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export const useMemberProposal = (id: string) => {
  const query = useProposal(id);
  const approve = useApproveProposal();
  const pay = usePayProposal();

  const [screenOverride, setScreen] = useState<Screen | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proposal = query.data;
  const status = proposal?.status;
  const notFound =
    query.error instanceof ApiError && query.error.code === "NOT_FOUND";
  const unavailable = notFound || status === "draft";
  const screen: Screen =
    screenOverride ?? (status === "paid" ? "confirm" : "main");

  const target = status ? nextStatus(status) : null;
  const action =
    target && MEMBER_TARGETS.includes(target)
      ? { target, label: MEMBER_ACTION_LABELS[target] ?? target }
      : null;

  const fail = (cause: unknown) =>
    setError(
      cause instanceof ApiError
        ? cause.message
        : "Something went wrong. Please try again.",
    );

  const approveProposal = async () => {
    setError(null);
    setScreen("main");
    setShowDetails(false);
    setPhase("collapse");
    try {
      await approve.mutateAsync(id);
    } catch (cause) {
      fail(cause);
    }
    await wait(COLLAPSE_MS);
    setPhase(null);
    scrollToTop();
  };

  const payProposal = async () => {
    setError(null);
    setScreen("main");
    setShowDetails(false);
    setPhase("lock");
    try {
      await pay.mutateAsync(id);
      await wait(LOCK_MS);
      setScreen("confirm");
      scrollToTop();
    } catch (cause) {
      fail(cause);
    } finally {
      setPhase(null);
    }
  };

  return {
    proposal,
    status,
    isPending: query.isPending,
    unavailable,
    loadFailed: query.isError && !notFound,
    retry: () => void query.refetch(),
    screen,
    phase,
    error,
    busy: approve.isPending || pay.isPending || phase === "lock",
    action,
    run: () => {
      if (action?.target === "approved") void approveProposal();
      else if (action?.target === "paid") void payProposal();
    },
    showDetails,
    toggleDetails: () => setShowDetails((open) => !open),
    showConfirmation: () => {
      setScreen("confirm");
      scrollToTop();
    },
    backToItinerary: () => {
      setScreen("main");
      setShowDetails(true);
      scrollToTop();
    },
  };
};

export type MemberProposalState = ReturnType<typeof useMemberProposal>;
