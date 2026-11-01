import { useStatusTransition } from "./use-status-transition";

export const useApproveProposal = () => useStatusTransition("approved");
