import type { ItemCategory } from "@/lib/schemas/proposal";

export const CATEGORY_STYLES: Record<
  ItemCategory,
  { dot: string; block: string; selected: string; hover: string }
> = {
  dining: {
    dot: "bg-category-dining",
    block: "border-category-dining/35 bg-category-dining/15",
    selected:
      "border-category-dining bg-category-dining/15 ring-1 ring-category-dining",
    hover: "hover:border-category-dining",
  },
  activities: {
    dot: "bg-category-activities",
    block: "border-category-activities/35 bg-category-activities/15",
    selected:
      "border-category-activities bg-category-activities/15 ring-1 ring-category-activities",
    hover: "hover:border-category-activities",
  },
  wellness: {
    dot: "bg-category-wellness",
    block: "border-category-wellness/35 bg-category-wellness/15",
    selected:
      "border-category-wellness bg-category-wellness/15 ring-1 ring-category-wellness",
    hover: "hover:border-category-wellness",
  },
  excursions: {
    dot: "bg-category-excursions",
    block: "border-category-excursions/35 bg-category-excursions/15",
    selected:
      "border-category-excursions bg-category-excursions/15 ring-1 ring-category-excursions",
    hover: "hover:border-category-excursions",
  },
  transport: {
    dot: "bg-category-transport",
    block: "border-category-transport/35 bg-category-transport/15",
    selected:
      "border-category-transport bg-category-transport/15 ring-1 ring-category-transport",
    hover: "hover:border-category-transport",
  },
  experiences: {
    dot: "bg-category-experiences",
    block: "border-category-experiences/35 bg-category-experiences/15",
    selected:
      "border-category-experiences bg-category-experiences/15 ring-1 ring-category-experiences",
    hover: "hover:border-category-experiences",
  },
};
