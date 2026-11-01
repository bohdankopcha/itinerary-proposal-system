import { Button } from "@/components/ui/button";
import type { ExplorerMode } from "@/hooks/use-itinerary-explorer";
import { cn } from "@/lib/utils";
import { GalleryVerticalEnd, ListTree } from "lucide-react";

const OPTIONS = [
  { mode: "cards", label: "Cards", Icon: GalleryVerticalEnd },
  { mode: "timeline", label: "Timeline", Icon: ListTree },
] as const;

export const ItineraryViewToggle = ({
  mode,
  onChange,
}: {
  mode: ExplorerMode;
  onChange: (mode: ExplorerMode) => void;
}) => {
  return (
    <div
      role="group"
      aria-label="View"
      className="bg-muted grid grid-cols-2 gap-1 rounded-2xl p-1"
    >
      {OPTIONS.map(({ mode: option, label, Icon }) => (
        <Button
          key={option}
          variant="ghost"
          aria-pressed={mode === option}
          onClick={() => onChange(option)}
          className={cn(
            "text-muted-foreground rounded-xl",
            mode === option &&
              "bg-card text-foreground hover:bg-card shadow-sm",
          )}
        >
          <Icon aria-hidden />
          {label}
        </Button>
      ))}
    </div>
  );
};
