import { ITEM_CATEGORIES, type ItemCategory } from "@/lib/schemas/proposal";

import { clampStartMinutes } from "./calendar";
import { CATEGORIES, CATEGORY_KEYWORDS } from "./categories";
import { firstOpenDate } from "./itinerary";
import { toScheduledAt, tripDates } from "./trip-days";

type Stay = { arrivalDate: string; departureDate: string };

export type QuickAdd = {
  title: string;
  category: ItemCategory;
  categorySource: "typed" | "inferred" | "default";
  dayIndex: number | null;
  dayOutOfRange: boolean;
  startMinutes: number | null;
  priceCents: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const FILLER = new Set(["at", "on", "for", "in", "@", "-", "usd", "and"]);

const MONTH_PATTERN =
  /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/;
const WEEKDAY_PATTERN =
  /\b(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)\b/;

const capitalize = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

/**
 * Reads a free-text line such as "surf lesson day 2 10am 220" into a draft item.
 * Anything it cannot find stays null so the caller can apply defaults.
 */
export function parseQuickAdd(input: string, stay: Stay): QuickAdd | null {
  if (!input.trim()) return null;

  const dayCount = tripDates(stay.arrivalDate, stay.departureDate).length;
  let rest = ` ${input.trim().toLowerCase()} `;
  const take = (pattern: RegExp) => {
    const match = rest.match(pattern);
    if (match) rest = rest.replace(match[0], " ");
    return match;
  };

  let priceDollars: number | null = null;
  let dayIndex: number | null = null;
  let startMinutes: number | null = null;

  const dollars = take(/\$\s?(\d{1,3}(?:,\d{3})+|\d+)/);
  if (dollars?.[1]) priceDollars = Number(dollars[1].replace(/,/g, ""));

  const dayNumber = take(/\bday\s*(\d{1,2})\b/);
  if (dayNumber?.[1]) {
    dayIndex = Number(dayNumber[1]) - 1;
  } else {
    const month = take(MONTH_PATTERN);
    if (month?.[1] && month[2]) {
      const arrival = Date.parse(`${stay.arrivalDate}T00:00:00Z`);
      const year = Number(stay.arrivalDate.slice(0, 4));
      const monthIndex = MONTHS.indexOf(month[1].slice(0, 3));
      dayIndex = Math.round(
        (Date.UTC(year, monthIndex, Number(month[2])) - arrival) / DAY_MS,
      );
    } else {
      const weekday = take(WEEKDAY_PATTERN);
      if (weekday?.[1]) {
        const target = WEEKDAYS.indexOf(weekday[1].slice(0, 3));
        const dates = tripDates(stay.arrivalDate, stay.departureDate);
        const found = dates.findIndex(
          (date) => new Date(`${date}T00:00:00Z`).getUTCDay() === target,
        );
        dayIndex = found >= 0 ? found : null;
      } else if (take(/\b(arrival|arrive|first day)\b/)) {
        dayIndex = 0;
      } else if (take(/\b(departure|depart|last day)\b/)) {
        dayIndex = dayCount - 1;
      }
    }
  }

  const dayOutOfRange =
    dayIndex !== null && (dayIndex < 0 || dayIndex >= dayCount);
  if (dayOutOfRange) dayIndex = null;

  const meridiem = take(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  const clock = meridiem ? null : take(/\b(\d{1,2}):(\d{2})\b/);
  if (meridiem?.[1] && meridiem[3]) {
    startMinutes =
      ((Number(meridiem[1]) % 12) + (meridiem[3] === "pm" ? 12 : 0)) * 60 +
      Number(meridiem[2] ?? 0);
  } else if (clock?.[1] && clock[2]) {
    startMinutes = Number(clock[1]) * 60 + Number(clock[2]);
  } else if (take(/\bnoon\b/)) startMinutes = 12 * 60;
  else if (take(/\b(tonight|evening)\b/)) startMinutes = 19 * 60;
  else if (take(/\bmorning\b/)) startMinutes = 9 * 60;
  else if (take(/\bafternoon\b/)) startMinutes = 14 * 60;

  if (priceDollars === null) {
    const numbers = rest.match(/\b\d{2,6}\b/g);
    const last = numbers?.at(-1);
    if (last) {
      priceDollars = Number(last);
      rest = rest.replace(new RegExp(`\\b${last}\\b(?!.*\\b${last}\\b)`), " ");
    }
  }

  let words = rest.split(/\s+/).filter(Boolean);

  let category: ItemCategory | null = null;
  let categorySource: QuickAdd["categorySource"] = "default";
  const typed = words.find((word) =>
    ITEM_CATEGORIES.some((id) => id === word || `${id}` === `${word}s`),
  );
  if (typed) {
    category =
      ITEM_CATEGORIES.find((id) => id === typed || id === `${typed}s`) ?? null;
    categorySource = "typed";
    words = words.filter((word) => word !== typed);
  } else {
    for (const word of words) {
      const match = ITEM_CATEGORIES.find((id) =>
        CATEGORY_KEYWORDS[id].includes(word),
      );
      if (match) {
        category = match;
        categorySource = "inferred";
        break;
      }
    }
  }

  while (words[0] && FILLER.has(words[0])) words.shift();
  while (words.length && FILLER.has(words[words.length - 1] ?? "")) words.pop();

  return {
    title: capitalize(words.join(" ")),
    category: category ?? "experiences",
    categorySource,
    dayIndex,
    dayOutOfRange,
    startMinutes,
    priceCents: priceDollars === null ? null : priceDollars * 100,
  };
}

/** Fills whatever the parse left open: first open day, category default time, zero price. */
export function resolveQuickAdd(
  parsed: QuickAdd,
  stay: Stay,
  existingItems: { scheduledAt: string }[],
) {
  const dates = tripDates(stay.arrivalDate, stay.departureDate);
  const date =
    (parsed.dayIndex !== null ? dates[parsed.dayIndex] : undefined) ??
    firstOpenDate(existingItems, stay);
  const startMinutes = clampStartMinutes(
    parsed.startMinutes ?? CATEGORIES[parsed.category].defaultStartMinutes,
  );
  const priceCents = parsed.priceCents ?? 0;
  return {
    category: parsed.category,
    title: parsed.title,
    date,
    startMinutes,
    priceCents,
    scheduledAt: toScheduledAt(date, startMinutes),
  };
}

export type ResolvedQuickAdd = ReturnType<typeof resolveQuickAdd>;
