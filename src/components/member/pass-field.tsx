import { cn } from "@/lib/utils";

export const PassField = ({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) => (
  <div>
    <dt className="text-primary-foreground/85 mb-0.5 text-xs tracking-widest uppercase">
      {label}
    </dt>
    <dd
      className={cn(
        "tabular-nums",
        large
          ? "text-3xl leading-none tracking-tighter"
          : "text-base font-medium",
      )}
    >
      {value}
    </dd>
  </div>
);
