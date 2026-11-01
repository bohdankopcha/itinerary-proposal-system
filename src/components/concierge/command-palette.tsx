import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CommandPalette as Palette } from "@/hooks/use-command-palette";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const TOKEN_STYLES = {
  set: "bg-accent",
  auto: "border border-dashed border-input",
  bad: "border border-dashed border-primary",
};

export function CommandPalette({ palette }: { palette: Palette }) {
  const activeId = palette.options[palette.activeIndex]?.id;

  return (
    <Dialog
      open={palette.open}
      onOpenChange={(open) => !open && palette.close()}
    >
      <DialogContent
        showCloseButton={false}
        className="top-24 translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-3 border-b px-4">
          <Search aria-hidden className="size-4.5 shrink-0" />
          <Input
            role="combobox"
            aria-expanded
            aria-controls="palette-list"
            aria-activedescendant={activeId ? `palette-${activeId}` : undefined}
            aria-label="Command or new item"
            autoFocus
            value={palette.query}
            placeholder="surf lesson day 2 10am 220"
            onChange={(event) => palette.setQuery(event.target.value)}
            onKeyDown={palette.onInputKeyDown}
            className="h-13 border-0 bg-transparent px-0 text-lg shadow-none focus-visible:ring-0"
          />
          <kbd className="border-input bg-field text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-xs">
            esc
          </kbd>
        </div>

        {palette.tokens.length > 0 && (
          <div
            aria-live="polite"
            className="flex flex-wrap gap-1.5 border-b px-4 py-3"
          >
            {palette.tokens.map((token) => (
              <span
                key={token.label}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium",
                  TOKEN_STYLES[token.tone],
                )}
              >
                <span className="text-muted-foreground text-xs tracking-wider uppercase">
                  {token.label}
                </span>
                {token.value}
              </span>
            ))}
          </div>
        )}

        <div
          id="palette-list"
          role="listbox"
          aria-label="Results"
          className="flex max-h-80 flex-col gap-0.5 overflow-y-auto p-1.5"
        >
          {palette.options.map((option, index) => (
            <button
              key={option.id}
              id={`palette-${option.id}`}
              type="button"
              role="option"
              aria-selected={option.highlighted}
              disabled={option.disabled}
              onClick={option.run}
              onMouseEnter={() => palette.setActive(index)}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left disabled:cursor-not-allowed disabled:opacity-45",
                option.highlighted && "bg-accent",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "bg-muted flex size-6.5 shrink-0 items-center justify-center rounded-lg",
                  option.id === "create" &&
                    "bg-primary text-primary-foreground",
                )}
              >
                {option.glyph}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  option.id === "create" && "font-semibold",
                )}
              >
                {option.label}
              </span>
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {option.meta}
              </span>
            </button>
          ))}
          {palette.options.length === 0 && (
            <p className="text-muted-foreground p-4 text-sm">
              No matches. Type an item like “sunset cocktails fri 7pm 260”.
            </p>
          )}
        </div>

        <div className="text-muted-foreground flex gap-4 border-t px-4 py-2.5 text-xs">
          <span>↑↓ move</span>
          <span>↵ run</span>
          <span>⌘K toggle</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
