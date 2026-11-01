import { TripStat } from "@/components/member/trip-stat";
import { StatusBadge } from "@/components/status-badge";
import { formatDayMonth, formatNights } from "@/lib/proposals/format";
import type { ProposalStatus } from "@/lib/schemas/proposal";
import type { Reservation } from "@/lib/schemas/reservation";

export const MEMBER_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  sent: "Awaiting approval",
  approved: "Approved",
  paid: "Paid · Locked",
};

export const MemberHeader = ({
  reservation,
  status,
}: {
  reservation: Reservation;
  status: ProposalStatus;
}) => {
  const place = reservation.destination.split(",")[0];

  return (
    <header>
      <StatusBadge
        status={status}
        label={MEMBER_STATUS_LABELS[status]}
        className={
          status === "paid" ? "backdrop-blur-md" : "bg-card backdrop-blur-md"
        }
      />
      <h1 className="mt-4 mb-2 text-6xl leading-[0.9] font-semibold tracking-tighter sm:text-7xl">
        {place}
      </h1>
      <p className="text-muted-foreground text-base">
        {reservation.villa} · prepared for {reservation.member.name}
      </p>
      <dl className="border-input mt-4.5 grid grid-cols-3 gap-3 border-t pt-3.5">
        <TripStat
          label="Arrive"
          value={formatDayMonth(reservation.arrivalDate)}
        />
        <TripStat
          label="Depart"
          value={formatDayMonth(reservation.departureDate)}
        />
        <TripStat
          label="Nights"
          value={formatNights(
            reservation.arrivalDate,
            reservation.departureDate,
          )}
        />
      </dl>
    </header>
  );
};
