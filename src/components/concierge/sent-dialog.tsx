import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientLink } from "@/hooks/use-client-link";
import { formatStamp } from "@/lib/proposals/format";
import type { SendProposalResult } from "@/lib/schemas/proposal";

export const SentDialog = ({
  result,
  onClose,
}: {
  result: SendProposalResult | null;
  onClose: () => void;
}) => {
  const member = result?.reservation.member;
  const clientLink = useClientLink(result?.id ?? null);

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-dvh overflow-y-auto sm:max-w-xl"
      >
        {result && member && (
          <>
            <div className="flex flex-col items-center pt-4 text-center">
              <div className="bg-primary text-primary-foreground motion-safe:animate-in motion-safe:zoom-in-50 flex size-16 items-center justify-center rounded-full motion-safe:duration-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="size-8"
                >
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    pathLength={1}
                    className="draw-check"
                  />
                </svg>
              </div>
              <DialogTitle className="mt-4.5 text-3xl font-semibold tracking-tight">
                Proposal sent
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                {member.name} will find it in their inbox. Editing is now
                locked.
              </DialogDescription>
            </div>
            <dl className="border-input overflow-hidden rounded-2xl border text-sm">
              <div className="flex gap-2.5 border-b px-4 py-3">
                <dt className="text-muted-foreground w-16 shrink-0">To</dt>
                <dd className="min-w-0 break-words">
                  {member.name} &lt;{result.sentEmail.toEmail}&gt;
                </dd>
              </div>
              <div className="flex gap-2.5 border-b px-4 py-3">
                <dt className="text-muted-foreground w-16 shrink-0">Sent</dt>
                <dd>{formatStamp(result.sentEmail.sentAt)}</dd>
              </div>
              <div className="bg-field max-h-56 overflow-auto p-4 leading-relaxed whitespace-pre-line">
                {result.sentEmail.bodyPreview}
              </div>
            </dl>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">Client link</span>
              <div className="flex gap-2">
                <Input
                  readOnly
                  aria-label="Client link"
                  value={clientLink.url}
                  onFocus={(event) => event.target.select()}
                />
                <Button variant="outline" onClick={clientLink.copy}>
                  {clientLink.copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
