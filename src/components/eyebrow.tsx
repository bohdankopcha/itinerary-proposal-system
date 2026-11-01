import { cn } from "@/lib/utils";

export const Eyebrow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "text-muted-foreground text-xs font-medium tracking-widest uppercase",
        className,
      )}
      {...props}
    />
  );
};
