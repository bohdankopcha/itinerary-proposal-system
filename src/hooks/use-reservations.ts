import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import { queryKeys } from "./query-keys";

export const useReservations = () => {
  return useQuery({
    queryKey: queryKeys.reservations,
    queryFn: apiClient.listReservations,
    select: (data) => data.items,
  });
};
