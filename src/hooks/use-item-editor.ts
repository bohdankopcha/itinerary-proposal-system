import { useState } from "react";

import { CATEGORIES } from "@/lib/proposals/categories";
import {
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  pageOfDay,
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
  price: string;
};

type PickerTarget = { date: string | null; minutes: number | null };
type SheetState = { key: string | null; form: ItemFormValues };

const FLASH_MS = 1400;

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
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);

  function flash(key: string) {
    setFlashKey(key);
    setTimeout(() => setFlashKey(null), FLASH_MS);
  }

  function openPicker(
    date: string | null = null,
    minutes: number | null = null,
  ) {
    if (locked) return;
    setSheet(null);
    setPicker({ date, minutes });
  }

  function chooseCategory(category: ItemCategory) {
    const target = picker;
    setPicker(null);
    setSheet({
      key: null,
      form: {
        category,
        title: "",
        description: "",
        date: target?.date ?? firstOpenDate(items, reservation),
        time: toTimeInput(
          target?.minutes ?? CATEGORIES[category].defaultStartMinutes,
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
        price: priceToInput(item.priceCents),
      },
    });
  }

  function setField<K extends keyof ItemFormValues>(
    field: K,
    value: ItemFormValues[K],
  ) {
    setSheet((current) =>
      current
        ? { ...current, form: { ...current.form, [field]: value } }
        : current,
    );
  }

  const form = sheet?.form;
  const minutes = form ? parseTimeInput(form.time) : null;
  const priceCents = form ? inputToCents(form.price) : null;
  const canSubmit =
    !locked &&
    !!form &&
    form.title.trim() !== "" &&
    form.description.trim() !== "" &&
    minutes !== null &&
    minutes >= DAY_START_MINUTES &&
    minutes <= DAY_END_MINUTES - 30 &&
    priceCents !== null;

  function submit() {
    if (
      !sheet ||
      !form ||
      !canSubmit ||
      minutes === null ||
      priceCents === null
    )
      return;
    const fields = {
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      scheduledAt: toScheduledAt(form.date, minutes),
      priceCents,
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
    });
    flash(key);
    onItemPlaced(
      pageOfDay(dayIndexOf(resolved.scheduledAt, reservation.arrivalDate)),
    );
  }

  function close() {
    setPicker(null);
    setSheet(null);
  }

  return {
    picker,
    sheet: sheet && {
      isNew: sheet.key === null,
      form: sheet.form,
      readOnly: locked,
    },
    flashKey,
    flash,
    canSubmit,
    openPicker,
    chooseCategory,
    openItem,
    setField,
    submit,
    remove,
    quickAdd,
    close,
  };
}

export type ItemEditor = ReturnType<typeof useItemEditor>;
