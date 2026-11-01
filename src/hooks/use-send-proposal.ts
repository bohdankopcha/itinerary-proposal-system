import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";
import { proposalSchema } from "@/lib/schemas/proposal";

import { applyOptimisticStatus } from "./optimistic-status";
import { queryKeys } from "./query-keys";

export const useSendProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.sendProposal(id),
    onMutate: async (id) => ({
      rollback: await applyOptimisticStatus(queryClient, id, "sent"),
    }),
    onError: (error, _id, context) => {
      context?.rollback();
      if (error instanceof ApiError && error.code === "INVALID_TRANSITION") {
        void queryClient.invalidateQueries({ queryKey: queryKeys.proposals });
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        queryKeys.proposal(result.id),
        proposalSchema.parse(result),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals }),
  });
};
