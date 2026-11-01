import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import { queryKeys } from "./query-keys";

export const useProposalList = () => {
  return useQuery({
    queryKey: queryKeys.proposalList,
    queryFn: () => apiClient.listProposals(),
    select: (data) => data.items,
  });
};
