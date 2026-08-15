import type { ItemCategory } from "@/lib/types";

export const ITEM_CATEGORIES: ItemCategory[] = [
  "meat",
  "seafood",
  "dairy_eggs",
  "bread_bakery",
  "vegetables",
  "sauces",
  "dry_goods",
  "desserts",
  "beverages",
  "fats_oils",
  "grains",
  "herbs_spices",
  "cleaning",
  "other",
];

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  meat: "Meat & Poultry",
  seafood: "Seafood",
  dairy_eggs: "Dairy & Cheese",
  bread_bakery: "Bread & Bakery",
  vegetables: "Vegetables & Herbs",
  sauces: "Sauces & Condiments",
  dry_goods: "Cooking & Dry Goods",
  desserts: "Desserts & Baking",
  beverages: "Beverages",
  fats_oils: "Fats / Oils",
  grains: "Starches",
  herbs_spices: "Spices / Flavors",
  cleaning: "Cleaning products",
  other: "Other",
};

/** Map Bleeding Horse CSV category labels → ItemCategory */
export const CSV_CATEGORY_MAP: Record<string, ItemCategory> = {
  "Meat & Poultry": "meat",
  Seafood: "seafood",
  "Dairy & Cheese": "dairy_eggs",
  "Bread & Bakery": "bread_bakery",
  "Vegetables & Herbs": "vegetables",
  "Sauces & Condiments": "sauces",
  "Cooking & Dry Goods": "dry_goods",
  "Desserts & Baking": "desserts",
  Beverages: "beverages",
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
    /coffee|tea|coke|juice|water|wine|beer|guinness|beverage|drink/.test(n) &&
    !/sauce|stock|broth/.test(n)
  ) {
    return "beverages";
  }
  if (
    /brownie|pudding|crumble|cake|dessert|cocoa|toffee|whiskey|whisky|espresso|vanilla|sugar/.test(
      n
    )
  ) {
    return "desserts";
  }
  if (
    /mayo|ketchup|mustard|pesto|relish|dressing|glaze|hot sauce|bbq|ranch|tartar|kimchi|pickles|sauce|condiment|nduja/.test(
      n
    )
  ) {
    return "sauces";
  }
  if (
    /bread|bun|wrap|ciabatta|sourdough|toast|bakery/.test(n) &&
    !/crumb|crouton/.test(n)
  ) {
    return "bread_bakery";
  }
  if (
    /stock|broth|flour|oil|pepper|salt|seasoning|breadcrumb|panko|crouton|egg|treacle|sesame|fries|chips/.test(
      n
    )
  ) {
    return "dry_goods";
  }
  if (
    /tomato|onion|garlic|lettuce|spinach|carrot|pepper|potato|cucumber|zucchini|broccoli|celery|cabbage|leek|mushroom|aubergine|eggplant|salad|veg|beetroot|beet|parsley|dill|basil|oregano|pea|olive|lemon|cauliflower|slaw|leaves/.test(
      n
    )
  ) {
    return "vegetables";
  }
  if (
    /chicken|beef|pork|lamb|turkey|duck|meat|bacon|sausage|mince|steak|veal|chorizo|burger|ham|wing|tender|bacon/.test(
      n
    )
  ) {
    return "meat";
  }
  if (
    /fish|salmon|tuna|shrimp|prawn|cod|seafood|mussel|clam|crab/.test(n)
  ) {
    return "seafood";
  }
  if (/milk|cream|cheese|yogurt|yoghurt|parmesan|dairy|buttermilk|mascarpone|mozzarella|feta|ice cream/.test(n)) {
    if (/butter|ghee|lard|shortening/.test(n)) return "fats_oils";
    return "dairy_eggs";
  }
  if (/oil|olive|vinegar|fat|margarine/.test(n)) {
    return "fats_oils";
  }
  if (
    /rice|pasta|grain|noodle|couscous|quinoa|bean|lentil|chickpea|cereal|starch/.test(
      n
    )
  ) {
    return "grains";
  }
  if (
    /cilantro|coriander|thyme|rosemary|cumin|paprika|spice|herb|peppercorn|chili|chilli|gochujang|paste/.test(
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
