import { Eyebrow } from "@/components/eyebrow";

export const TripStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <dt>
      <Eyebrow>{label}</Eyebrow>
    </dt>
    <dd className="text-xl leading-none font-medium tracking-tight whitespace-nowrap tabular-nums sm:text-2xl">
      {value}
    </dd>
  </div>
);
