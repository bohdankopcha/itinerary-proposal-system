import { CoastLine } from "@/components/member/coast-line";
import { PassField } from "@/components/member/pass-field";
import { formatDayLong, formatMoney } from "@/lib/proposals/format";
import type { Reservation } from "@/lib/schemas/reservation";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export const TripPass = ({
  reservation,
  itemCount,
  totalCents,
  paid,
  stamping,
}: {
  reservation: Reservation;
  itemCount: number;
  totalCents: number;
  paid: boolean;
  stamping: boolean;
}) => {
  const place = reservation.destination.split(",")[0];

  return (
    <article
      aria-label="Trip pass"
      className="from-trip-from via-trip-via to-trip-to text-primary-foreground motion-safe:animate-trip-in relative overflow-hidden rounded-3xl bg-linear-140 via-55% px-5.5 pt-5.5 pb-5 shadow-2xl"
    >
      <CoastLine className="pointer-events-none absolute top-4.5 -right-9 h-auto w-68 opacity-40" />
      <div
        aria-hidden
        className="from-primary-foreground/25 pointer-events-none absolute inset-0 bg-linear-to-bl via-transparent via-55% to-transparent"
      />
      <div
        aria-hidden
        className="via-primary-foreground/30 motion-safe:animate-shine pointer-events-none absolute inset-y-0 w-2/5 -skew-x-12 bg-linear-100 from-transparent to-transparent"
      />
      <div className="relative flex items-center justify-between text-xs font-medium tracking-widest uppercase">
        <span>Trip pass</span>
        <span className="border-primary-foreground/30 bg-primary-foreground/15 inline-flex h-6.5 items-center rounded-full border px-2.5">
          {paid ? "Paid" : "Approved"}
        </span>
      </div>
      <div className="relative mt-6.5 mb-1.5 text-5xl leading-[0.95] font-semibold tracking-tighter">
        {place}
      </div>
      <div className="text-primary-foreground/90 relative">
        {reservation.villa} · {reservation.member.name}
      </div>
      <dl className="border-primary-foreground/40 relative mt-5.5 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-dashed pt-4.5">
        <PassField
          label="Arrive"
          value={formatDayLong(reservation.arrivalDate)}
        />
        <PassField
          label="Depart"
          value={formatDayLong(reservation.departureDate)}
        />
        <PassField label="Experiences" value={String(itemCount)} />
        <PassField label="Total" value={formatMoney(totalCents)} large />
      </dl>
      {paid && (
        <div
          className={cn(
            "border-primary-foreground/90 bg-primary-foreground/10 absolute right-4.5 bottom-5 flex -rotate-8 items-center gap-2 rounded-2xl border-2 px-3.5 py-2.5 text-sm font-semibold tracking-widest uppercase",
            stamping && "animate-stamp-in",
          )}
        >
          <Lock aria-hidden className="size-3.5" />
          Locked
        </div>
      )}
    </article>
  );
};
