import { useStatusTransition } from "./use-status-transition";

export const usePayProposal = () => useStatusTransition("paid");
