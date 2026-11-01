import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DiscardDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Discard unsaved changes?
          </DialogTitle>
          <DialogDescription>
            The proposal you are building has changes that were not saved.
            Continuing will discard them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="border-input" onClick={onCancel}>
            Keep editing
          </Button>
          <Button onClick={onConfirm}>Discard changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
