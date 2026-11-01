import { ITEM_CATEGORIES, type ItemCategory } from "@/lib/schemas/proposal";

export type CategoryMeta = {
  label: string;
  titleHint: string;
  durationMinutes: number;
  defaultStartMinutes: number;
};

export const CATEGORIES: Record<ItemCategory, CategoryMeta> = {
  dining: {
    label: "Dining",
    titleHint: "Private chef dinner",
    durationMinutes: 120,
    defaultStartMinutes: 19 * 60 + 30,
  },
  activities: {
    label: "Activities",
    titleHint: "Surf lesson",
    durationMinutes: 120,
    defaultStartMinutes: 10 * 60,
  },
  wellness: {
    label: "Wellness",
    titleHint: "Massage",
    durationMinutes: 90,
    defaultStartMinutes: 9 * 60,
  },
  excursions: {
    label: "Excursions",
    titleHint: "Whale watching",
    durationMinutes: 180,
    defaultStartMinutes: 9 * 60,
  },
  transport: {
    label: "Transport",
    titleHint: "Airport transfer",
    durationMinutes: 60,
    defaultStartMinutes: 11 * 60,
  },
  experiences: {
    label: "Experiences",
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

export const itemDurationMinutes = (item: {
  category: ItemCategory;
  durationMinutes?: number | null;
}) => item.durationMinutes ?? CATEGORIES[item.category].durationMinutes;
