import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import type { ProposalStatus } from "@/lib/schemas/proposal";

import { applyOptimisticStatus } from "./optimistic-status";
import { queryKeys } from "./query-keys";

export function useStatusTransition(target: ProposalStatus) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.updateStatus(id, target),
    onMutate: async (id) => ({
      rollback: await applyOptimisticStatus(queryClient, id, target),
    }),
    onError: (error, _id, context) => {
      context?.rollback();
      if (error instanceof ApiError && error.code === "INVALID_TRANSITION") {
        void queryClient.invalidateQueries({ queryKey: queryKeys.proposals });
      }
    },
    onSuccess: (proposal) => {
      queryClient.setQueryData(queryKeys.proposal(proposal.id), proposal);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals }),
  });
}
