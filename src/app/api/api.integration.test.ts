import { NextRequest } from "next/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db/client";
import { apiErrorSchema } from "@/lib/schemas/error";
import {
  proposalListSchema,
  proposalSchema,
  sendProposalResultSchema,
  type CreateProposalInput,
  type ProposalItemInput,
} from "@/lib/schemas/proposal";
import { reservationListSchema } from "@/lib/schemas/reservation";

import { GET as getProposalRoute, PATCH, PUT } from "./proposals/[id]/route";
import { POST as sendRoute } from "./proposals/[id]/send/route";
import {
  GET as listProposalsRoute,
  POST as createRoute,
} from "./proposals/route";
import { GET as listReservationsRoute } from "./reservations/route";

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}));

const JAMES = "reservation_punta_mita";
const AMELIA = "reservation_cabo_azul";

const item = (overrides: Record<string, unknown> = {}) =>
  ({
    category: "dining",
    title: "Private chef dinner",
    description: "Five courses on the terrace",
    scheduledAt: "2027-03-16T19:00:00.000Z",
    priceCents: 120_000,
    ...overrides,
  }) as ProposalItemInput;

const body = (
  overrides: Partial<CreateProposalInput> = {},
): CreateProposalInput => ({
  reservationId: JAMES,
  notes: "Welcome home",
  items: [
    item(),
    item({ category: "wellness", title: "Massage", priceCents: 25_000 }),
  ],
  ...overrides,
});

const call = (
  route: (req: NextRequest, ctx: never) => Promise<Response>,
  {
    url = "http://localhost/api",
    method = "GET",
    json,
    raw,
    id,
  }: CallOptions = {},
) => {
  const request = new NextRequest(url, {
    method,
    body: raw ?? (json === undefined ? undefined : JSON.stringify(json)),
    headers: { "Content-Type": "application/json" },
  });
  return route(request, { params: Promise.resolve({ id }) } as never);
};

type CallOptions = {
  url?: string;
  method?: string;
  json?: unknown;
  raw?: string;
  id?: string;
};

const create = async (overrides?: Partial<CreateProposalInput>) => {
  const response = await call(createRoute, {
    method: "POST",
    json: body(overrides),
  });
  expect(response.status).toBe(201);
  return proposalSchema.parse(await response.json());
};

const errorOf = async (response: Response) =>
  apiErrorSchema.parse(await response.json()).error;

beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.mocked(console.log).mockClear();
});

describe("GET /api/reservations", () => {
  it("returns seeded reservations with members, ordered by arrival", async () => {
    const response = await call(listReservationsRoute);
    expect(response.status).toBe(200);
    const { items } = reservationListSchema.parse(await response.json());
    expect(items.map((r) => r.member.name)).toEqual([
      "James Whitfield",
      "Amelia Hart",
      "Daniel Okafor",
    ]);
    expect(items[0]).toMatchObject({
      villa: "Villa Punta Mita",
      arrivalDate: "2027-03-15",
      departureDate: "2027-03-22",
    });
  });
});

