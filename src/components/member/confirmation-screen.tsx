import { ConfirmationRow } from "@/components/member/confirmation-row";
import { ConfirmationPostcard } from "@/components/member/confirmation-postcard";
import { Eyebrow } from "@/components/eyebrow";
import { Panel } from "@/components/panel";
import {
  formatConfirmationNumber,
  formatDateWithYear,
  formatMoney,
} from "@/lib/proposals/format";
import { nightsBetween } from "@/lib/proposals/trip-days";
import type { Proposal } from "@/lib/schemas/proposal";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export const ConfirmationScreen = ({ proposal }: { proposal: Proposal }) => {
  const { reservation } = proposal;
  const firstName = reservation.member.name.split(" ")[0];
  const nights = nightsBetween(
    reservation.arrivalDate,
    reservation.departureDate,
  );

  return (
    <section
      aria-labelledby="confirmation-title"
      className="flex flex-col items-center gap-2.5 pt-2 text-center"
    >
      <ConfirmationPostcard reservation={reservation} />
      <div
        className="animate-rise text-muted-foreground mt-3.5 inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase"
        style={delay(1750)}
      >
        <span className="bg-primary text-primary-foreground flex size-5.5 items-center justify-center rounded-full">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-3"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        Payment confirmed
      </div>
      <h2
        className="animate-rise text-3xl leading-tight font-semibold tracking-tighter"
        style={delay(1850)}
      >
        You’re locked in, {firstName}.
      </h2>
      <p
        className="animate-rise text-muted-foreground mb-2.5 max-w-sm"
        style={delay(1950)}
      >
        Your concierge and the villa team will take it from here. See you in{" "}
        {reservation.destination.split(",")[0]}.
      </p>
      <Panel
        className="animate-rise w-full rounded-3xl p-5.5 text-left"
        style={delay(2050)}
      >
        <div className="border-input flex flex-col gap-1.5 border-b border-dashed pb-4.5">
          <Eyebrow>Confirmation number</Eyebrow>
          <span className="font-mono text-3xl font-medium tracking-wide tabular-nums">
            {formatConfirmationNumber(proposal)}
          </span>
        </div>
        <dl className="flex flex-col">
          <ConfirmationRow label="Client">
            {reservation.member.name}
          </ConfirmationRow>
          <ConfirmationRow label="Villa">
            {reservation.villa},{" "}
            {reservation.destination.split(",").at(-1)?.trim()}
          </ConfirmationRow>
          <ConfirmationRow label="Arrival">
            {formatDateWithYear(reservation.arrivalDate)}
          </ConfirmationRow>
          <ConfirmationRow label="Departure">
            {formatDateWithYear(reservation.departureDate)}
          </ConfirmationRow>
          <ConfirmationRow label="Experiences">
            {proposal.items.length} across {nights} nights
          </ConfirmationRow>
          <ConfirmationRow label="Total paid" emphasized>
            {formatMoney(proposal.totalCents)}
          </ConfirmationRow>
        </dl>
      </Panel>
    </section>
  );
};
