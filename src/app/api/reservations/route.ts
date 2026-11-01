import { connection } from "next/server";

import { handle, json } from "@/lib/api-server/respond";
import { listReservations } from "@/lib/proposals/queries";

export async function GET() {
  await connection();
  return handle(async () => json(await listReservations()));
}
