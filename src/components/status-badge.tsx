import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/proposals/format";
import type { ProposalStatus } from "@/lib/schemas/proposal";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ProposalStatus, { badge: string; dot: string }> = {
  draft: { badge: "", dot: "border border-muted-foreground" },
  sent: { badge: "", dot: "bg-status-sent" },
  approved: { badge: "", dot: "bg-status-approved" },
  paid: {
    badge: "border-foreground bg-foreground text-background",
    dot: "bg-background",
  },
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: ProposalStatus;
  label?: string;
  className?: string;
}) {
  const styles = STATUS_STYLES[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-input text-foreground h-7 gap-2 px-2.5 text-xs font-medium transition-colors duration-300",
        styles.badge,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", styles.dot)}
      />
      {label ?? STATUS_LABELS[status]}
    </Badge>
  );
}
