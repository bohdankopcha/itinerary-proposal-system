import { Eyebrow } from "@/components/eyebrow";
import { dateParts } from "@/lib/proposals/format";

export const DateStat = ({ label, date }: { label: string; date: string }) => {
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
};
