"use client";

import { ErrorState } from "@/components/error-state";
import { ActionBar } from "@/components/member/action-bar";
import { ConfirmationScreen } from "@/components/member/confirmation-screen";
import { MemberMain } from "@/components/member/member-main";
import { MemberShell } from "@/components/member/member-shell";
import { MemberSkeleton } from "@/components/member/member-skeleton";
import { MemberUnavailable } from "@/components/member/member-unavailable";
import { Button } from "@/components/ui/button";
import { useMemberProposal } from "@/hooks/use-member-proposal";
import { Lock } from "lucide-react";

export const MemberProposal = ({ id }: { id: string }) => {
  const member = useMemberProposal(id);
  const { proposal } = member;

  if (member.isPending)
    return (
      <MemberShell>
        <MemberSkeleton />
      </MemberShell>
    );

  if (member.loadFailed)
    return (
      <MemberShell>
        <ErrorState
          message="Your itinerary could not be loaded."
          onAction={member.retry}
        />
      </MemberShell>
    );

  if (member.unavailable || !proposal)
    return (
      <MemberShell>
        <MemberUnavailable />
      </MemberShell>
    );

  const confirming = member.screen === "confirm";
  const paid = proposal.status === "paid";

  return (
    <MemberShell>
      {confirming ? (
        <ConfirmationScreen proposal={proposal} />
      ) : (
        <MemberMain proposal={proposal} member={member} />
      )}
      <ActionBar
        totalLabel={
          paid
            ? "Paid"
            : proposal.status === "approved"
              ? "Total to lock in"
              : "Estimated total"
        }
        totalCents={proposal.totalCents}
        error={member.error}
      >
        {confirming ? (
          <Button
            variant="outline"
            size="action"
            className="border-input"
            onClick={member.backToItinerary}
          >
            Back to itinerary
          </Button>
        ) : member.action ? (
          <Button size="action" disabled={member.busy} onClick={member.run}>
            {member.action.target === "paid" && <Lock aria-hidden />}
            {member.action.label}
          </Button>
        ) : paid ? (
          <Button
            size="action"
            disabled={member.busy}
            onClick={member.showConfirmation}
          >
            View confirmation
          </Button>
        ) : null}
      </ActionBar>
    </MemberShell>
  );
};
