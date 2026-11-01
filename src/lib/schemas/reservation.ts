import { z } from "zod";

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
export type Member = z.infer<typeof memberSchema>;

export const reservationSchema = z.object({
  id: z.string(),
  destination: z.string(),
  villa: z.string(),
  arrivalDate: z.iso.date(),
  departureDate: z.iso.date(),
  member: memberSchema,
});
export type Reservation = z.infer<typeof reservationSchema>;

export const reservationListSchema = z.object({
  items: z.array(reservationSchema),
});
export type ReservationList = z.infer<typeof reservationListSchema>;
