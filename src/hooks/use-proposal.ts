import { useQuery } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api-client";

import { queryKeys } from "./query-keys";

export function useProposal(id: string | null) {
  return useQuery({
    queryKey: queryKeys.proposal(id ?? ""),
    queryFn: () => apiClient.getProposal(id ?? ""),
    enabled: id !== null,
    retry: (failures, error) =>
      !(error instanceof ApiError && error.code === "NOT_FOUND") &&
      failures < 1,
  });
}
