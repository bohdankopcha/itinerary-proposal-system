export const queryKeys = {
  reservations: ["reservations"] as const,
  proposals: ["proposals"] as const,
  proposalList: ["proposals", "list"] as const,
  proposal: (id: string) => ["proposals", "detail", id] as const,
};
