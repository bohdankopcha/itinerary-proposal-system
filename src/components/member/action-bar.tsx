import { Eyebrow } from "@/components/eyebrow";
import { formatMoney } from "@/lib/proposals/format";

export function ActionBar({
  totalLabel,
  totalCents,
  error,
  children,
}: {
  totalLabel: string;
  totalCents: number;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3 pb-3">
      <div className="border-panel-border bg-popover/90 pointer-events-auto mx-auto flex max-w-xl flex-col gap-2 rounded-3xl border p-3 pl-5 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Eyebrow>{totalLabel}</Eyebrow>
            <span className="text-3xl leading-none font-medium tracking-tighter tabular-nums">
              {formatMoney(totalCents)}
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
