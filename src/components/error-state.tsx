import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";

export const ErrorState = ({
  title = "Something went wrong",
  message,
  actionLabel = "Try again",
  onAction,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  return (
    <Panel
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center"
    >
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm">{message}</p>
      {onAction && (
        <Button variant="outline" className="border-input" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Panel>
  );
};
