import { db } from "../src/lib/db/client";
import { proposals } from "./seed-proposals";

const members = [
  {
    id: "member_james",
    name: "James Whitfield",
    email: "james.whitfield@example.com",
  },
  {
    id: "member_amelia",
    name: "Amelia Hart",
    email: "amelia.hart@example.com",
  },
  {
    id: "member_daniel",
    name: "Daniel Okafor",
    email: "daniel.okafor@example.com",
  },
];

const reservations = [
  {
    id: "reservation_punta_mita",
    memberId: "member_james",
    destination: "Punta Mita, Mexico",
    villa: "Villa Punta Mita",
    arrivalDate: new Date("2027-03-15T00:00:00.000Z"),
    departureDate: new Date("2027-03-22T00:00:00.000Z"),
  },
  {
    id: "reservation_cabo_azul",
    memberId: "member_amelia",
    destination: "Cabo San Lucas, Mexico",
    villa: "Villa Cabo Azul",
    arrivalDate: new Date("2027-04-05T00:00:00.000Z"),
    departureDate: new Date("2027-04-12T00:00:00.000Z"),
  },
  {
    id: "reservation_maya_sol",
    memberId: "member_daniel",
    destination: "Riviera Maya, Mexico",
    villa: "Villa Maya Sol",
    arrivalDate: new Date("2027-05-10T00:00:00.000Z"),
    departureDate: new Date("2027-05-17T00:00:00.000Z"),
  },
];

async function main() {
  for (const { id, ...data } of members) {
    await db.member.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }
  for (const { id, ...data } of reservations) {
    await db.reservation.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }
  for (const { id, items, ...data } of proposals) {
    const exists = await db.proposal.findUnique({ where: { id } });
    if (exists) continue;
    await db.proposal.create({
      data: { id, ...data, items: { create: items } },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
