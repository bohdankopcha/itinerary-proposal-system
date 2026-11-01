import { useRef, useState } from "react";

import { dropStartMinutes } from "@/lib/proposals/calendar";
import { CATEGORIES } from "@/lib/proposals/categories";
import type { DraftItem } from "@/lib/proposals/draft";
import { toScheduledAt } from "@/lib/proposals/trip-days";

import type { DraftBuilder } from "./use-draft-builder";

export type DragTarget = {
  date: string;
  startMinutes: number;
  durationMinutes: number;
};

export function usePlannerDrag({
  locked,
  builder,
  onMoved,
}: {
  locked: boolean;
  builder: DraftBuilder;
  onMoved: (key: string) => void;
}) {
  const [dragging, setDragging] = useState<DraftItem | null>(null);
  const [over, setOver] = useState<DragTarget | null>(null);
  const grabOffset = useRef(0);

  function targetFor(date: string, event: React.DragEvent<HTMLElement>) {
    if (!dragging) return null;
    const durationMinutes = CATEGORIES[dragging.category].durationMinutes;
    const offsetY =
      event.clientY - event.currentTarget.getBoundingClientRect().top;
    return {
      date,
      durationMinutes,
      startMinutes: dropStartMinutes(
        offsetY,
        grabOffset.current,
        durationMinutes,
      ),
    };
  }

  function end() {
    setDragging(null);
    setOver(null);
  }

  return {
    draggingKey: dragging?.key ?? null,
    over,
    start(item: DraftItem, event: React.DragEvent<HTMLElement>) {
      if (locked) {
        event.preventDefault();
        return;
      }
      grabOffset.current =
        event.clientY - event.currentTarget.getBoundingClientRect().top;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", item.key);
      setTimeout(() => setDragging(item), 0);
    },
    overDay(date: string, event: React.DragEvent<HTMLElement>) {
      const target = targetFor(date, event);
      if (!target) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setOver((current) =>
        current &&
        current.date === target.date &&
        current.startMinutes === target.startMinutes
          ? current
          : target,
      );
    },
    dropOnDay(date: string, event: React.DragEvent<HTMLElement>) {
      const target = targetFor(date, event);
      if (!target || !dragging) return;
      event.preventDefault();
      const { key, ...fields } = dragging;
      builder.updateItem(key, {
        ...fields,
        scheduledAt: toScheduledAt(target.date, target.startMinutes),
      });
      onMoved(key);
      end();
    },
    end,
  };
}

export type PlannerDrag = ReturnType<typeof usePlannerDrag>;
