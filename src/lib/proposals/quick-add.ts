import { ITEM_CATEGORIES, type ItemCategory } from "@/lib/schemas/proposal";

import {
  clampStartMinutes,
  DAY_END_MINUTES,
  durationBetween,
  MIN_DURATION_MINUTES,
} from "./calendar";
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
  durationMinutes: number | null;
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

const CLOCK = String.raw`(\d{1,2})(?::(\d{2}))?\s*(am|pm)?`;
const RANGE_PATTERN = new RegExp(
  String.raw`(?:\bfrom\s+)?\b${CLOCK}\s*(?:-|–|—|\bto\b|\btill\b|\btil\b|\buntil\b)\s*${CLOCK}\b`,
);
const UNTIL_PATTERN = new RegExp(
  String.raw`\b(?:till|til|until|to)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b`,
);
const LONG_DURATION_PATTERN =
  /\bfor\s+(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr|h)\b(?:\s*(?:and\s+)?(\d+)\s*(?:minutes|minute|mins|min|m)\b)?/;
const SHORT_DURATION_PATTERN =
  /\bfor\s+(\d+)\s*(?:minutes|minute|mins|min|m)\b/;

type Clock = {
  hours: number;
  minutes: number;
  meridiem?: string;
  colon: boolean;
};

const toClock = (hours?: string, minutes?: string, meridiem?: string) =>
  hours === undefined
    ? null
    : ({
        hours: Number(hours),
        minutes: Number(minutes ?? 0),
        meridiem,
        colon: minutes !== undefined,
      } satisfies Clock);

const validClock = ({ hours, minutes, meridiem }: Clock) =>
  minutes < 60 && (meridiem ? hours >= 1 && hours <= 12 : hours <= 23);

const clockMinutes = ({ hours, minutes, meridiem }: Clock) =>
  (meridiem ? (hours % 12) + (meridiem === "pm" ? 12 : 0) : hours) * 60 +
  minutes;

/** Candidate readings of a clock without a meridiem, most likely first: same half of the day as the reference, then the other. */
const bareCandidates = (clock: Clock, referenceMinutes: number | null) => {
  const direct = clockMinutes(clock);
  if (clock.hours > 12 || clock.hours === 0 || referenceMinutes === null)
    return [direct];
  const morning = (clock.hours % 12) * 60 + clock.minutes;
  const afternoon = morning + 12 * 60;
  return referenceMinutes >= 12 * 60
    ? [afternoon, morning]
    : [morning, afternoon];
};

const endOfDayAware = (minutes: number) =>
  minutes === 0 ? DAY_END_MINUTES : minutes;

/** Picks the reading of an end clock that lands after the start; midnight counts as 24:00. */
const resolveEnd = (end: Clock, startMinutes: number) => {
  const candidates = end.meridiem
    ? [endOfDayAware(clockMinutes(end))]
    : bareCandidates(end, startMinutes);
  return candidates.find((minutes) => minutes > startMinutes) ?? null;
};

/** Duration in minutes from a "for 2h" / "for 90 min" phrase, or null when it is below the minimum. */
const toDuration = (minutes: number) =>
  Number.isFinite(minutes) && minutes >= MIN_DURATION_MINUTES
    ? Math.round(minutes)
    : null;

/** Reads "7-9pm" style clock pairs, inheriting a missing meridiem; null when it is not clearly a time range. */
const readRange = (start: Clock, end: Clock) => {
  if (!validClock(start) || !validClock(end)) return null;
  if (!start.meridiem && !end.meridiem) {
    if (!start.colon || !end.colon) return null;
  }
  const startCandidates = start.meridiem
    ? [clockMinutes(start)]
    : end.meridiem
      ? [
          clockMinutes({ ...start, meridiem: end.meridiem }),
          clockMinutes({
            ...start,
            meridiem: end.meridiem === "pm" ? "am" : "pm",
          }),
        ]
      : bareCandidates(start, null);
  for (const startMinutes of startCandidates) {
    const endMinutes = resolveEnd(end, startMinutes);
    if (endMinutes !== null) return { start: startMinutes, end: endMinutes };
  }
  return start.meridiem && end.meridiem
    ? { start: clockMinutes(start), end: endOfDayAware(clockMinutes(end)) }
    : null;
};

