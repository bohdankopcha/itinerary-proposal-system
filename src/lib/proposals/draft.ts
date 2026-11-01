import type { ProposalItem, ProposalItemInput } from "@/lib/schemas/proposal";

export type DraftItem = ProposalItemInput & { key: string };

export const newDraftKey = () => `draft-${Math.random().toString(36).slice(2)}`;

export const toDraftItems = (items: ProposalItem[]): DraftItem[] =>
  items.map(
    ({
      id,
      category,
      title,
      description,
      scheduledAt,
      priceCents,
      durationMinutes,
    }) => ({
      key: id,
      category,
      title,
      description,
      scheduledAt,
      priceCents,
      durationMinutes,
    }),
  );

export const toItemInputs = (items: DraftItem[]): ProposalItemInput[] =>
  items.map(
    ({
      category,
      title,
      description,
      scheduledAt,
      priceCents,
      durationMinutes,
    }) => ({
      category,
      title,
      description,
      scheduledAt,
      priceCents,
      durationMinutes,
    }),
  );

export const sortByTime = <T extends { scheduledAt: string }>(items: T[]) =>
  [...items].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
