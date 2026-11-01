import { ITEM_CATEGORIES, type ItemCategory } from "@/lib/schemas/proposal";

export type CategoryMeta = {
  label: string;
  examples: string;
  titleHint: string;
  durationMinutes: number;
  defaultStartMinutes: number;
};

export const CATEGORIES: Record<ItemCategory, CategoryMeta> = {
  dining: {
    label: "Dining",
    examples: "Private chef dinner, restaurant reservation",
    titleHint: "Private chef dinner",
    durationMinutes: 120,
    defaultStartMinutes: 19 * 60 + 30,
  },
  activities: {
    label: "Activities",
    examples: "Surf lesson, snorkeling, ATV tour",
    titleHint: "Surf lesson",
    durationMinutes: 120,
    defaultStartMinutes: 10 * 60,
  },
  wellness: {
    label: "Wellness",
    examples: "Spa treatment, yoga session, massage",
    titleHint: "Massage",
    durationMinutes: 90,
    defaultStartMinutes: 9 * 60,
  },
  excursions: {
    label: "Excursions",
    examples: "Whale watching, sailing charter, cultural tour",
    titleHint: "Whale watching",
    durationMinutes: 180,
    defaultStartMinutes: 9 * 60,
  },
  transport: {
    label: "Transport",
    examples: "Airport transfer, private car, helicopter",
    titleHint: "Airport transfer",
    durationMinutes: 60,
    defaultStartMinutes: 11 * 60,
  },
  experiences: {
    label: "Experiences",
    examples: "Sunset cocktails, bonfire on the beach, tequila tasting",
    titleHint: "Sunset cocktails",
    durationMinutes: 120,
    defaultStartMinutes: 18 * 60 + 30,
  },
};

export const CATEGORY_LIST = ITEM_CATEGORIES.map((id) => ({
  id,
  ...CATEGORIES[id],
}));

export const CATEGORY_KEYWORDS: Record<ItemCategory, string[]> = {
  dining: [
    "chef",
    "dinner",
    "restaurant",
    "lunch",
    "breakfast",
    "brunch",
    "omakase",
  ],
  activities: [
    "surf",
    "surfing",
    "snorkel",
    "snorkeling",
    "atv",
    "golf",
    "hike",
    "hiking",
    "paddle",
    "kayak",
    "tennis",
    "diving",
  ],
  wellness: [
    "spa",
    "yoga",
    "massage",
    "facial",
    "pilates",
    "meditation",
    "sound",
  ],
  excursions: [
    "whale",
    "whales",
    "sailing",
    "sail",
    "charter",
    "cultural",
    "tour",
    "island",
    "islands",
    "boat",
    "catamaran",
  ],
  transport: [
    "airport",
    "transfer",
    "car",
    "helicopter",
    "driver",
    "chauffeur",
    "pickup",
    "shuttle",
  ],
  experiences: [
    "sunset",
    "cocktail",
    "cocktails",
    "bonfire",
    "tequila",
    "tasting",
    "mezcal",
    "wine",
    "stargazing",
  ],
};
