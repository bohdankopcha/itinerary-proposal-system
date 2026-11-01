import { Eyebrow } from "@/components/eyebrow";
import { ProposalPresentation } from "@/components/proposal/proposal-presentation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DraftItem } from "@/lib/proposals/draft";
import type { Reservation } from "@/lib/schemas/reservation";

export function PreviewDialog({
  open,
  onOpenChange,
  reservation,
  items,
  notes,
  sendLabel,
  canSend,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
  items: DraftItem[];
  notes: string;
  sendLabel: string;
  canSend: boolean;
  onSend: () => void;
}) {
  const firstName = reservation.member.name.split(" ")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <Eyebrow>Preview</Eyebrow>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            What {firstName} will see
          </DialogTitle>
          <DialogDescription className="sr-only">
            The itinerary as the client receives it.
          </DialogDescription>
        </DialogHeader>
        <ProposalPresentation
          reservation={reservation}
          notes={notes}
          items={items}
        />
        <DialogFooter>
          <Button
            variant="outline"
            className="border-input"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            disabled={!canSend}
            onClick={() => {
              onOpenChange(false);
              onSend();
            }}
          >
            {sendLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