describe("POST /api/proposals", () => {
  it("creates a draft with items, computed total, and persists it", async () => {
    const proposal = await create();

    expect(proposal).toMatchObject({
      status: "draft",
      notes: "Welcome home",
      totalCents: 145_000,
    });
    expect(proposal.sentAt).toBeNull();
    expect(proposal.items.map((i) => i.title)).toEqual([
      "Private chef dinner",
      "Massage",
    ]);

    const row = await db.proposal.findUniqueOrThrow({
      where: { id: proposal.id },
      include: { items: true },
    });
    expect(row.status).toBe("draft");
    expect(row.reservationId).toBe(JAMES);
    expect(row.items).toHaveLength(2);
  });

  it("orders items by scheduled time", async () => {
    const proposal = await create({
      items: [
        item({ title: "Late", scheduledAt: "2027-03-20T20:00:00.000Z" }),
        item({ title: "Early", scheduledAt: "2027-03-15T09:00:00.000Z" }),
      ],
    });
    expect(proposal.items.map((i) => i.title)).toEqual(["Early", "Late"]);
  });

  it("stores empty notes as null", async () => {
    const proposal = await create({ notes: "   " });
    expect(proposal.notes).toBeNull();
    const row = await db.proposal.findUniqueOrThrow({
      where: { id: proposal.id },
    });
    expect(row.notes).toBeNull();
  });

  it("400 on malformed JSON", async () => {
    const response = await call(createRoute, { method: "POST", raw: "{nope" });
    expect(response.status).toBe(400);
    expect((await errorOf(response)).code).toBe("VALIDATION_ERROR");
  });

  it("400 with details for schema violations and writes nothing", async () => {
    const before = await db.proposal.count();
    const response = await call(createRoute, {
      method: "POST",
      json: body({ items: [item({ priceCents: -5, category: "spa" })] }),
    });
    expect(response.status).toBe(400);
    const error = await errorOf(response);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details?.map((d) => d.path)).toEqual(
      expect.arrayContaining(["items.0.category", "items.0.priceCents"]),
    );
    expect(await db.proposal.count()).toBe(before);
  });

  it("400 when no items are given", async () => {
    const response = await call(createRoute, {
      method: "POST",
      json: body({ items: [] }),
    });
    expect(response.status).toBe(400);
  });

  it("400 when an item is outside the trip", async () => {
    const before = await db.proposal.count();
    const response = await call(createRoute, {
      method: "POST",
      json: body({
        items: [item({ scheduledAt: "2027-03-23T10:00:00.000Z" })],
      }),
    });
    expect(response.status).toBe(400);
    const error = await errorOf(response);
    expect(error.details?.[0]?.path).toBe("items.0.scheduledAt");
    expect(await db.proposal.count()).toBe(before);
  });

  it("accepts an item on the departure day", async () => {
    const proposal = await create({
      items: [item({ scheduledAt: "2027-03-22T18:00:00.000Z" })],
    });
    expect(proposal.items).toHaveLength(1);
  });

  it("404 for an unknown reservation", async () => {
    const response = await call(createRoute, {
      method: "POST",
      json: body({ reservationId: "nope" }),
    });
    expect(response.status).toBe(404);
    expect((await errorOf(response)).code).toBe("NOT_FOUND");
  });
});

describe("GET /api/proposals", () => {
  it("filters by reservation, newest first, with summaries", async () => {
    const first = await create({
      reservationId: AMELIA,
      items: [item({ scheduledAt: "2027-04-06T10:00:00.000Z" })],
    });
    const second = await create({
      reservationId: AMELIA,
      items: [
        item({ scheduledAt: "2027-04-07T10:00:00.000Z", priceCents: 500 }),
      ],
    });

    const response = await call(listProposalsRoute, {
      url: `http://localhost/api/proposals?reservationId=${AMELIA}`,
    });
    expect(response.status).toBe(200);
    const { items } = proposalListSchema.parse(await response.json());
    expect(
      items.map((p) => p.id).filter((id) => [first.id, second.id].includes(id)),
    ).toEqual([second.id, first.id]);
    expect(items[0]).toMatchObject({
      itemCount: 1,
      totalCents: 500,
      status: "draft",
    });
    expect(items.every((p) => p.reservationId === AMELIA)).toBe(true);
  });

  it("returns every reservation's proposals without a filter", async () => {
    const mine = await create();
    const response = await call(listProposalsRoute);
    const { items } = proposalListSchema.parse(await response.json());
    expect(items.map((p) => p.id)).toContain(mine.id);
  });

  it("404 for an unknown reservation filter", async () => {
    const response = await call(listProposalsRoute, {
      url: "http://localhost/api/proposals?reservationId=nope",
    });
    expect(response.status).toBe(404);
  });
});

