import { useParams, useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";

import { toDraftItems } from "@/lib/proposals/draft";
import type { Reservation } from "@/lib/schemas/reservation";

import type { ConciergeView } from "./concierge-view";
import { useCommandPalette } from "./use-command-palette";
import { useDraftBuilder } from "./use-draft-builder";
import { useItemEditor } from "./use-item-editor";
import { usePlannerDrag } from "./use-planner-drag";
import { usePlannerResize } from "./use-planner-resize";
import { useProposal } from "./use-proposal";
import { useProposalActions } from "./use-proposal-actions";
import { useProposalList } from "./use-proposal-list";
import { useReservations } from "./use-reservations";

export const useConciergeDashboard = () => {
  const router = useRouter();
  const { id: routeProposalId = null } = useParams<{ id?: string }>();
  const [, startTransition] = useTransition();
  const [proposalId, setOptimisticProposalId] = useOptimistic(routeProposalId);
  const [view, setView] = useState<ConciergeView>("itinerary");
  const [draftReservationId, setDraftReservationId] = useState<string | null>(
    null,
  );
  const reservationsQuery = useReservations();
  const proposalListQuery = useProposalList();
  const proposalCount = proposalListQuery.data?.length ?? 0;
  const reservations = reservationsQuery.data ?? NO_RESERVATIONS;

  const proposalQuery = useProposal(proposalId);

  const openReservationId =
    proposalId === null
      ? draftReservationId
      : (proposalListQuery.data?.find((item) => item.id === proposalId)
          ?.reservationId ?? proposalQuery.data?.reservation.id);
  const resolvingReservation =
    proposalId !== null && !openReservationId && !proposalQuery.isError;
  const reservation = resolvingReservation
    ? undefined
    : (reservations.find((item) => item.id === openReservationId) ??
      reservations[0]);

  const navigate = (id: string | null, mode: "push" | "replace" = "push") =>
    startTransition(() => {
      setOptimisticProposalId(id);
      router[mode](id ? `/planning/${id}` : "/planning");
    });

  const proposal = proposalQuery.data;

  const builder = useDraftBuilder({
    reservationId: reservation?.id ?? "",
    proposalId,
    proposal,
  });

  const status = proposal?.status ?? "draft";
  const locked = status !== "draft";
  const lockedItems = useMemo(
    () => (locked && proposal ? toDraftItems(proposal.items) : null),
    [locked, proposal],
  );
  const items = lockedItems ?? builder.items;
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
      if (id !== proposalId) navigate(id, "replace");
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

  const newestProposalId = (reservationId: string) =>
    proposalListQuery.data
      ?.filter((item) => item.reservationId === reservationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.id;
  const selectReservation = (id: string) => {
    if (id === reservation?.id) return;
    guarded(() => {
      const newest = newestProposalId(id);
      if (newest) return navigate(newest);
      setDraftReservationId(id);
      if (proposalId !== null) navigate(null);
    });
  };
  const startNewProposal = () =>
    guarded(() => {
      if (proposalId === null) builder.reset();
      setDraftReservationId(reservation?.id ?? null);
      setView("itinerary");
      if (proposalId !== null) navigate(null);
    });
  const openProposal = (id: string) =>
    guarded(() => {
      setView("itinerary");
      if (id !== proposalId) navigate(id);
    });
  const requestDiscard = () => {
    if (!builder.dirty) return;
    setPendingNavigation(() => () => {
      actions.clearNotice();
      builder.revert();
    });
  };
  const canSend = !locked && items.length > 0 && !actions.isPending;

  const palette = useCommandPalette({
    reservation,
    reservations,
    items,
    status,
    view,
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
    view,
    proposalId,
    proposalQuery,
    resolvingReservation,
    proposalLoading: proposalId !== null && proposalQuery.isPending,
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
    requestDiscard,
    openProposal,
    discard: {
      open: pendingNavigation !== null,
      confirm: () => {
        pendingNavigation?.();
        setPendingNavigation(null);
      },
      cancel: () => setPendingNavigation(null),
    },
  };
};

const NO_RESERVATIONS: Reservation[] = [];

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
