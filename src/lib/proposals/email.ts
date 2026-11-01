import { totalCents } from "./totals";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const proposalUrl = (proposalId: string) => {
  const base = process.env["APP_BASE_URL"] ?? "http://localhost:3000";
  return `${base.replace(/\/+$/, "")}/proposal/${proposalId}`;
};

export function buildEmailBody(proposal: {
  id: string;
  notes: string | null;
  items: { priceCents: number }[];
  reservation: {
    destination: string;
    villa: string;
    arrivalDate: Date;
    departureDate: Date;
    member: { name: string };
  };
}) {
  const { reservation } = proposal;
  const lines = [
    `Dear ${reservation.member.name},`,
    "",
    `Your concierge has prepared an itinerary for your stay at ${reservation.villa}, ${reservation.destination}, ${dateFormat.format(reservation.arrivalDate)} to ${dateFormat.format(reservation.departureDate)}.`,
    "",
    `${proposal.items.length} ${proposal.items.length === 1 ? "experience" : "experiences"} · Total ${money.format(totalCents(proposal.items) / 100)}`,
  ];
  if (proposal.notes)
    lines.push("", `A note from your concierge: ${proposal.notes}`);
  lines.push("", `Review and approve: ${proposalUrl(proposal.id)}`);
  return lines.join("\n");
}