const capitalize = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

/**
 * Reads a free-text line such as "surf lesson day 2 10am 220" into a draft item.
 * Anything it cannot find stays null so the caller can apply defaults.
 */
export const parseQuickAdd = (input: string, stay: Stay): QuickAdd | null => {
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
  let durationMinutes: number | null = null;
  let startFromClock = false;

  const dollars = take(/\$\s?(\d{1,3}(?:,\d{3})+|\d+)/);
  if (dollars?.[1]) priceDollars = Number(dollars[1].replace(/,/g, ""));

  const longDuration = take(LONG_DURATION_PATTERN);
  const shortDuration = longDuration ? null : take(SHORT_DURATION_PATTERN);
  if (longDuration?.[1])
    durationMinutes = toDuration(
      Number(longDuration[1]) * 60 + Number(longDuration[2] ?? 0),
    );
  else if (shortDuration?.[1])
    durationMinutes = toDuration(Number(shortDuration[1]));

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

  const range = rest.match(RANGE_PATTERN);
  const rangeStart = range && toClock(range[1], range[2], range[3]);
  const rangeEnd = range && toClock(range[4], range[5], range[6]);
  if (rangeStart && rangeEnd && range) {
    const resolvedRange = readRange(rangeStart, rangeEnd);
    if (resolvedRange) {
      rest = rest.replace(range[0], " ");
      startMinutes = resolvedRange.start;
      durationMinutes = durationBetween(resolvedRange.start, resolvedRange.end);
      startFromClock = true;
    }
  }

  if (startMinutes === null) {
    const meridiem = take(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
    const clock = meridiem ? null : take(/\b(\d{1,2}):(\d{2})\b/);
    if (meridiem?.[1] && meridiem[3]) {
      startMinutes =
        ((Number(meridiem[1]) % 12) + (meridiem[3] === "pm" ? 12 : 0)) * 60 +
        Number(meridiem[2] ?? 0);
      startFromClock = true;
    } else if (clock?.[1] && clock[2]) {
      startMinutes = Number(clock[1]) * 60 + Number(clock[2]);
      startFromClock = true;
    } else if (take(/\bnoon\b/)) startMinutes = 12 * 60;
    else if (take(/\b(tonight|evening)\b/)) startMinutes = 19 * 60;
    else if (take(/\bmorning\b/)) startMinutes = 9 * 60;
    else if (take(/\bafternoon\b/)) startMinutes = 14 * 60;
  }

  if (startFromClock && startMinutes !== null && durationMinutes === null) {
    const until = rest.match(UNTIL_PATTERN);
    const untilClock = until && toClock(until[1], until[2], until[3]);
    if (until && untilClock && validClock(untilClock)) {
      const endMinutes = resolveEnd(untilClock, startMinutes);
      if (endMinutes !== null) {
        rest = rest.replace(until[0], " ");
        durationMinutes = durationBetween(startMinutes, endMinutes);
      } else if (untilClock.meridiem) rest = rest.replace(until[0], " ");
    }
  }

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
    durationMinutes,
    priceCents: priceDollars === null ? null : priceDollars * 100,
  };
};

/** Fills whatever the parse left open: first open day, category default time, zero price. */
export const resolveQuickAdd = (
  parsed: QuickAdd,
  stay: Stay,
  existingItems: { scheduledAt: string }[],
) => {
  const dates = tripDates(stay.arrivalDate, stay.departureDate);
  const date =
    (parsed.dayIndex !== null ? dates[parsed.dayIndex] : undefined) ??
    firstOpenDate(existingItems, stay);
  const startMinutes = clampStartMinutes(
    parsed.startMinutes ?? CATEGORIES[parsed.category].defaultStartMinutes,
  );
  const priceCents = parsed.priceCents ?? 0;
  const durationMinutes =
    parsed.durationMinutes === null
      ? null
      : durationBetween(
          startMinutes,
          Math.min(startMinutes + parsed.durationMinutes, DAY_END_MINUTES),
        );
  return {
    category: parsed.category,
    title: parsed.title,
    date,
    startMinutes,
    durationMinutes,
    priceCents,
    scheduledAt: toScheduledAt(date, startMinutes),
  };
};

export type ResolvedQuickAdd = ReturnType<typeof resolveQuickAdd>;
