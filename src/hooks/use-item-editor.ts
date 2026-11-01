import { useState } from "react";

import { CATEGORIES, itemDurationMinutes } from "@/lib/proposals/categories";
import {
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  durationBetween,
  pageOfDay,
  parseEndInput,
  toEndInput,
} from "@/lib/proposals/calendar";
import type { DraftItem } from "@/lib/proposals/draft";
import { firstOpenDate } from "@/lib/proposals/itinerary";
import {
  dateOf,
  dayIndexOf,
  minutesOf,
  parseTimeInput,
  toScheduledAt,
  toTimeInput,
} from "@/lib/proposals/trip-days";
import type { ResolvedQuickAdd } from "@/lib/proposals/quick-add";
import type { ItemCategory } from "@/lib/schemas/proposal";
import type { Reservation } from "@/lib/schemas/reservation";

import type { DraftBuilder } from "./use-draft-builder";

export type ItemFormValues = {
  category: ItemCategory;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  price: string;
};

type SheetState = { key: string | null; form: ItemFormValues };

const FLASH_MS = 1400;
const DEFAULT_CATEGORY: ItemCategory = "dining";

const priceToInput = (cents: number) => (cents ? String(cents / 100) : "");
const inputToCents = (value: string) => {
  const dollars = value.trim() === "" ? 0 : Number(value);
  return Number.isFinite(dollars) && dollars >= 0
    ? Math.round(dollars * 100)
    : null;
};

export function useItemEditor({
  reservation,
  items,
  builder,
  locked,
  onItemPlaced,
}: {
  reservation: Reservation;
  items: DraftItem[];
  builder: DraftBuilder;
  locked: boolean;
  onItemPlaced: (page: number) => void;
}) {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);

  function flash(key: string) {
    setFlashKey(key);
    setTimeout(() => setFlashKey(null), FLASH_MS);
  }

  function openNew(date: string | null = null, minutes: number | null = null) {
    if (locked) return;
    const category = DEFAULT_CATEGORY;
    const start = minutes ?? CATEGORIES[category].defaultStartMinutes;
    setSheet({
      key: null,
      form: {
        category,
        title: "",
        description: "",
        date: date ?? firstOpenDate(items, reservation),
        time: toTimeInput(start),
        endTime: toEndInput(
          Math.min(
            start + CATEGORIES[category].durationMinutes,
            DAY_END_MINUTES,
          ),
        ),
        price: "",
      },
    });
  }

  function openItem(item: DraftItem) {
    setSheet({
      key: item.key,
      form: {
        category: item.category,
        title: item.title,
        description: item.description,
        date: dateOf(item.scheduledAt),
        time: toTimeInput(minutesOf(item.scheduledAt)),
        endTime: toEndInput(
          minutesOf(item.scheduledAt) + itemDurationMinutes(item),
        ),
        price: priceToInput(item.priceCents),
      },
    });
  }

  function setField<K extends keyof ItemFormValues>(
    field: K,
    value: ItemFormValues[K],
  ) {
    setSheet((current) => {
      if (!current) return current;
      const next = { ...current.form, [field]: value };
      if (field === "time") {
        const previousStart = parseTimeInput(current.form.time);
        const previousEnd = parseEndInput(current.form.endTime);
        const start = parseTimeInput(String(value));
        if (previousStart !== null && previousEnd !== null && start !== null)
          next.endTime = toEndInput(
            Math.min(start + previousEnd - previousStart, DAY_END_MINUTES),
          );
      }
      return { ...current, form: next };
    });
  }

  const form = sheet?.form;
  const minutes = form ? parseTimeInput(form.time) : null;
  const endMinutes = form ? parseEndInput(form.endTime) : null;
  const durationMinutes =
    minutes !== null && endMinutes !== null
      ? durationBetween(minutes, endMinutes)
      : null;
  const priceCents = form ? inputToCents(form.price) : null;
  const canSubmit =
    !locked &&
    !!form &&
    form.title.trim() !== "" &&
    form.description.trim() !== "" &&
    minutes !== null &&
    minutes >= DAY_START_MINUTES &&
    durationMinutes !== null &&
    priceCents !== null;

  function submit() {
    if (
      !sheet ||
      !form ||
      !canSubmit ||
      minutes === null ||
      durationMinutes === null ||
      priceCents === null
    )
      return;
    const fields = {
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      scheduledAt: toScheduledAt(form.date, minutes),
      priceCents,
      durationMinutes,
    };
    const key = sheet.key
      ? (builder.updateItem(sheet.key, fields), sheet.key)
      : builder.addItem(fields);
    setSheet(null);
    flash(key);
    onItemPlaced(
      pageOfDay(dayIndexOf(fields.scheduledAt, reservation.arrivalDate)),
    );
  }

  function remove() {
    if (!sheet?.key || locked) return;
    builder.removeItem(sheet.key);
    setSheet(null);
  }

  function quickAdd(resolved: ResolvedQuickAdd) {
    if (locked) return;
    const title = resolved.title.slice(0, 120);
    const key = builder.addItem({
      category: resolved.category,
      title,
      description: `${title}, arranged by your concierge.`,
      scheduledAt: resolved.scheduledAt,
      priceCents: resolved.priceCents,
      durationMinutes: resolved.durationMinutes,
    });
    flash(key);
    onItemPlaced(
      pageOfDay(dayIndexOf(resolved.scheduledAt, reservation.arrivalDate)),
    );
  }

  function close() {
    setSheet(null);
  }

  return {
    sheet: sheet && {
      isNew: sheet.key === null,
      form: sheet.form,
      readOnly: locked,
    },
    flashKey,
    flash,
    canSubmit,
    timeRangeValid: durationMinutes !== null || minutes === null,
    openNew,
    openItem,
    setField,
    submit,
    remove,
    quickAdd,
    close,
  };
}

export type ItemEditor = ReturnType<typeof useItemEditor>;
