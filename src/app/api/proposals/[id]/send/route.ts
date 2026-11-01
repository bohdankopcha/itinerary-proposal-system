import type { NextRequest } from "next/server";

import { handle, json, parseInput } from "@/lib/api-server/respond";
import { sendProposal } from "@/lib/proposals/commands";
import { idParamsSchema } from "@/lib/schemas/proposal";

export const POST = (
  _request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]/send">,
) =>
  handle(async () => {
    const { id } = parseInput(idParamsSchema, await ctx.params);
    return json(await sendProposal(id));
  });
