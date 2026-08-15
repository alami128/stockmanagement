import type { ItemCategory } from "@/lib/types";

export const ITEM_CATEGORIES: ItemCategory[] = [
  "vegetables",
  "meat",
  "seafood",
  "dairy_eggs",
  "fats_oils",
  "grains",
  "herbs_spices",
  "other",
];

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  vegetables: "Vegetables",
  meat: "Meat",
  seafood: "Seafood",
  dairy_eggs: "Dairy & Eggs",
  fats_oils: "Fats & Oils",
  grains: "Grains & Dry Goods",
  herbs_spices: "Herbs & Spices",
  other: "Other",
};

export const CATEGORY_ACCENT: Record<ItemCategory, string> = {
  vegetables: "from-emerald-500 to-lime-400",
  meat: "from-rose-500 to-orange-400",
  seafood: "from-sky-500 to-cyan-400",
  dairy_eggs: "from-amber-400 to-yellow-300",
  fats_oils: "from-yellow-500 to-amber-300",
  grains: "from-orange-400 to-amber-200",
  herbs_spices: "from-teal-500 to-emerald-300",
  other: "from-stone-400 to-stone-300",
};

export function isItemCategory(value: string): value is ItemCategory {
  return (ITEM_CATEGORIES as string[]).includes(value);
}

/** Best-effort guess used when seeding or migrating older rows. */
export function guessCategory(name: string): ItemCategory {
  const n = name.toLowerCase();

  if (
    /tomato|onion|garlic|lettuce|spinach|carrot|pepper|potato|cucumber|zucchini|broccoli|celery|cabbage|leek|mushroom|aubergine|eggplant|salad|veg/.test(
      n
    )
  ) {
    return "vegetables";
  }
  if (
    /chicken|beef|pork|lamb|turkey|duck|meat|bacon|sausage|mince|steak|veal/.test(
      n
    )
  ) {
    return "meat";
  }
  if (/fish|salmon|tuna|shrimp|prawn|cod|seafood|mussel|clam|crab/.test(n)) {
    return "seafood";
  }
  if (/milk|cream|cheese|yogurt|yoghurt|egg|butter|dairy/.test(n)) {
    // Butter is often treated as a fat in kitchens
    if (/butter|ghee|lard|shortening/.test(n)) return "fats_oils";
    return "dairy_eggs";
  }
  if (/oil|olive|vinegar|fat|mayo|margarine/.test(n)) {
    return "fats_oils";
  }
  if (
    /rice|pasta|flour|grain|noodle|couscous|quinoa|bean|lentil|chickpea|bread|cereal/.test(
      n
    )
  ) {
    return "grains";
  }
  if (
    /basil|parsley|cilantro|coriander|thyme|rosemary|oregano|cumin|paprika|spice|herb|peppercorn|salt|chili|chilli/.test(
      n
    )
  ) {
    return "herbs_spices";
  }

  return "other";
}

export function groupItemsByCategory<T extends { category: ItemCategory }>(
  items: T[]
): { category: ItemCategory; items: T[] }[] {
  const buckets = new Map<ItemCategory, T[]>();
  for (const cat of ITEM_CATEGORIES) buckets.set(cat, []);

  for (const item of items) {
    const cat = isItemCategory(item.category) ? item.category : "other";
    buckets.get(cat)!.push(item);
  }

  return ITEM_CATEGORIES.map((category) => ({
    category,
    items: buckets.get(category)!,
  })).filter((group) => group.items.length > 0);
}
