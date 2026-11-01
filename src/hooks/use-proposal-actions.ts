import { useState } from "react";

import { ApiError } from "@/lib/api-client";
import { toItemInputs } from "@/lib/proposals/draft";
import type { SendProposalResult } from "@/lib/schemas/proposal";

import type { DraftBuilder } from "./use-draft-builder";
import { useSaveDraft } from "./use-save-draft";
import { useSendProposal } from "./use-send-proposal";

export type Notice = { tone: "success" | "error"; message: string };

const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : "Something went wrong. Try again.";

export function useProposalActions({
  reservationId,
  proposalId,
  builder,
  onSaved,
}: {
  reservationId: string;
  proposalId: string | null;
  builder: DraftBuilder;
  onSaved: (id: string) => void;
}) {
  const saveDraft = useSaveDraft();
  const sendProposal = useSendProposal();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [sentResult, setSentResult] = useState<SendProposalResult | null>(null);

  async function persist() {
    const proposal = await saveDraft.mutateAsync({
      proposalId,
      reservationId,
      notes: builder.notes,
      items: toItemInputs(builder.items),
    });
    builder.markClean();
    onSaved(proposal.id);
    return proposal;
  }

  async function save() {
    setNotice(null);
    try {
      await persist();
    } catch (error) {
      setNotice({ tone: "error", message: errorMessage(error) });
    }
  }

  async function send() {
    setNotice(null);
    try {
      const needsSave = proposalId === null || builder.dirty;
      const id = needsSave ? (await persist()).id : proposalId;
      setSentResult(await sendProposal.mutateAsync(id));
    } catch (error) {
      setNotice({ tone: "error", message: errorMessage(error) });
    }
  }

  return {
    notice,
    sentResult,
    isPending: saveDraft.isPending || sendProposal.isPending,
    save,
    send,
    clearNotice: () => setNotice(null),
    dismissSent: () => setSentResult(null),
  };
}

export type ProposalActions = ReturnType<typeof useProposalActions>;
