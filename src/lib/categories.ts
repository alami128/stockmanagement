import type { ItemCategory } from "@/lib/types";

export const ITEM_CATEGORIES: ItemCategory[] = [
  "vegetables",
  "meat",
  "seafood",
  "herbs_spices",
  "fats_oils",
  "dairy_eggs",
  "grains",
  "cleaning",
  "other",
];

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  vegetables: "Vegetables",
  meat: "Meat / Fish / Protein",
  seafood: "Seafood",
  herbs_spices: "Spices / Flavors",
  fats_oils: "Fats / Oils",
  dairy_eggs: "Dairy",
  grains: "Starches",
  cleaning: "Cleaning products",
  other: "Other",
};

export function isItemCategory(value: string): value is ItemCategory {
  return (ITEM_CATEGORIES as string[]).includes(value);
}

/** Best-effort guess used when seeding or migrating older rows. */
export function guessCategory(name: string): ItemCategory {
  const n = name.toLowerCase();

  if (
    /soap|sponge|clean|bleach|detergent|sanitiser|sanitizer|wipe/.test(n)
  ) {
    return "cleaning";
  }
  if (
    /tomato|onion|garlic|lettuce|spinach|carrot|pepper|potato|cucumber|zucchini|broccoli|celery|cabbage|leek|mushroom|aubergine|eggplant|salad|veg|beetroot|beet|fries|parsley|dill/.test(
      n
    )
  ) {
    return "vegetables";
  }
  if (
    /chicken|beef|pork|lamb|turkey|duck|meat|bacon|sausage|mince|steak|veal|chorizo|burger/.test(
      n
    )
  ) {
    return "meat";
  }
  if (/fish|salmon|tuna|shrimp|prawn|cod|seafood|mussel|clam|crab/.test(n)) {
    return "seafood";
  }
  if (/milk|cream|cheese|yogurt|yoghurt|egg|parmesan|dairy/.test(n)) {
    if (/butter|ghee|lard|shortening/.test(n)) return "fats_oils";
    return "dairy_eggs";
  }
  if (/oil|olive|vinegar|fat|mayo|margarine/.test(n)) {
    return "fats_oils";
  }
  if (
    /rice|pasta|flour|grain|noodle|couscous|quinoa|bean|lentil|chickpea|bread|cereal|starch/.test(
      n
    )
  ) {
    return "grains";
  }
  if (
    /basil|cilantro|coriander|thyme|rosemary|oregano|cumin|paprika|spice|herb|peppercorn|salt|chili|chilli|gochujang|paste/.test(
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
