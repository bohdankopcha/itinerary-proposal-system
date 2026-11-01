import type { ItemCategory } from "@/lib/schemas/proposal";

export const CATEGORY_STYLES: Record<
  ItemCategory,
  { dot: string; block: string; selected: string; hover: string }
> = {
  dining: {
    dot: "bg-category-dining",
    block: "border-category-dining/30 bg-category-dining/10",
    selected:
      "border-category-dining bg-category-dining/10 ring-1 ring-category-dining",
    hover: "hover:border-category-dining",
  },
  activities: {
    dot: "bg-category-activities",
    block: "border-category-activities/30 bg-category-activities/10",
    selected:
      "border-category-activities bg-category-activities/10 ring-1 ring-category-activities",
    hover: "hover:border-category-activities",
  },
  wellness: {
    dot: "bg-category-wellness",
    block: "border-category-wellness/30 bg-category-wellness/10",
    selected:
      "border-category-wellness bg-category-wellness/10 ring-1 ring-category-wellness",
    hover: "hover:border-category-wellness",
  },
  excursions: {
    dot: "bg-category-excursions",
    block: "border-category-excursions/30 bg-category-excursions/10",
    selected:
      "border-category-excursions bg-category-excursions/10 ring-1 ring-category-excursions",
    hover: "hover:border-category-excursions",
  },
  transport: {
    dot: "bg-category-transport",
    block: "border-category-transport/30 bg-category-transport/10",
    selected:
      "border-category-transport bg-category-transport/10 ring-1 ring-category-transport",
    hover: "hover:border-category-transport",
  },
  experiences: {
    dot: "bg-category-experiences",
    block: "border-category-experiences/30 bg-category-experiences/10",
    selected:
      "border-category-experiences bg-category-experiences/10 ring-1 ring-category-experiences",
    hover: "hover:border-category-experiences",
  },
};
