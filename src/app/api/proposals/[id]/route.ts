import type { NextRequest } from "next/server";

import { handle, json, parseInput, readJson } from "@/lib/api-server/respond";
import { changeStatus, replaceDraft } from "@/lib/proposals/commands";
import { getProposal } from "@/lib/proposals/queries";
import {
  idParamsSchema,
  replaceProposalSchema,
  updateStatusSchema,
} from "@/lib/schemas/proposal";

export const GET = (
  _request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]">,
) =>
  handle(async () => {
    const { id } = parseInput(idParamsSchema, await ctx.params);
    return json(await getProposal(id));
  });

export const PUT = (
  request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]">,
) =>
  handle(async () => {
    const { id } = parseInput(idParamsSchema, await ctx.params);
    const body = parseInput(replaceProposalSchema, await readJson(request));
    return json(await replaceDraft(id, body));
  });

export const PATCH = (
  request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]">,
) =>
  handle(async () => {
    const { id } = parseInput(idParamsSchema, await ctx.params);
    const { status } = parseInput(updateStatusSchema, await readJson(request));
    return json(await changeStatus(id, status));
  });
