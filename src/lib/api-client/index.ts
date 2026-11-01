import {
  proposalListSchema,
  proposalSchema,
  sendProposalResultSchema,
  type CreateProposalInput,
  type ProposalStatus,
  type ReplaceProposalInput,
} from "@/lib/schemas/proposal";
import { reservationListSchema } from "@/lib/schemas/reservation";

import { createRequester } from "./request";

export { ApiError } from "./api-error";

export const createApiClient = (baseUrl = "") => {
  const request = createRequester(baseUrl);
  const proposalPath = (id: string) =>
    `/api/proposals/${encodeURIComponent(id)}`;

  return {
    listReservations: () => request(reservationListSchema, "/api/reservations"),

    listProposals: (reservationId?: string) =>
      request(
        proposalListSchema,
        reservationId
          ? `/api/proposals?reservationId=${encodeURIComponent(reservationId)}`
          : "/api/proposals",
      ),

    getProposal: (id: string) => request(proposalSchema, proposalPath(id)),

    createProposal: (input: CreateProposalInput) =>
      request(proposalSchema, "/api/proposals", {
        method: "POST",
        body: input,
      }),

    replaceDraft: (id: string, input: ReplaceProposalInput) =>
      request(proposalSchema, proposalPath(id), { method: "PUT", body: input }),

    updateStatus: (id: string, status: ProposalStatus) =>
      request(proposalSchema, proposalPath(id), {
        method: "PATCH",
        body: { status },
      }),

    sendProposal: (id: string) =>
      request(sendProposalResultSchema, `${proposalPath(id)}/send`, {
        method: "POST",
      }),
  };
};

export const apiClient = createApiClient();
