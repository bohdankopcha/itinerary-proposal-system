import { cn } from "@/lib/utils";

export const Panel = ({
  as: Tag = "div",
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "aside";
}) => {
  return (
    <Tag
      className={cn(
        "border-panel-border bg-card shadow-panel rounded-2xl border",
        className,
      )}
      {...props}
    />
  );
};
