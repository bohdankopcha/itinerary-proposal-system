import type { NextRequest } from "next/server";

import { handle, json, parseInput, readJson } from "@/lib/api-server/respond";
import { createProposal } from "@/lib/proposals/commands";
import { listProposals } from "@/lib/proposals/queries";
import {
  createProposalSchema,
  listProposalsQuerySchema,
} from "@/lib/schemas/proposal";

export const GET = (request: NextRequest) =>
  handle(async () => {
    const query = parseInput(
      listProposalsQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    return json(await listProposals(query));
  });

export const POST = (request: NextRequest) =>
  handle(async () => {
    const body = parseInput(createProposalSchema, await readJson(request));
    return json(await createProposal(body), 201);
  });
