import { db } from "@/lib/db/client";
import type {
  CreateProposalData,
  ProposalItemInput,
  ProposalStatus,
  ReplaceProposalData,
  SendProposalResult,
} from "@/lib/schemas/proposal";

import { buildEmailBody } from "./email";
import { DomainError, invalidTransition, notFound } from "./errors";
import { proposalInclude, toProposal, toSentEmail, toStatus } from "./mappers";
import { getProposal } from "./queries";
import { MEMBER_TARGETS, isEditable, transition } from "./state-machine";
import { validateItemsWithinTrip } from "./trip-window";

const toItemData = (item: ProposalItemInput) => ({
  category: item.category,
  title: item.title,
  description: item.description,
  scheduledAt: new Date(item.scheduledAt),
  priceCents: item.priceCents,
  durationMinutes: item.durationMinutes ?? null,
});

export async function createProposal(input: CreateProposalData) {
  const reservation = await db.reservation.findUnique({
    where: { id: input.reservationId },
  });
  if (!reservation) throw notFound("Reservation", input.reservationId);
  validateItemsWithinTrip(input.items, reservation);

  const created = await db.proposal.create({
    data: {
      reservationId: reservation.id,
      notes: input.notes,
      items: { create: input.items.map(toItemData) },
    },
    select: { id: true },
  });
  return getProposal(created.id);
}

export async function replaceDraft(id: string, input: ReplaceProposalData) {
  const existing = await db.proposal.findUnique({
    where: { id },
    include: { reservation: true },
  });
  if (!existing) throw notFound("Proposal", id);

  const notEditable = () =>
    new DomainError(
      "NOT_EDITABLE",
      `Proposal is "${existing.status}" and can no longer be edited`,
    );
  if (!isEditable(toStatus(existing.status))) throw notEditable();
  validateItemsWithinTrip(input.items, existing.reservation);

  await db.$transaction(async (tx) => {
    const { count } = await tx.proposal.updateMany({
      where: { id, status: "draft" },
      data: { notes: input.notes },
    });
    if (count === 0) throw notEditable();
    await tx.proposalItem.deleteMany({ where: { proposalId: id } });
    await tx.proposalItem.createMany({
      data: input.items.map((item) => ({
        proposalId: id,
        ...toItemData(item),
      })),
    });
  });
  return getProposal(id);
}

const TIMESTAMP_FIELD = { approved: "approvedAt", paid: "paidAt" } as const;

export async function changeStatus(id: string, to: ProposalStatus) {
  const existing = await db.proposal.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!existing) throw notFound("Proposal", id);

  const from = toStatus(existing.status);
  if (!MEMBER_TARGETS.includes(to)) throw invalidTransition(from, to);
  transition(from, to);

  const field = TIMESTAMP_FIELD[to as keyof typeof TIMESTAMP_FIELD];
  const { count } = await db.proposal.updateMany({
    where: { id, status: from },
    data: { status: to, [field]: new Date() },
  });
  if (count === 0) {
    const current = await db.proposal.findUnique({
      where: { id },
      select: { status: true },
    });
    throw invalidTransition(current?.status ?? from, to);
  }
  return getProposal(id);
}

export async function sendProposal(id: string): Promise<SendProposalResult> {
  const to = "sent" as const;

  const { proposal, email } = await db.$transaction(async (tx) => {
    const { count } = await tx.proposal.updateMany({
      where: { id, status: "draft" },
      data: { status: to, sentAt: new Date() },
    });
    if (count === 0) {
      const current = await tx.proposal.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!current) throw notFound("Proposal", id);
      throw invalidTransition(current.status, to);
    }

    const row = await tx.proposal.findUniqueOrThrow({
      where: { id },
      include: proposalInclude,
    });
    if (row.items.length === 0) {
      throw new DomainError(
        "EMPTY_PROPOSAL",
        "A proposal needs at least one item before sending",
      );
    }

    const sentEmail = await tx.sentEmail.create({
      data: {
        proposalId: id,
        toEmail: row.reservation.member.email,
        bodyPreview: buildEmailBody(row),
      },
    });
    return { proposal: row, email: sentEmail };
  });

  console.log(`[email] To: ${email.toEmail}\n${email.bodyPreview}`);
  return { ...toProposal(proposal), sentEmail: toSentEmail(email) };
}
