export const DAY_START_MINUTES = 7 * 60;
export const DAY_END_MINUTES = 24 * 60;
export const HOUR_HEIGHT = 48;
export const DAYS_PER_PAGE = 7;

const MIN_BLOCK_HEIGHT = 44;
const BLOCK_GAP = 4;

export const CALENDAR_HOURS = Array.from(
  { length: (DAY_END_MINUTES - DAY_START_MINUTES) / 60 },
  (_, index) => DAY_START_MINUTES / 60 + index,
);

export const CALENDAR_HEIGHT = CALENDAR_HOURS.length * HOUR_HEIGHT;

export const clampStartMinutes = (minutes: number) =>
  Math.min(Math.max(minutes, DAY_START_MINUTES), DAY_END_MINUTES - 30);

export function blockLayout(startMinutes: number, durationMinutes: number) {
  const start = Math.max(startMinutes, DAY_START_MINUTES);
  return {
    top: ((start - DAY_START_MINUTES) / 60) * HOUR_HEIGHT + BLOCK_GAP / 2,
    height: Math.max(
      MIN_BLOCK_HEIGHT,
      (durationMinutes / 60) * HOUR_HEIGHT - BLOCK_GAP,
    ),
  };
}

/** Maps a vertical offset inside a day column to a start time on a 30-minute grid. */
export const minutesAtOffset = (offsetY: number) =>
  clampStartMinutes(
    DAY_START_MINUTES + Math.floor(((offsetY / HOUR_HEIGHT) * 60) / 30) * 30,
  );

export const pageCount = (totalDays: number) =>
  Math.max(1, Math.ceil(totalDays / DAYS_PER_PAGE));

export const pageOfDay = (dayIndex: number) =>
  Math.floor(dayIndex / DAYS_PER_PAGE);

const DROP_STEP_MINUTES = 15;

/** Start time for a block dropped at `offsetY`, keeping the grab point under the cursor. */
export function dropStartMinutes(
  offsetY: number,
  grabOffsetY: number,
  durationMinutes: number,
) {
  const y = offsetY - grabOffsetY;
  const snapped =
    DAY_START_MINUTES +
    Math.round(((y / HOUR_HEIGHT) * 60) / DROP_STEP_MINUTES) *
      DROP_STEP_MINUTES;
  return Math.min(
    Math.max(snapped, DAY_START_MINUTES),
    Math.max(DAY_END_MINUTES - durationMinutes, DAY_START_MINUTES),
  );
}

export const RESIZE_STEP_MINUTES = 15;
export const MIN_DURATION_MINUTES = 30;
/** Blocks never render shorter than this, so layout treats them as this long. */
export const MIN_VISUAL_MINUTES = 60;

export type ResizeEdge = "top" | "bottom";
export type TimeRange = { startMinutes: number; durationMinutes: number };

export const pixelsToMinutes = (pixels: number) => (pixels / HOUR_HEIGHT) * 60;

const snap = (minutes: number) =>
  Math.round(minutes / RESIZE_STEP_MINUTES) * RESIZE_STEP_MINUTES;

/** Moves one edge by `deltaMinutes`, snapped to the grid, keeping the minimum duration and the visible day. */
export const resizeRange = (
  range: TimeRange,
  edge: ResizeEdge,
  deltaMinutes: number,
): TimeRange => {
  const end = range.startMinutes + range.durationMinutes;
  if (edge === "top") {
    const start = Math.min(
      Math.max(snap(range.startMinutes + deltaMinutes), DAY_START_MINUTES),
      end - MIN_DURATION_MINUTES,
    );
    return { startMinutes: start, durationMinutes: end - start };
  }
  const newEnd = Math.min(
    Math.max(
      snap(end + deltaMinutes),
      range.startMinutes + MIN_DURATION_MINUTES,
    ),
    DAY_END_MINUTES,
  );
  return {
    startMinutes: range.startMinutes,
    durationMinutes: newEnd - range.startMinutes,
  };
};

export type FlightKind = "arrival" | "departure";

/** The client's flight on a given stay day: landing on the first day, takeoff on the last. */
export const flightForDay = (
  stay: { arrivalMinutes: number | null; departureMinutes: number | null },
  dayIndex: number,
  dayCount: number,
): { kind: FlightKind; minutes: number } | null => {
  if (dayIndex === 0 && stay.arrivalMinutes !== null)
    return { kind: "arrival", minutes: stay.arrivalMinutes };
  if (dayIndex === dayCount - 1 && stay.departureMinutes !== null)
    return { kind: "departure", minutes: stay.departureMinutes };
  return null;
};

export const flightTop = (minutes: number) =>
  ((Math.min(Math.max(minutes, DAY_START_MINUTES), DAY_END_MINUTES) -
    DAY_START_MINUTES) /
    60) *
  HOUR_HEIGHT;

/** Duration for a start/end pair, or null unless end is after start by the minimum and within the day. */
export const durationBetween = (startMinutes: number, endMinutes: number) => {
  const duration = endMinutes - startMinutes;
  return duration >= MIN_DURATION_MINUTES &&
    startMinutes >= DAY_START_MINUTES &&
    endMinutes <= DAY_END_MINUTES
    ? duration
    : null;
};

const MIDNIGHT_END_INPUT = "23:59";

/** Time inputs cannot show 24:00, so the end of the day is written as 23:59. */
export const toEndInput = (endMinutes: number) =>
  endMinutes >= DAY_END_MINUTES
    ? MIDNIGHT_END_INPUT
    : `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

export const parseEndInput = (value: string) => {
  if (value === MIDNIGHT_END_INPUT) return DAY_END_MINUTES;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
};
