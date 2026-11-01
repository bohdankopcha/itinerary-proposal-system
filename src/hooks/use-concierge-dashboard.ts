import { useState } from "react";

import { toDraftItems } from "@/lib/proposals/draft";

import { useCommandPalette } from "./use-command-palette";
import { useConciergeParams, type ConciergeView } from "./use-concierge-params";
import { useDraftBuilder } from "./use-draft-builder";
import { useItemEditor } from "./use-item-editor";
import { usePlannerDrag } from "./use-planner-drag";
import { usePlannerResize } from "./use-planner-resize";
import { useProposal } from "./use-proposal";
import { useProposalActions } from "./use-proposal-actions";
import { useProposalList } from "./use-proposal-list";
import { useReservations } from "./use-reservations";

export function useConciergeDashboard() {
  const params = useConciergeParams();
  const reservationsQuery = useReservations();
  const proposalListQuery = useProposalList();
  const proposalCount = proposalListQuery.data?.length ?? 0;

  const reservations = reservationsQuery.data ?? [];
  const reservation =
    reservations.find((item) => item.id === params.reservationParam) ??
    reservations[0];

  const defaultDraft = proposalListQuery.data
    ?.filter(
      (item) =>
        item.reservationId === reservation?.id && item.status === "draft",
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const resolvingDefault =
    params.proposalParam === null && proposalListQuery.isPending;
  const proposalId =
    params.proposalParam === NEW_PROPOSAL
      ? null
      : (params.proposalParam ?? defaultDraft?.id ?? null);

  const proposalQuery = useProposal(reservation ? proposalId : null);
  const proposal = proposalQuery.data;

  const builder = useDraftBuilder({
    reservationId: reservation?.id ?? "",
    proposalId,
    proposal,
  });

  const status = proposal?.status ?? "draft";
  const locked = status !== "draft";
  const items =
    locked && proposal ? toDraftItems(proposal.items) : builder.items;
  const notes = locked && proposal ? (proposal.notes ?? "") : builder.notes;

  const [page, setPage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  const actions = useProposalActions({
    reservationId: reservation?.id ?? "",
    proposalId,
    builder,
    onSaved: (id) => {
      if (id !== proposalId) params.update({ proposal: id });
    },
  });

  const editor = useItemEditor({
    reservation: reservation ?? EMPTY_RESERVATION,
    items,
    builder,
    locked,
    onItemPlaced: setPage,
  });

  function guarded(navigate: () => void) {
    const run = () => {
      actions.clearNotice();
      setPage(0);
      navigate();
    };
    if (builder.dirty && !locked) setPendingNavigation(() => run);
    else run();
  }

  const drag = usePlannerDrag({ locked, builder, onMoved: editor.flash });

  const resize = usePlannerResize({
    locked,
    builder,
    onResized: editor.flash,
  });

  const setView = (view: ConciergeView) =>
    params.update({ view: view === "proposals" ? "proposals" : null });
  const selectReservation = (id: string) => {
    if (id === reservation?.id) return;
    guarded(() => params.update({ reservation: id, proposal: null }));
  };
  const startNewProposal = () =>
    guarded(() => {
      if (proposalId === null) builder.reset();
      params.update({ proposal: NEW_PROPOSAL, view: null });
    });
  const canSend = !locked && items.length > 0 && !actions.isPending;

  const palette = useCommandPalette({
    reservation,
    reservations,
    items,
    status,
    view: params.view,
    canSend,
    onOpen: editor.close,
    onAddItem: () => editor.openNew(),
    onQuickAdd: editor.quickAdd,
    onPreview: () => setPreviewOpen(true),
    onSend: actions.send,
    onViewChange: setView,
    onNewProposal: startNewProposal,
    onSelectReservation: selectReservation,
  });

  return {
    reservationsQuery,
    reservations,
    reservation,
    proposalCount,
    view: params.view,
    proposalId,
    proposalQuery,
    proposalLoading:
      resolvingDefault || (proposalId !== null && proposalQuery.isPending),
    proposalFailed: proposalId !== null && proposalQuery.isError,
    proposal,
    status,
    locked,
    canSend,
    items,
    notes,
    builder,
    editor,
    drag,
    resize,
    palette,
    actions,
    page,
    setPage,
    previewOpen,
    setPreviewOpen,
    setView,
    selectReservation,
    startNewProposal,
    openProposal: (reservationId: string, id: string) =>
      guarded(() =>
        params.update({ reservation: reservationId, proposal: id, view: null }),
      ),
    discard: {
      open: pendingNavigation !== null,
      confirm: () => {
        pendingNavigation?.();
        setPendingNavigation(null);
      },
      cancel: () => setPendingNavigation(null),
    },
  };
}

const NEW_PROPOSAL = "new";

const EMPTY_RESERVATION = {
  id: "",
  destination: "",
  villa: "",
  arrivalDate: "1970-01-01",
  departureDate: "1970-01-01",
  arrivalMinutes: null,
  departureMinutes: null,
  member: { id: "", name: "", email: "" },
};

export type ConciergeDashboardState = ReturnType<typeof useConciergeDashboard>;
