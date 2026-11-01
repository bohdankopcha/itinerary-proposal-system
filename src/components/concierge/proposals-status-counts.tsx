import { StatusBadge } from "@/components/status-badge";
import { PROPOSAL_STATUSES, type ProposalStatus } from "@/lib/schemas/proposal";

export const ProposalsStatusCounts = ({
  counts,
}: {
  counts: Record<ProposalStatus, number>;
}) => {
  return (
    <dl className="flex flex-wrap gap-7">
      {PROPOSAL_STATUSES.map((status) => (
        <div key={status} className="flex flex-col items-start gap-2.5">
          <dd className="order-first text-5xl leading-[0.85] font-medium tracking-tighter tabular-nums">
            {counts[status]}
          </dd>
          <dt>
            <StatusBadge status={status} />
          </dt>
        </div>
      ))}
    </dl>
  );
};
