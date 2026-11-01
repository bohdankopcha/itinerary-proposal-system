import { COAST_PATH } from "@/components/member/coast-line";
import { formatRange } from "@/lib/proposals/format";
import type { Reservation } from "@/lib/schemas/reservation";

const LAND_PATH = `${COAST_PATH} L400 0 L0 0 Z`;
const CONTOUR_PATH =
  "M0 106 C26 104 46 114 62 128 C76 140 92 138 106 128 C130 112 160 114 188 134 C220 158 246 190 290 198 C326 204 360 192 400 208";
const WORD_DELAY_MS = 90;
const WORDS_START_MS = 600;

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export const ConfirmationPostcard = ({
  reservation,
}: {
  reservation: Reservation;
}) => {
  const place = reservation.destination.split(",")[0];
  const words = `${place} is waiting for you.`.split(" ");

  return (
    <div className="from-trip-from via-trip-via to-trip-to text-primary-foreground motion-safe:animate-trip-in relative flex min-h-95 w-full flex-col overflow-hidden rounded-3xl bg-linear-140 via-55% px-7.5 pt-7 text-left shadow-2xl">
      <div
        aria-hidden
        className="from-primary-foreground/25 pointer-events-none absolute inset-0 bg-linear-to-bl via-transparent via-55% to-transparent"
      />
      <div className="relative flex items-center justify-between gap-2.5 text-xs font-medium tracking-widest uppercase">
        <span className="animate-soft-in font-mono" style={delay(1600)}>
          {reservation.destination}
        </span>
        <span className="border-primary-foreground/30 bg-primary-foreground/15 inline-flex h-6.5 items-center rounded-full border px-2.5">
          Locked
        </span>
      </div>
      <h1
        id="confirmation-title"
        className="relative mt-6 max-w-sm text-4xl leading-tight font-semibold tracking-tighter"
      >
        {words.map((word, index) => (
          <span key={words.slice(0, index + 1).join(" ")}>
            <span
              className="animate-word-in inline-block"
              style={delay(WORDS_START_MS + index * WORD_DELAY_MS)}
            >
              {word}
            </span>{" "}
          </span>
        ))}
      </h1>
      <p
        className="animate-soft-in text-primary-foreground/90 relative mt-2.5"
        style={delay(1300)}
      >
        {formatRange(reservation.arrivalDate, reservation.departureDate)} ·{" "}
        {reservation.villa}
      </p>
      <div className="relative -mx-7.5 mt-auto">
        <svg viewBox="0 0 400 220" aria-hidden className="block h-auto w-full">
          <g
            strokeWidth={1}
            strokeDasharray="2 6"
            className="stroke-primary-foreground/15"
          >
            {[100, 200, 300].map((positionX) => (
              <line
                key={positionX}
                x1={positionX}
                y1={0}
                x2={positionX}
                y2={220}
              />
            ))}
            {[70, 150].map((positionY) => (
              <line
                key={positionY}
                x1={0}
                y1={positionY}
                x2={400}
                y2={positionY}
              />
            ))}
          </g>
          <path
            d={LAND_PATH}
            className="animate-soft-in fill-primary-foreground/10"
            style={delay(1000)}
          />
          <path
            d={CONTOUR_PATH}
            fill="none"
            strokeWidth={1}
            strokeDasharray="2 5"
            className="animate-soft-in stroke-primary-foreground/40"
            style={delay(1200)}
          />
          <path
            d={COAST_PATH}
            pathLength={1}
            fill="none"
            strokeWidth={1.6}
            strokeLinecap="round"
            className="draw-path stroke-primary-foreground"
          />
          <ellipse
            cx={36}
            cy={152}
            rx={7}
            ry={3}
            className="animate-soft-in fill-primary-foreground/70"
            style={delay(1400)}
          />
          <ellipse
            cx={52}
            cy={160}
            rx={4}
            ry={2}
            className="animate-soft-in fill-primary-foreground/70"
            style={delay(1400)}
          />
          <circle
            cx={64}
            cy={114}
            r={9}
            fill="none"
            strokeWidth={1.2}
            className="svg-center animate-ping-out stroke-primary-foreground opacity-0"
          />
          <circle
            cx={64}
            cy={114}
            r={4}
            className="svg-center animate-pin-in fill-primary-foreground"
          />
          <text
            x={76}
            y={140}
            fontSize={8.5}
            letterSpacing="0.12em"
            className="animate-soft-in fill-primary-foreground font-mono"
            style={delay(1800)}
          >
            {reservation.villa.toUpperCase()}
          </text>
        </svg>
      </div>
    </div>
  );
};
