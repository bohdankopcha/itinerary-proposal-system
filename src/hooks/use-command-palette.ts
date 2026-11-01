import { useEffect, useState } from "react";

import { CATEGORIES } from "@/lib/proposals/categories";
import type { DraftItem } from "@/lib/proposals/draft";
import {
  STATUS_LABELS,
  formatDayShort,
  formatMoney,
  formatTimeRange,
} from "@/lib/proposals/format";
import {
  parseQuickAdd,
  resolveQuickAdd,
  type ResolvedQuickAdd,
} from "@/lib/proposals/quick-add";
import type { ProposalStatus } from "@/lib/schemas/proposal";
import type { Reservation } from "@/lib/schemas/reservation";

import type { ConciergeView } from "./concierge-view";

export type PaletteOption = {
  id: string;
  glyph: string;
  label: string;
  meta: string;
  disabled: boolean;
  highlighted: boolean;
  run: () => void;
};

export type PaletteToken = {
  label: string;
  value: string;
  tone: "set" | "auto" | "bad";
};

type Command = Omit<PaletteOption, "highlighted" | "disabled" | "run"> & {
  disabled?: boolean;
  run: () => void;
};

export const useCommandPalette = ({
  reservation,
  reservations,
  items,
  status,
  view,
  canSend,
  onOpen,
  onAddItem,
  onQuickAdd,
  onPreview,
  onSend,
  onViewChange,
  onNewProposal,
  onSelectReservation,
}: {
  reservation: Reservation | undefined;
  reservations: Reservation[];
  items: DraftItem[];
  status: ProposalStatus;
  view: ConciergeView;
  canSend: boolean;
  onOpen: () => void;
  onAddItem: () => void;
  onQuickAdd: (resolved: ResolvedQuickAdd) => void;
  onPreview: () => void;
  onSend: () => void;
  onViewChange: (view: ConciergeView) => void;
  onNewProposal: () => void;
  onSelectReservation: (id: string) => void;
}) => {
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const open = query !== null;
  const locked = status !== "draft";

  const show = () => {
    onOpen();
    setActive(0);
    setQuery("");
  };

  const close = () => setQuery(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (query === null) show();
        else close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const text = query ?? "";
  const parsed =
    open && reservation && text.trim()
      ? parseQuickAdd(text, reservation)
      : null;
  const resolved =
    parsed && reservation ? resolveQuickAdd(parsed, reservation, items) : null;

  const commands: Command[] = reservation
    ? [
        {
          id: "add",
          glyph: "+",
          label: "Add item…",
          meta: "Choose a category",
          disabled: locked,
          run: onAddItem,
        },
        {
          id: "preview",
          glyph: "◐",
          label: "Preview proposal",
          meta: "Client view",
          run: onPreview,
        },
        {
          id: "send",
          glyph: "→",
          label: "Send to client",
          meta: locked
            ? `Already ${STATUS_LABELS[status].toLowerCase()}`
            : reservation.member.email,
          disabled: !canSend,
          run: onSend,
        },
        {
          id: "view",
          glyph: "≡",
          label: view === "proposals" ? "Go to itinerary" : "Go to proposals",
          meta: "View",
          run: () =>
            onViewChange(view === "proposals" ? "itinerary" : "proposals"),
        },
        {
          id: "new",
          glyph: "＋",
          label: "New proposal",
          meta: `for ${reservation.member.name}`,
          run: onNewProposal,
        },
        ...reservations
          .filter((other) => other.id !== reservation.id)
          .map((other) => ({
            id: `switch-${other.id}`,
            glyph: "↪",
            label: `Switch to ${other.member.name}`,
            meta: other.villa,
            run: () => onSelectReservation(other.id),
          })),
      ]
    : [];

  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const matched = words.length
    ? commands.filter((command) =>
        words.every((word) => command.label.toLowerCase().includes(word)),
      )
    : commands;

  const create: Command[] =
    parsed && resolved && parsed.title.length > 1
      ? [
          {
            id: "create",
            glyph: "+",
            label: `Create “${parsed.title}”`,
            meta: locked
              ? `Proposal is ${STATUS_LABELS[status].toLowerCase()}`
              : [
                  CATEGORIES[parsed.category].label,
                  formatDayShort(resolved.date),
                  formatTimeRange(
                    resolved.startMinutes,
                    resolved.durationMinutes,
                  ),
                  formatMoney(resolved.priceCents),
                ].join(" · "),
            disabled: locked,
            run: () => onQuickAdd(resolved),
          },
        ]
      : [];

  const ordered =
    create.length && matched.length && words.length <= 2
      ? [...matched, ...create]
      : [...create, ...matched];
  const activeIndex = Math.min(active, Math.max(ordered.length - 1, 0));

  const options: PaletteOption[] = ordered.map((command, index) => ({
    ...command,
    disabled: command.disabled ?? false,
    highlighted: index === activeIndex,
    run: () => {
      if (command.disabled) return;
      close();
      command.run();
    },
  }));

  const tokens: PaletteToken[] =
    parsed && resolved && parsed.title
      ? [
          {
            label: "Category",
            value: CATEGORIES[parsed.category].label,
            tone: parsed.categorySource === "default" ? "auto" : "set",
          },
          {
            label: "Day",
            value: parsed.dayOutOfRange
              ? "Outside stay"
              : parsed.dayIndex !== null
                ? formatDayShort(resolved.date)
                : `First open · ${formatDayShort(resolved.date)}`,
            tone: parsed.dayOutOfRange
              ? "bad"
              : parsed.dayIndex !== null
                ? "set"
                : "auto",
          },
          {
            label: "Time",
            value: formatTimeRange(
              resolved.startMinutes,
              resolved.durationMinutes,
            ),
            tone:
              parsed.startMinutes !== null || resolved.durationMinutes !== null
                ? "set"
                : "auto",
          },
          {
            label: "Price",
            value: formatMoney(resolved.priceCents),
            tone: parsed.priceCents !== null ? "set" : "auto",
          },
        ]
      : [];

  const updateQuery = (next: string) => {
    setQuery(next);
    setActive(0);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      options[activeIndex]?.run();
    }
  };

  return {
    open,
    query: text,
    options,
    tokens,
    activeIndex,
    show,
    close,
    setQuery: updateQuery,
    setActive,
    onInputKeyDown,
  };
};

export type CommandPalette = ReturnType<typeof useCommandPalette>;