describe("GET /api/proposals/[id]", () => {
  it("returns the proposal with reservation and member", async () => {
    const created = await create();
    const response = await call(getProposalRoute, { id: created.id });
    expect(response.status).toBe(200);
    const proposal = proposalSchema.parse(await response.json());
    expect(proposal.reservation.member.email).toBe(
      "james.whitfield@example.com",
    );
    expect(proposal.totalCents).toBe(145_000);
  });

  it("404 for an unknown id with the shared error shape", async () => {
    const response = await call(getProposalRoute, { id: "missing" });
    expect(response.status).toBe(404);
    expect(await errorOf(response)).toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("PUT /api/proposals/[id]", () => {
  it("replaces note and items of a draft, keeping status", async () => {
    const created = await create();
    const response = await call(PUT, {
      method: "PUT",
      id: created.id,
      json: {
        notes: "",
        items: [
          item({
            title: "Surf lesson",
            category: "activities",
            priceCents: 9_000,
          }),
        ],
      },
    });
    expect(response.status).toBe(200);
    const updated = proposalSchema.parse(await response.json());
    expect(updated).toMatchObject({
      status: "draft",
      notes: null,
      totalCents: 9_000,
    });
    expect(updated.items.map((i) => i.title)).toEqual(["Surf lesson"]);
    expect(
      await db.proposalItem.count({ where: { proposalId: created.id } }),
    ).toBe(1);
  });

  it("validates items against the trip and leaves the draft untouched", async () => {
    const created = await create();
    const response = await call(PUT, {
      method: "PUT",
      id: created.id,
      json: { items: [item({ scheduledAt: "2027-03-01T10:00:00.000Z" })] },
    });
    expect(response.status).toBe(400);
    expect(
      await db.proposalItem.count({ where: { proposalId: created.id } }),
    ).toBe(2);
  });

  it("409 NOT_EDITABLE once sent, and changes nothing", async () => {
    const created = await create();
    await call(sendRoute, { method: "POST", id: created.id });

    const response = await call(PUT, {
      method: "PUT",
      id: created.id,
      json: { notes: "tampered", items: [item({ title: "Tampered" })] },
    });
    expect(response.status).toBe(409);
    expect((await errorOf(response)).code).toBe("NOT_EDITABLE");

    const row = await db.proposal.findUniqueOrThrow({
      where: { id: created.id },
      include: { items: true },
    });
    expect(row.notes).toBe("Welcome home");
    expect(row.items.map((i) => i.title)).not.toContain("Tampered");
  });

  it("404 for an unknown id", async () => {
    const response = await call(PUT, {
      method: "PUT",
      id: "missing",
      json: body(),
    });
    expect(response.status).toBe(404);
  });
});

describe("POST /api/proposals/[id]/send", () => {
  it("moves draft to sent, writes a SentEmail atomically, and logs it", async () => {
    const created = await create();
    const response = await call(sendRoute, { method: "POST", id: created.id });
    expect(response.status).toBe(200);

    const result = sendProposalResultSchema.parse(await response.json());
    expect(result.status).toBe("sent");
    expect(result.sentAt).not.toBeNull();
    expect(result.sentEmail).toMatchObject({
      proposalId: created.id,
      toEmail: "james.whitfield@example.com",
    });
    expect(result.sentEmail.bodyPreview).toContain(`/proposal/${created.id}`);
    expect(result.sentEmail.bodyPreview).toContain("$1,450.00");
    expect(result.sentEmail.bodyPreview).toContain("Welcome home");

    const row = await db.proposal.findUniqueOrThrow({
      where: { id: created.id },
      include: { sentEmails: true },
    });
    expect(row.status).toBe("sent");
    expect(row.sentAt).not.toBeNull();
    expect(row.sentEmails).toHaveLength(1);
    expect(console.log).toHaveBeenCalledOnce();
  });

  it("409 when sending twice, with exactly one email recorded", async () => {
    const created = await create();
    await call(sendRoute, { method: "POST", id: created.id });
    const again = await call(sendRoute, { method: "POST", id: created.id });
    expect(again.status).toBe(409);
    expect((await errorOf(again)).code).toBe("INVALID_TRANSITION");
    expect(
      await db.sentEmail.count({ where: { proposalId: created.id } }),
    ).toBe(1);
  });

  it("422 EMPTY_PROPOSAL rolls back: still a draft, no email", async () => {
    const created = await create();
    await db.proposalItem.deleteMany({ where: { proposalId: created.id } });

    const response = await call(sendRoute, { method: "POST", id: created.id });
    expect(response.status).toBe(422);
    expect((await errorOf(response)).code).toBe("EMPTY_PROPOSAL");

    const row = await db.proposal.findUniqueOrThrow({
      where: { id: created.id },
      include: { sentEmails: true },
    });
    expect(row.status).toBe("draft");
    expect(row.sentAt).toBeNull();
    expect(row.sentEmails).toHaveLength(0);
    expect(console.log).not.toHaveBeenCalled();
  });

  it("404 for an unknown id", async () => {
    const response = await call(sendRoute, { method: "POST", id: "missing" });
    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/proposals/[id]", () => {
  const patch = (id: string, status: unknown) =>
    call(PATCH, { method: "PATCH", id, json: { status } });

  const sent = async () => {
    const created = await create();
    await call(sendRoute, { method: "POST", id: created.id });
    return created.id;
  };

  it("runs the full loop create -> send -> approve -> pay, persisting each step", async () => {
    const id = await sent();

    const approved = await patch(id, "approved");
    expect(approved.status).toBe(200);
    expect(proposalSchema.parse(await approved.json())).toMatchObject({
      status: "approved",
    });
    let row = await db.proposal.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("approved");
    expect(row.approvedAt).not.toBeNull();
    expect(row.paidAt).toBeNull();

    const paid = await patch(id, "paid");
    expect(paid.status).toBe(200);
    expect(proposalSchema.parse(await paid.json())).toMatchObject({
      status: "paid",
    });
    row = await db.proposal.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("paid");
    expect(row.paidAt).not.toBeNull();
  });

  it.each([
    ["draft", "approved"],
    ["draft", "paid"],
    ["draft", "sent"],
  ])("409 for %s -> %s", async (_from, to) => {
    const created = await create();
    const response = await patch(created.id, to);
    expect(response.status).toBe(409);
    const error = await errorOf(response);
    expect(error.code).toBe("INVALID_TRANSITION");
    expect(error.message).toContain("draft");
    expect(error.message).toContain(to);
  });

  it("409 for sent -> paid (skipping) and sent -> sent via PATCH", async () => {
    const id = await sent();
    expect((await patch(id, "paid")).status).toBe(409);
    expect((await patch(id, "sent")).status).toBe(409);
    expect(
      (await db.proposal.findUniqueOrThrow({ where: { id } })).status,
    ).toBe("sent");
  });

  it("409 for repeated approve and for any move out of paid", async () => {
    const id = await sent();
    await patch(id, "approved");
    const repeat = await patch(id, "approved");
    expect(repeat.status).toBe(409);
    expect((await errorOf(repeat)).message).toContain('"approved"');

    await patch(id, "paid");
    for (const status of ["draft", "sent", "approved", "paid"]) {
      expect((await patch(id, status)).status).toBe(409);
    }
    expect(
      (await db.proposal.findUniqueOrThrow({ where: { id } })).status,
    ).toBe("paid");
  });

  it("only one of two concurrent approvals succeeds", async () => {
    const id = await sent();
    const [a, b] = await Promise.all([
      patch(id, "approved"),
      patch(id, "approved"),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
  });

  it("400 for a missing or unknown status", async () => {
    const created = await create();
    expect((await patch(created.id, undefined)).status).toBe(400);
    expect((await patch(created.id, "cancelled")).status).toBe(400);
  });

  it("404 for an unknown id", async () => {
    expect((await patch("missing", "approved")).status).toBe(404);
  });
});
