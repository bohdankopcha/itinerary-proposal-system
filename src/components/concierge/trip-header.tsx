import { Eyebrow } from "@/components/eyebrow";
import { TripDateStat } from "@/components/concierge/trip-date-stat";
import { nightsBetween } from "@/lib/proposals/trip-days";
import type { Reservation } from "@/lib/schemas/reservation";

export function TripHeader({ reservation }: { reservation: Reservation }) {
  const nights = nightsBetween(
    reservation.arrivalDate,
    reservation.departureDate,
  );

  return (
    <section
      aria-label="Trip"
      className="flex flex-wrap items-end justify-between gap-6 px-4 pt-2.5 pb-5 sm:px-8"
    >
      <div>
        <h1 className="mb-2 text-4xl leading-none font-semibold tracking-tighter lg:text-5xl">
          {reservation.member.name}
        </h1>
        <p className="text-muted-foreground">
          {reservation.villa} · {reservation.destination}
        </p>
      </div>
      <dl className="flex flex-wrap items-end gap-6">
        <TripDateStat label="Arrival" date={reservation.arrivalDate} />
        <TripDateStat label="Departure" date={reservation.departureDate} />
        <div className="border-border sm:border-l sm:pl-6">
          <dt>
            <Eyebrow className="mb-2">Nights</Eyebrow>
          </dt>
          <dd className="text-5xl leading-[0.85] font-medium tracking-tighter tabular-nums">
            {String(nights).padStart(2, "0")}
          </dd>
        </div>
      </dl>
    </section>
  );
}
