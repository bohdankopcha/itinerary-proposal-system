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
