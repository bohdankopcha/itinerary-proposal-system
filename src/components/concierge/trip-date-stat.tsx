import { Eyebrow } from "@/components/eyebrow";
import { dateParts } from "@/lib/proposals/format";

export function TripDateStat({ label, date }: { label: string; date: string }) {
  const { day, month, year, weekdayLong } = dateParts(date);
  return (
    <div>
      <dt>
        <Eyebrow className="mb-2">{label}</Eyebrow>
      </dt>
      <dd className="flex items-end gap-2.5">
        <span className="text-5xl leading-[0.85] font-medium tracking-tighter tabular-nums">
          {day}
        </span>
        <span className="text-muted-foreground flex flex-col pb-0.5 text-sm leading-tight">
          <b className="text-foreground font-medium">
            {month} {year}
          </b>
          {weekdayLong}
        </span>
      </dd>
    </div>
  );
}
