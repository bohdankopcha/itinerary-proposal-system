import type { QueryClient } from "@tanstack/react-query";

import type {
  Proposal,
  ProposalList,
  ProposalStatus,
} from "@/lib/schemas/proposal";

import { queryKeys } from "./query-keys";

/** Writes `status` into the detail and list caches and returns a function that restores the previous values. */
export const applyOptimisticStatus = async (
  queryClient: QueryClient,
  id: string,
  status: ProposalStatus,
) => {
  await queryClient.cancelQueries({ queryKey: queryKeys.proposals });

  const previousDetail = queryClient.getQueryData<Proposal>(
    queryKeys.proposal(id),
  );
  const previousList = queryClient.getQueryData<ProposalList>(
    queryKeys.proposalList,
  );

  queryClient.setQueryData<Proposal>(queryKeys.proposal(id), (current) =>
    current ? { ...current, status } : current,
  );
  queryClient.setQueryData<ProposalList>(queryKeys.proposalList, (current) =>
    current
      ? {
          items: current.items.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        }
      : current,
  );

  const rollback = () => {
    queryClient.setQueryData(queryKeys.proposal(id), previousDetail);
    queryClient.setQueryData(queryKeys.proposalList, previousList);
  };

  return rollback;
};
