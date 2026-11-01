import type { PlannerResize } from "@/hooks/use-planner-resize";
import type { ResizeEdge } from "@/lib/proposals/calendar";
import type { DraftItem } from "@/lib/proposals/draft";
import { cn } from "@/lib/utils";

export const PlannerResizeHandle = ({
  item,
  edge,
  resize,
}: {
  item: DraftItem;
  edge: ResizeEdge;
  resize: PlannerResize;
}) => (
  <div
    aria-hidden
    onPointerDown={(event) => resize.start(item, edge, event)}
    onPointerMove={resize.move}
    onPointerUp={resize.finish}
    onPointerCancel={resize.cancel}
    onMouseDown={(event) => event.preventDefault()}
    className={cn(
      "group/handle absolute inset-x-0 z-10 flex h-2 cursor-ns-resize touch-none items-center justify-center",
      edge === "top" ? "top-0" : "bottom-0",
    )}
  >
    <span className="bg-foreground/40 group-hover/handle:bg-foreground/70 h-0.5 w-6 rounded-full opacity-0 transition-opacity duration-150 group-hover/block:opacity-100" />
  </div>
);
