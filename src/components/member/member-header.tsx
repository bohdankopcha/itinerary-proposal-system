import { Eyebrow } from "@/components/eyebrow";
import { StatusBadge } from "@/components/status-badge";
import { dateParts } from "@/lib/proposals/format";
import { nightsBetween } from "@/lib/proposals/trip-days";
import type { ProposalStatus } from "@/lib/schemas/proposal";
import type { Reservation } from "@/lib/schemas/reservation";

export const MEMBER_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  sent: "Awaiting approval",
  approved: "Approved",
  paid: "Paid · Locked",
};

function DateStat({ label, date }: { label: string; date: string }) {
  const { day, month, weekdayLong } = dateParts(date);
  return (
    <div className="flex flex-col">
      <dt>
        <Eyebrow>{label}</Eyebrow>
      </dt>
      <dd className="flex flex-col">
        <span className="mt-1.5 text-4xl leading-none font-medium tracking-tighter tabular-nums">
          {day}
        </span>
        <span className="text-muted-foreground text-sm">
          {month} · {weekdayLong}
        </span>
      </dd>
    </div>
  );
}

export function MemberHeader({
  reservation,
  status,
}: {
  reservation: Reservation;
  status: ProposalStatus;
}) {
  const place = reservation.destination.split(",")[0];
  const nights = nightsBetween(
    reservation.arrivalDate,
    reservation.departureDate,
  );

  return (
    <header>
      <StatusBadge
        status={status}
        label={MEMBER_STATUS_LABELS[status]}
        className="bg-card backdrop-blur-md"
      />
      <h1 className="mt-4 mb-2 text-6xl leading-[0.9] font-semibold tracking-tighter sm:text-7xl">
        {place}
      </h1>
      <p className="text-muted-foreground text-base">
        {reservation.villa} · prepared for {reservation.member.name}
      </p>
      <dl className="border-input mt-4.5 flex items-end gap-5 border-t pt-3.5">
        <DateStat label="Arrive" date={reservation.arrivalDate} />
        <div aria-hidden className="text-muted-foreground pb-5">
          →
        </div>
        <DateStat label="Depart" date={reservation.departureDate} />
        <div className="border-input ml-auto flex flex-col border-l pl-5 text-right">
          <dt>
            <Eyebrow>Nights</Eyebrow>
          </dt>
          <dd className="flex flex-col">
            <span className="mt-1.5 text-4xl leading-none font-medium tracking-tighter tabular-nums">
              {nights}
            </span>
            <span className="text-muted-foreground text-sm">
              {dateParts(reservation.arrivalDate).year}
            </span>
          </dd>
        </div>
      </dl>
    </header>
  );
}
