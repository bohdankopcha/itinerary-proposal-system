import type { ProposalStatus } from "@/lib/schemas/proposal";

import { nightsBetween } from "./trip-days";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const exactDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatMoney = (cents: number) => {
  return (cents % 100 === 0 ? wholeDollars : exactDollars).format(cents / 100);
};

export const dateParts = (date: string) => {
  const value = new Date(`${date}T00:00:00.000Z`);
  return {
    weekday: WEEKDAYS[value.getUTCDay()] ?? "",
    weekdayLong: WEEKDAYS_LONG[value.getUTCDay()] ?? "",
    month: MONTHS[value.getUTCMonth()] ?? "",
    monthLong: MONTHS_LONG[value.getUTCMonth()] ?? "",
    day: value.getUTCDate(),
    year: value.getUTCFullYear(),
  };
};

export const formatDayShort = (date: string) => {
  const { weekday, day } = dateParts(date);
  return `${weekday} ${day}`;
};

export const formatDayMonth = (date: string) => {
  const { weekday, day, month } = dateParts(date);
  return `${weekday} ${day} ${month}`;
};

export const formatDayLong = (date: string) => {
  const { weekdayLong, month, day } = dateParts(date);
  return `${weekdayLong}, ${month} ${day}`;
};

export const formatDayFull = (date: string) => {
  const { weekdayLong, monthLong, day } = dateParts(date);
  return `${weekdayLong}, ${monthLong} ${day}`;
};

export const formatDateWithYear = (date: string) => {
  const { weekday, month, day, year } = dateParts(date);
  return `${weekday}, ${month} ${day}, ${year}`;
};

const referenceCode = (id: string) => {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return String(1000 + ((hash >>> 0) % 9000));
};

export const formatConfirmationNumber = (proposal: {
  id: string;
  reservation: { destination: string; arrivalDate: string };
}) => {
  const place = proposal.reservation.destination.split(",")[0] ?? "";
  const initials = place
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const [, month, day] = proposal.reservation.arrivalDate.split("-");
  return `${initials}-${month}${day}-${referenceCode(proposal.id)}`;
};

export const formatRange = (arrivalDate: string, departureDate: string) => {
  const from = dateParts(arrivalDate);
  const to = dateParts(departureDate);
  const toLabel =
    from.month === to.month ? `${to.day}` : `${to.month} ${to.day}`;
  return `${from.month} ${from.day} – ${toLabel}`;
};

export const formatNights = (arrivalDate: string, departureDate: string) => {
  const nights = nightsBetween(arrivalDate, departureDate);
  return `${nights} ${nights === 1 ? "night" : "nights"}`;
};

export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = String(minutes % 60).padStart(2, "0");
  return `${hours % 12 || 12}:${rest} ${hours >= 12 && hours < 24 ? "PM" : "AM"}`;
};

export const formatTimeRange = (
  startMinutes: number,
  durationMinutes: number | null,
) =>
  durationMinutes === null
    ? formatTime(startMinutes)
    : `${formatTime(startMinutes)} – ${formatTime(startMinutes + durationMinutes)}`;

export const formatHourLabel = (hour: number) => {
  return `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`;
};

export const formatStamp = (iso: string) => {
  const value = new Date(iso);
  const time = `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`;
  return `${MONTHS[value.getUTCMonth()]} ${value.getUTCDate()}, ${time}`;
};

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
  paid: "Paid",
};

type Timestamps = {
  createdAt: string;
  sentAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
};

export const latestActivity = (
  proposal: Timestamps & { status: ProposalStatus },
) => {
  const at =
    (proposal.status === "paid" && proposal.paidAt) ||
    (proposal.status === "approved" && proposal.approvedAt) ||
    (proposal.status === "sent" && proposal.sentAt) ||
    proposal.createdAt;
  const verb =
    proposal.status === "draft" ? "Created" : STATUS_LABELS[proposal.status];
  return { at, label: `${verb} ${formatStamp(at)}` };
};
