import { CATEGORY_STYLES } from "@/components/category-styles";
import { Eyebrow } from "@/components/eyebrow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ItemEditor } from "@/hooks/use-item-editor";
import { CATEGORY_LIST } from "@/lib/proposals/categories";
import { formatDayShort, formatTime } from "@/lib/proposals/format";
import { cn } from "@/lib/utils";

export function CategoryPickerDialog({ editor }: { editor: ItemEditor }) {
  const target = editor.picker;
  const when = target?.date
    ? `Add to ${formatDayShort(target.date)}${target.minutes !== null ? `, ${formatTime(target.minutes)}` : ""}`
    : "Add to itinerary";

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && editor.close()}
    >
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <Eyebrow>{when}</Eyebrow>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Choose a category
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pick the kind of item to add to the itinerary.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_LIST.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => editor.chooseCategory(category.id)}
              className={cn(
                "border-input bg-field focus-visible:ring-ring flex min-h-28 flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none",
                CATEGORY_STYLES[category.id].hover,
              )}
            >
              <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 rounded-full",
                    CATEGORY_STYLES[category.id].dot,
                  )}
                />
                {category.label}
              </span>
              <span className="text-muted-foreground text-sm">
                {category.examples}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
