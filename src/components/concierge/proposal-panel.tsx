import { CategoryBreakdown } from "@/components/concierge/category-breakdown";
import { Eyebrow } from "@/components/eyebrow";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProposalActions } from "@/hooks/use-proposal-actions";
import type { DraftItem } from "@/lib/proposals/draft";
import {
  STATUS_LABELS,
  formatMoney,
  formatStamp,
} from "@/lib/proposals/format";
import { plannedDayCount } from "@/lib/proposals/itinerary";
import { categoryBreakdown, totalCents } from "@/lib/proposals/totals";
import { tripDates } from "@/lib/proposals/trip-days";
import type { Proposal, ProposalStatus } from "@/lib/schemas/proposal";
import type { Reservation } from "@/lib/schemas/reservation";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

function lockMessage(status: ProposalStatus, proposal: Proposal | undefined) {
  if (status === "sent")
    return `${proposal?.sentAt ? `Sent ${formatStamp(proposal.sentAt)}. ` : ""}Locked for editing while the client reviews.`;
  if (status === "approved") return "Approved by the client. Awaiting payment.";
  return "Paid and locked in.";
}

export function ProposalPanel({
  reservation,
  proposal,
  proposalId,
  status,
  items,
  notes,
  actions,
  onNotesChange,
  onPreview,
  dirty,
  onDiscard,
}: {
  reservation: Reservation;
  proposal: Proposal | undefined;
  proposalId: string | null;
  status: ProposalStatus;
  items: DraftItem[];
  notes: string;
  actions: ProposalActions;
  onNotesChange: (notes: string) => void;
  onPreview: () => void;
  dirty: boolean;
  onDiscard: () => void;
}) {
  const locked = status !== "draft";
  const total = totalCents(items);
  const dayCount = tripDates(
    reservation.arrivalDate,
    reservation.departureDate,
  ).length;
  const planned = plannedDayCount(items, reservation.arrivalDate);
  const firstName = reservation.member.name.split(" ")[0];
  const draftCue = dirty
    ? "Unsaved changes: only on this screen until you save"
    : proposalId === null
      ? "New draft: nothing saved yet"
      : "All changes saved";
  const canSave = dirty && items.length > 0 && !actions.isPending;
  const canSend = !locked && items.length > 0 && !actions.isPending;

  return (
    <Panel
      as="aside"
      aria-label="Proposal"
      className="flex w-full flex-col gap-4 overflow-y-auto p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Proposal</h2>
          <p className="text-muted-foreground text-sm">
            {proposalId === null
              ? "New draft"
              : locked
                ? "Viewing proposal"
                : "Editing draft"}
            {` for ${reservation.member.name}, ${reservation.destination.split(",")[0]}`}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="proposal-note">Personal note to {firstName}</Label>
        <Textarea
          id="proposal-note"
          rows={4}
          maxLength={2000}
          disabled={locked}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="A few words from you, shown at the top of the client’s itinerary"
        />
      </div>

      <div>
        <Eyebrow>Estimated total</Eyebrow>
        <div className="my-2 text-5xl leading-[0.9] font-medium tracking-tighter tabular-nums">
          {formatMoney(total)}
        </div>
        <p className="text-muted-foreground text-sm">
          {items.length} {items.length === 1 ? "item" : "items"} · {planned} of{" "}
          {dayCount} days planned
        </p>
      </div>

      <CategoryBreakdown entries={categoryBreakdown(items)} />

      {locked && (
        <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm">
          <Lock aria-hidden className="size-3.5 shrink-0" />
          <span>{lockMessage(status, proposal)}</span>
        </div>
      )}

      <div aria-live="polite">
        {actions.notice && (actions.notice.tone === "error" || !locked) && (
          <p
            className={cn(
              "text-sm",
              actions.notice.tone === "error"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
            role={actions.notice.tone === "error" ? "alert" : undefined}
          >
            {actions.notice.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {!locked && (
          <>
            <p
              className={cn(
                "text-sm",
                dirty ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {draftCue}
            </p>
            <Button
              variant="outline"
              className="border-input"
              disabled={!canSave}
              onClick={actions.save}
            >
              Save draft
            </Button>
            {dirty && (
              <Button variant="ghost" onClick={onDiscard}>
                Discard changes
              </Button>
            )}
          </>
        )}
        <Button variant="outline" className="border-input" onClick={onPreview}>
          Preview
        </Button>
        <Button disabled={!canSend} onClick={actions.send}>
          {locked
            ? STATUS_LABELS[status]
            : actions.isPending
              ? "Working…"
              : "Send to client"}
        </Button>
      </div>
    </Panel>
  );
}
