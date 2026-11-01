import type { ItemCategory } from "@/lib/schemas/proposal";

export const PASS_COLORS: Record<ItemCategory, string> = {
  dining: "bg-pass-dining",
  activities: "bg-pass-activities",
  wellness: "bg-pass-wellness",
  excursions: "bg-pass-excursions",
  transport: "bg-pass-transport",
  experiences: "bg-pass-experiences",
};
