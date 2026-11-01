import { CATEGORY_STYLES } from "@/components/category-styles";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { ItemEditor } from "@/hooks/use-item-editor";
import { DAY_END_MINUTES, DAY_START_MINUTES } from "@/lib/proposals/calendar";
import { CATEGORIES, CATEGORY_LIST } from "@/lib/proposals/categories";
import { formatDayLong } from "@/lib/proposals/format";
import { toTimeInput, tripDates } from "@/lib/proposals/trip-days";
import type { Reservation } from "@/lib/schemas/reservation";
import { cn } from "@/lib/utils";

export const ItemSheet = ({
  editor,
  reservation,
}: {
  editor: ItemEditor;
  reservation: Reservation;
}) => {
  const sheet = editor.sheet;
  const form = sheet?.form;
  const dateItems = tripDates(
    reservation.arrivalDate,
    reservation.departureDate,
  ).map((date) => ({ value: date, label: formatDayLong(date) }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    editor.submit();
  };

  return (
    <Sheet open={!!sheet} onOpenChange={(open) => !open && editor.close()}>
      <SheetContent className="w-full sm:max-w-md">
        {sheet && form && (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit}
          >
            <SheetHeader>
              <Eyebrow>
                {sheet.isNew
                  ? "New item"
                  : sheet.readOnly
                    ? "Item · read only"
                    : "Edit item"}
              </Eyebrow>
              <SheetTitle className="text-2xl font-semibold tracking-tight">
                {form.title.trim() || CATEGORIES[form.category].label}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Item details for the itinerary.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4.5 overflow-y-auto px-4 pb-4">
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Category</legend>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {CATEGORY_LIST.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={form.category === category.id}
                      disabled={sheet.readOnly}
                      onClick={() => editor.setField("category", category.id)}
                      className={cn(
                        "border-input bg-field focus-visible:ring-ring flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                        CATEGORY_STYLES[category.id].hover,
                        form.category === category.id &&
                          CATEGORY_STYLES[category.id].selected,
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          CATEGORY_STYLES[category.id].dot,
                        )}
                      />
                      {category.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <Label htmlFor="item-title">Title</Label>
                <Input
                  id="item-title"
                  required
                  maxLength={120}
                  disabled={sheet.readOnly}
                  value={form.title}
                  placeholder={CATEGORIES[form.category].titleHint}
                  onChange={(event) =>
                    editor.setField("title", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="item-description">Description</Label>
                <Textarea
                  id="item-description"
                  required
                  rows={4}
                  maxLength={1000}
                  disabled={sheet.readOnly}
                  value={form.description}
                  placeholder="What the client should know"
                  onChange={(event) =>
                    editor.setField("description", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="item-date">Date</Label>
                <Select
                  value={form.date}
                  items={dateItems}
                  disabled={sheet.readOnly}
                  onValueChange={(next) =>
                    next && editor.setField("date", next)
                  }
                >
                  <SelectTrigger id="item-date" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {dateItems.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="item-time">Start</Label>
                  <Input
                    id="item-time"
                    type="time"
                    step={900}
                    required
                    min={toTimeInput(DAY_START_MINUTES)}
                    max={toTimeInput(DAY_END_MINUTES - 30)}
                    disabled={sheet.readOnly}
                    value={form.time}
                    className="tabular-nums"
                    onChange={(event) =>
                      editor.setField("time", event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="item-end-time">End</Label>
                  <Input
                    id="item-end-time"
                    type="time"
                    step={900}
                    required
                    aria-invalid={!editor.timeRangeValid}
                    disabled={sheet.readOnly}
                    value={form.endTime}
                    className="tabular-nums"
                    onChange={(event) =>
                      editor.setField("endTime", event.target.value)
                    }
                  />
                </div>
                {!editor.timeRangeValid && (
                  <p
                    role="alert"
                    className="text-destructive col-span-2 text-sm"
                  >
                    End must be at least 30 minutes after the start, by
                    midnight.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="item-price">Estimated price</Label>
                <div className="relative">
                  <span
                    aria-hidden
                    className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                  >
                    $
                  </span>
                  <Input
                    id="item-price"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={10}
                    disabled={sheet.readOnly}
                    value={form.price}
                    placeholder="0"
                    className="pl-7 tabular-nums"
                    onChange={(event) =>
                      editor.setField("price", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="flex-row items-center border-t">
              {!sheet.isNew && !sheet.readOnly && (
                <Button type="button" variant="ghost" onClick={editor.remove}>
                  Remove
                </Button>
              )}
              <span className="flex-1" />
              <Button
                type="button"
                variant="outline"
                className="border-input"
                onClick={editor.close}
              >
                {sheet.readOnly ? "Close" : "Cancel"}
              </Button>
              {!sheet.readOnly && (
                <Button type="submit" disabled={!editor.canSubmit}>
                  {sheet.isNew ? "Add to itinerary" : "Save"}
                </Button>
              )}
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};
