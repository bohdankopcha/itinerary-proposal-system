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
export function useDraftBuilder({
  reservationId,
  proposalId,
  proposal,
}: {
  reservationId: string;
  proposalId: string | null;
  proposal: Proposal | undefined;
}) {
  const sourceKey = `${reservationId}:${proposalId ?? "new"}`;
  const ready = proposalId === null || proposal !== undefined;

  const [state, setState] = useState<BuilderState>(() =>
    ready ? fromProposal(sourceKey, proposal) : fromProposal(""),
  );

  if (ready && state.sourceKey !== sourceKey) {
    setState(fromProposal(sourceKey, proposal));
  }

  function edit(change: (current: BuilderState) => Partial<BuilderState>) {
    setState((current) => ({ ...current, ...change(current), dirty: true }));
  }

  return {
    items: state.items,
    notes: state.notes,
    dirty: state.dirty,
    addItem(item: Omit<DraftItem, "key">) {
      const key = newDraftKey();
      edit((current) => ({ items: [...current.items, { ...item, key }] }));
      return key;
    },
    updateItem(key: string, item: Omit<DraftItem, "key">) {
      edit((current) => ({
        items: current.items.map((existing) =>
          existing.key === key ? { ...item, key } : existing,
        ),
      }));
    },
    removeItem(key: string) {
      edit((current) => ({
        items: current.items.filter((existing) => existing.key !== key),
      }));
    },
    setNotes(notes: string) {
      edit(() => ({ notes }));
    },
    markClean() {
      setState((current) => ({ ...current, dirty: false }));
    },
    reset() {
      setState(fromProposal(sourceKey));
    },
  };
}

export type DraftBuilder = ReturnType<typeof useDraftBuilder>;
