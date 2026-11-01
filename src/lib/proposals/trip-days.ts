const DAY_MS = 24 * 60 * 60 * 1000;

const toUtc = (date: string) => new Date(`${date}T00:00:00.000Z`).getTime();
const pad = (value: number) => String(value).padStart(2, "0");

export const nightsBetween = (arrivalDate: string, departureDate: string) => {
  return Math.round((toUtc(departureDate) - toUtc(arrivalDate)) / DAY_MS);
};

/** Every calendar date of the stay, arrival and departure inclusive. */
export const tripDates = (arrivalDate: string, departureDate: string) => {
  const count = nightsBetween(arrivalDate, departureDate) + 1;
  return Array.from({ length: Math.max(count, 0) }, (_, index) =>
    new Date(toUtc(arrivalDate) + index * DAY_MS).toISOString().slice(0, 10),
  );
};

export const dateOf = (scheduledAt: string) => scheduledAt.slice(0, 10);

export const dayIndexOf = (scheduledAt: string, arrivalDate: string) =>
  Math.round((toUtc(dateOf(scheduledAt)) - toUtc(arrivalDate)) / DAY_MS);

export const minutesOf = (scheduledAt: string) =>
  Number(scheduledAt.slice(11, 13)) * 60 + Number(scheduledAt.slice(14, 16));

export const toScheduledAt = (date: string, minutes: number) =>
  `${date}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00.000Z`;

export const toTimeInput = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const parseTimeInput = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
};
