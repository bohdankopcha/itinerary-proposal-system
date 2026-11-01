import { z } from "zod";

import { reservationSchema } from "./reservation";

export const ITEM_CATEGORIES = [
  "dining",
  "activities",
  "wellness",
  "excursions",
  "transport",
  "experiences",
] as const;
export const itemCategorySchema = z.enum(ITEM_CATEGORIES);
export type ItemCategory = z.infer<typeof itemCategorySchema>;

export const PROPOSAL_STATUSES = ["draft", "sent", "approved", "paid"] as const;
export const proposalStatusSchema = z.enum(PROPOSAL_STATUSES);
export type ProposalStatus = z.infer<typeof proposalStatusSchema>;

export const idSchema = z.string().min(1);

export const idParamsSchema = z.object({ id: idSchema });

const requiredText = (max: number) => z.string().trim().min(1).max(max);

export const proposalItemInputSchema = z.object({
  category: itemCategorySchema,
  title: requiredText(120),
  description: requiredText(1000),
  scheduledAt: z.iso.datetime(),
  priceCents: z.number().int().min(0),
  durationMinutes: z.number().int().min(15).max(1020).nullish(),
});
export type ProposalItemInput = z.infer<typeof proposalItemInputSchema>;

const notesSchema = z
  .string()
  .trim()
  .max(2000)
  .nullish()
  .transform((value) => value || null);

const itemsInputSchema = z.array(proposalItemInputSchema).min(1).max(50);

export const createProposalSchema = z.object({
  reservationId: idSchema,
  notes: notesSchema,
  items: itemsInputSchema,
});
export type CreateProposalInput = z.input<typeof createProposalSchema>;
export type CreateProposalData = z.output<typeof createProposalSchema>;

export const replaceProposalSchema = z.object({
  notes: notesSchema,
  items: itemsInputSchema,
});
export type ReplaceProposalInput = z.input<typeof replaceProposalSchema>;
export type ReplaceProposalData = z.output<typeof replaceProposalSchema>;

export const updateStatusSchema = z.object({ status: proposalStatusSchema });
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const listProposalsQuerySchema = z.object({
  reservationId: idSchema.optional(),
});

export const proposalItemSchema = z.object({
  id: z.string(),
  category: itemCategorySchema,
  title: z.string(),
  description: z.string(),
  scheduledAt: z.iso.datetime(),
  priceCents: z.number().int(),
  durationMinutes: z.number().int().nullable(),
});
export type ProposalItem = z.infer<typeof proposalItemSchema>;

const timestamp = z.iso.datetime();

export const proposalSchema = z.object({
  id: z.string(),
  status: proposalStatusSchema,
  notes: z.string().nullable(),
  totalCents: z.number().int(),
  createdAt: timestamp,
  updatedAt: timestamp,
  sentAt: timestamp.nullable(),
  approvedAt: timestamp.nullable(),
  paidAt: timestamp.nullable(),
  reservation: reservationSchema,
  items: z.array(proposalItemSchema),
});
export type Proposal = z.infer<typeof proposalSchema>;

export const proposalSummarySchema = z.object({
  id: z.string(),
  reservationId: z.string(),
  status: proposalStatusSchema,
  notes: z.string().nullable(),
  itemCount: z.number().int(),
  totalCents: z.number().int(),
  createdAt: timestamp,
  sentAt: timestamp.nullable(),
  approvedAt: timestamp.nullable(),
  paidAt: timestamp.nullable(),
});
export type ProposalSummary = z.infer<typeof proposalSummarySchema>;

export const proposalListSchema = z.object({
  items: z.array(proposalSummarySchema),
});
export type ProposalList = z.infer<typeof proposalListSchema>;

export const sentEmailSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  toEmail: z.string(),
  bodyPreview: z.string(),
  sentAt: timestamp,
});
export type SentEmail = z.infer<typeof sentEmailSchema>;

export const sendProposalResultSchema = proposalSchema.extend({
  sentEmail: sentEmailSchema,
});
export type SendProposalResult = z.infer<typeof sendProposalResultSchema>;
