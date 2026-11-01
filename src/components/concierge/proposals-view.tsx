import { ProposalRow } from "@/components/concierge/proposal-row";
import { PROPOSALS_GRID_STYLE } from "@/components/concierge/proposals-grid";
import { ProposalsStatusCounts } from "@/components/concierge/proposals-status-counts";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Eyebrow } from "@/components/eyebrow";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProposalRows } from "@/hooks/use-proposal-rows";

const COLUMNS = [
  "Proposal",
  "Client",
  "Stay",
  "Dates",
  "Items",
  "Total",
  "Status",
  "Last activity",
];

export function ProposalsView({
  currentProposalId,
  clientName,
  onOpen,
  onNew,
}: {
  currentProposalId: string | null;
  clientName: string;
  onOpen: (reservationId: string, proposalId: string) => void;
  onNew: () => void;
}) {
  const { rows, counts, isPending, isError, refetch } = useProposalRows();

  return (
    <section
      aria-label="Proposals"
      className="flex flex-col gap-7 px-4 pt-6 pb-12 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>All clients</Eyebrow>
          <h1 className="mt-3 text-5xl leading-[0.92] font-semibold tracking-tighter sm:text-7xl">
            Proposals
          </h1>
        </div>
        <ProposalsStatusCounts counts={counts} />
      </div>

      {isError ? (
        <ErrorState
          message="Proposals could not be loaded."
          onAction={refetch}
        />
      ) : isPending ? (
        <Panel
          role="status"
          aria-label="Loading proposals"
          className="flex flex-col gap-2 p-4"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description={`Build the first itinerary for ${clientName} and send it for approval.`}
        >
          <Button onClick={onNew}>Start the first proposal</Button>
        </EmptyState>
      ) : (
        <Panel className="overflow-x-auto p-1.5">
          <div className="min-w-4xl">
            <div
              aria-hidden
              style={PROPOSALS_GRID_STYLE}
              className="text-muted-foreground grid min-h-10 items-center gap-3 px-4 text-xs font-medium tracking-wider uppercase"
            >
              {COLUMNS.map((column) => (
                <span
                  key={column}
                  className={
                    column === "Items" || column === "Total"
                      ? "text-right"
                      : undefined
                  }
                >
                  {column}
                </span>
              ))}
            </div>
            <ul>
              {rows.map((row, index) => (
                <ProposalRow
                  key={row.summary.id}
                  row={row}
                  index={index}
                  current={row.summary.id === currentProposalId}
                  onOpen={() => onOpen(row.reservation.id, row.summary.id)}
                />
              ))}
            </ul>
          </div>
        </Panel>
      )}

      {rows.length > 0 && (
        <div>
          <Button onClick={onNew}>New proposal for {clientName}</Button>
        </div>
      )}
    </section>
  );
}
