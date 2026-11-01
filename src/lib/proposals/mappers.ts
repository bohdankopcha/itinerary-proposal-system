import type { Prisma } from "@/generated/prisma/client";
import {
  itemCategorySchema,
  proposalStatusSchema,
  type Proposal,
  type ProposalSummary,
  type SentEmail,
} from "@/lib/schemas/proposal";
import type { Reservation } from "@/lib/schemas/reservation";

import { totalCents } from "./totals";

export const proposalInclude = {
  items: { orderBy: [{ scheduledAt: "asc" }, { id: "asc" }] },
  reservation: { include: { member: true } },
} satisfies Prisma.ProposalInclude;

export type ProposalRow = Prisma.ProposalGetPayload<{
  include: typeof proposalInclude;
}>;
export type ReservationRow = Prisma.ReservationGetPayload<{
  include: { member: true };
}>;
type SummaryRow = Prisma.ProposalGetPayload<{
  include: { items: { select: { priceCents: true } } };
}>;
type SentEmailRow = Prisma.SentEmailGetPayload<object>;

export const toStatus = (value: string) => proposalStatusSchema.parse(value);

const iso = (date: Date | null) => (date ? date.toISOString() : null);
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const toReservation = (row: ReservationRow): Reservation => ({
  id: row.id,
  destination: row.destination,
  villa: row.villa,
  arrivalDate: isoDate(row.arrivalDate),
  departureDate: isoDate(row.departureDate),
  arrivalMinutes: row.arrivalMinutes,
  departureMinutes: row.departureMinutes,
  member: { id: row.member.id, name: row.member.name, email: row.member.email },
});

export const toProposal = (row: ProposalRow): Proposal => ({
  id: row.id,
  status: proposalStatusSchema.parse(row.status),
  notes: row.notes,
  totalCents: totalCents(row.items),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  sentAt: iso(row.sentAt),
  approvedAt: iso(row.approvedAt),
  paidAt: iso(row.paidAt),
  reservation: toReservation(row.reservation),
  items: row.items.map((item) => ({
    id: item.id,
    category: itemCategorySchema.parse(item.category),
    title: item.title,
    description: item.description,
    scheduledAt: item.scheduledAt.toISOString(),
    priceCents: item.priceCents,
    durationMinutes: item.durationMinutes,
  })),
});

export const toProposalSummary = (row: SummaryRow): ProposalSummary => ({
  id: row.id,
  reservationId: row.reservationId,
  status: proposalStatusSchema.parse(row.status),
  notes: row.notes,
  itemCount: row.items.length,
  totalCents: totalCents(row.items),
  createdAt: row.createdAt.toISOString(),
  sentAt: iso(row.sentAt),
  approvedAt: iso(row.approvedAt),
  paidAt: iso(row.paidAt),
});

export const toSentEmail = (row: SentEmailRow): SentEmail => ({
  id: row.id,
  proposalId: row.proposalId,
  toEmail: row.toEmail,
  bodyPreview: row.bodyPreview,
  sentAt: row.sentAt.toISOString(),
});
