import { useState } from "react";

import {
  newDraftKey,
  toDraftItems,
  type DraftItem,
} from "@/lib/proposals/draft";
import type { Proposal } from "@/lib/schemas/proposal";

type BuilderState = {
  sourceKey: string;
  items: DraftItem[];
  notes: string;
  dirty: boolean;
};

const fromProposal = (
  sourceKey: string,
  proposal?: Proposal,
): BuilderState => ({
  sourceKey,
  items: proposal ? toDraftItems(proposal.items) : [],
  notes: proposal?.notes ?? "",
  dirty: false,
});

/**
 * Local working copy of the proposal being built. It is re-seeded whenever the
 * selected reservation or proposal changes, never while the same one stays open.
 */
export const useDraftBuilder = ({
  reservationId,
  proposalId,
  proposal,
}: {
  reservationId: string;
  proposalId: string | null;
  proposal: Proposal | undefined;
}) => {
  const sourceKey = `${reservationId}:${proposalId ?? "new"}`;
  const ready = proposalId === null || proposal !== undefined;

  const [state, setState] = useState<BuilderState>(() =>
    ready ? fromProposal(sourceKey, proposal) : fromProposal(""),
  );

  if (ready && state.sourceKey !== sourceKey) {
    setState(fromProposal(sourceKey, proposal));
  }

  const edit = (change: (current: BuilderState) => Partial<BuilderState>) =>
    setState((current) => ({ ...current, ...change(current), dirty: true }));

  const addItem = (item: Omit<DraftItem, "key">) => {
    const key = newDraftKey();
    edit((current) => ({ items: [...current.items, { ...item, key }] }));
    return key;
  };

  const updateItem = (key: string, item: Omit<DraftItem, "key">) =>
    edit((current) => ({
      items: current.items.map((existing) =>
        existing.key === key ? { ...item, key } : existing,
      ),
    }));

  const removeItem = (key: string) =>
    edit((current) => ({
      items: current.items.filter((existing) => existing.key !== key),
    }));

  const setNotes = (notes: string) => edit(() => ({ notes }));

  const markClean = () => setState((current) => ({ ...current, dirty: false }));

  const reset = () => setState(fromProposal(sourceKey));

  const revert = () => setState(fromProposal(sourceKey, proposal));

  return {
    items: state.items,
    notes: state.notes,
    dirty: state.dirty,
    addItem,
    updateItem,
    removeItem,
    setNotes,
    markClean,
    reset,
    revert,
  };
};

export type DraftBuilder = ReturnType<typeof useDraftBuilder>;
