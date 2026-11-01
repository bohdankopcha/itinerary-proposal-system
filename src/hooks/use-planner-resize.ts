import { useCallback, useRef, useState } from "react";

import {
  pixelsToMinutes,
  resizeRange,
  type ResizeEdge,
  type TimeRange,
} from "@/lib/proposals/calendar";
import { itemDurationMinutes } from "@/lib/proposals/categories";
import type { DraftItem } from "@/lib/proposals/draft";
import { minutesOf, toScheduledAt } from "@/lib/proposals/trip-days";

import type { DraftBuilder } from "./use-draft-builder";

type ResizeState = {
  item: DraftItem;
  edge: ResizeEdge;
  startY: number;
  original: TimeRange;
  current: TimeRange;
};

export const usePlannerResize = ({
  locked,
  builder,
  onResized,
}: {
  locked: boolean;
  builder: DraftBuilder;
  onResized: (key: string) => void;
}) => {
  const [state, setState] = useState<ResizeState | null>(null);
  const latest = useRef<ResizeState | null>(null);

  const update = (next: ResizeState | null) => {
    latest.current = next;
    setState(next);
  };

  const start = (
    item: DraftItem,
    edge: ResizeEdge,
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (locked || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const original = {
      startMinutes: minutesOf(item.scheduledAt),
      durationMinutes: itemDurationMinutes(item),
    };
    update({ item, edge, startY: event.clientY, original, current: original });
  };

  const move = (event: React.PointerEvent<HTMLElement>) => {
    const active = latest.current;
    if (!active) return;
    const delta = pixelsToMinutes(event.clientY - active.startY);
    update({
      ...active,
      current: resizeRange(active.original, active.edge, delta),
    });
  };

  const finish = (event: React.PointerEvent<HTMLElement>) => {
    const active = latest.current;
    if (!active) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    update(null);
    const { startMinutes, durationMinutes } = active.current;
    const { original } = active;
    if (
      startMinutes === original.startMinutes &&
      durationMinutes === original.durationMinutes
    )
      return;
    const { key, ...fields } = active.item;
    builder.updateItem(key, {
      ...fields,
      scheduledAt: toScheduledAt(
        active.item.scheduledAt.slice(0, 10),
        startMinutes,
      ),
      durationMinutes,
    });
    onResized(key);
  };

  const cancel = () => update(null);

  const rangeFor = useCallback(
    (item: DraftItem): TimeRange =>
      state?.item.key === item.key
        ? state.current
        : {
            startMinutes: minutesOf(item.scheduledAt),
            durationMinutes: itemDurationMinutes(item),
          },
    [state],
  );

  return {
    resizingKey: state?.item.key ?? null,
    rangeFor,
    start,
    move,
    finish,
    cancel,
  };
};

export type PlannerResize = ReturnType<typeof usePlannerResize>;
