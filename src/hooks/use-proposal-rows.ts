import { latestActivity } from "@/lib/proposals/format";
import {
  PROPOSAL_STATUSES,
  type ProposalStatus,
  type ProposalSummary,
} from "@/lib/schemas/proposal";
import type { Reservation } from "@/lib/schemas/reservation";

import { useProposalList } from "./use-proposal-list";
import { useReservations } from "./use-reservations";

export type ProposalRow = {
  summary: ProposalSummary;
  reservation: Reservation;
  activity: { at: string; label: string };
};

export const useProposalRows = () => {
  const proposals = useProposalList();
  const reservations = useReservations();

  const byReservation = new Map(
    (reservations.data ?? []).map((reservation) => [
      reservation.id,
      reservation,
    ]),
  );

  const rows: ProposalRow[] = (proposals.data ?? [])
    .flatMap((summary) => {
      const reservation = byReservation.get(summary.reservationId);
      return reservation
        ? [{ summary, reservation, activity: latestActivity(summary) }]
        : [];
    })
    .sort((first, second) =>
      second.activity.at.localeCompare(first.activity.at),
    );

  const counts = Object.fromEntries(
    PROPOSAL_STATUSES.map((status) => [
      status,
      rows.filter((row) => row.summary.status === status).length,
    ]),
  ) as Record<ProposalStatus, number>;

  const refetch = () => {
    void proposals.refetch();
    void reservations.refetch();
  };

  return {
    rows,
    counts,
    isPending: proposals.isPending || reservations.isPending,
    isError: proposals.isError || reservations.isError,
    refetch,
  };
};
