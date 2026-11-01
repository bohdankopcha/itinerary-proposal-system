import { Eyebrow } from "@/components/eyebrow";
import { Panel } from "@/components/panel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ConciergeBell } from "lucide-react";

export function ConciergeNote({ notes }: { notes: string }) {
  return (
    <Panel
      as="section"
      aria-label="Note from your concierge"
      className="motion-safe:animate-rise rounded-3xl px-4.5 py-3"
    >
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="group focus-visible:ring-ring flex min-h-12 w-full items-center gap-3 rounded-2xl text-left focus-visible:ring-2 focus-visible:outline-none">
          <span
            aria-hidden
            className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <ConciergeBell className="size-4.5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm leading-tight font-semibold">
              Your concierge
            </span>
            <Eyebrow>
              <span className="group-data-panel-open:hidden">
                A note for you · tap to read
              </span>
              <span className="hidden group-data-panel-open:inline">
                Personal note
              </span>
            </Eyebrow>
          </span>
          <ChevronDown
            aria-hidden
            className="text-muted-foreground size-4.5 shrink-0 transition-transform duration-300 group-data-panel-open:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 data-ending-style:h-0 data-starting-style:h-0">
          <p className="py-2.5 text-lg leading-relaxed tracking-tight text-pretty whitespace-pre-line">
            {notes}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </Panel>
  );
}
