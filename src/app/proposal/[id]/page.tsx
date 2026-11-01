import type { Metadata } from "next";
import { Suspense } from "react";

import { MemberProposal } from "@/components/member/member-proposal";
import { MemberShell } from "@/components/member/member-shell";
import { MemberSkeleton } from "@/components/member/member-skeleton";

export const metadata: Metadata = {
  title: "Your itinerary · Detour",
  description: "Review, approve and lock in your private itinerary.",
};

const ProposalContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <MemberProposal id={id} />;
};

const ProposalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  return (
    <Suspense
      fallback={
        <MemberShell>
          <MemberSkeleton />
        </MemberShell>
      }
    >
      <ProposalContent params={params} />
    </Suspense>
  );
};

export default ProposalPage;
