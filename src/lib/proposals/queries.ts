import { db } from "@/lib/db/client";
import type { ProposalList } from "@/lib/schemas/proposal";
import type { ReservationList } from "@/lib/schemas/reservation";

import { notFound } from "./errors";
import {
  proposalInclude,
  toProposal,
  toProposalSummary,
  toReservation,
} from "./mappers";

export const listReservations = async (): Promise<ReservationList> => {
  const rows = await db.reservation.findMany({
    include: { member: true },
    orderBy: [{ arrivalDate: "asc" }, { id: "asc" }],
  });
  return { items: rows.map(toReservation) };
};

export const listProposals = async (filter: {
  reservationId?: string;
}): Promise<ProposalList> => {
  if (filter.reservationId) {
    const reservation = await db.reservation.findUnique({
      where: { id: filter.reservationId },
      select: { id: true },
    });
    if (!reservation) throw notFound("Reservation", filter.reservationId);
  }

  const rows = await db.proposal.findMany({
    where: filter.reservationId
      ? { reservationId: filter.reservationId }
      : undefined,
    include: { items: { select: { priceCents: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return { items: rows.map(toProposalSummary) };
};

export const getProposal = async (id: string) => {
  const row = await db.proposal.findUnique({
    where: { id },
    include: proposalInclude,
  });
  if (!row) throw notFound("Proposal", id);
  return toProposal(row);
};
