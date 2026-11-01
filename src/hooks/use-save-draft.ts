import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { ProposalItemInput } from "@/lib/schemas/proposal";

import { queryKeys } from "./query-keys";

type SaveDraftInput = {
  proposalId: string | null;
  reservationId: string;
  notes: string;
  items: ProposalItemInput[];
};

export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      proposalId,
      reservationId,
      notes,
      items,
    }: SaveDraftInput) =>
      proposalId
        ? apiClient.replaceDraft(proposalId, { notes, items })
        : apiClient.createProposal({ reservationId, notes, items }),
    onSuccess: (proposal) => {
      queryClient.setQueryData(queryKeys.proposal(proposal.id), proposal);
      void queryClient.invalidateQueries({ queryKey: queryKeys.proposalList });
    },
  });
}
