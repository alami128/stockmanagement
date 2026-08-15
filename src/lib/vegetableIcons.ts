/** 6×6 vegetable sprite sheet at /icons/vegetables.png (1024×1024). */

export type VegSprite = { row: number; col: number };

const COLS = 6;
const ROWS = 6;

/** Exact name matches (lowercased). */
const BY_NAME: Record<string, VegSprite> = {
  parsley: { row: 0, col: 5 },
  dill: { row: 0, col: 5 },
  "skinny fries": { row: 0, col: 0 },
  beetroot: { row: 3, col: 2 },
  beet: { row: 3, col: 2 },
};

/** Pattern → sprite (first match wins). */
const BY_PATTERN: { test: RegExp; sprite: VegSprite }[] = [
  { test: /beetroot|beet\b/, sprite: { row: 3, col: 2 } },
  { test: /fries|potato|yam/, sprite: { row: 0, col: 0 } },
  { test: /parsley|dill|kale|lettuce|herb|leaf/, sprite: { row: 0, col: 5 } },
  { test: /cherry.?tomato/, sprite: { row: 1, col: 4 } },
  { test: /tomato/, sprite: { row: 1, col: 0 } },
  { test: /spring.?onion|scallion|green.?onion/, sprite: { row: 1, col: 1 } },
  { test: /red.?onion/, sprite: { row: 0, col: 4 } },
  { test: /onion/, sprite: { row: 2, col: 1 } },
  { test: /garlic/, sprite: { row: 5, col: 4 } },
  { test: /leek/, sprite: { row: 1, col: 2 } },
  { test: /carrot/, sprite: { row: 3, col: 4 } },
  { test: /broccoli/, sprite: { row: 3, col: 1 } },
  { test: /cauliflower/, sprite: { row: 1, col: 5 } },
  { test: /corn|maize/, sprite: { row: 0, col: 3 } },
  { test: /mushroom/, sprite: { row: 2, col: 2 } },
  { test: /cucumber|zucchini|courgette/, sprite: { row: 2, col: 5 } },
  { test: /chili|chilli|pepper/, sprite: { row: 4, col: 1 } },
  { test: /radish|daikon/, sprite: { row: 3, col: 3 } },
  { test: /pea|bean/, sprite: { row: 2, col: 0 } },
  { test: /olive/, sprite: { row: 4, col: 3 } },
  { test: /pumpkin|squash/, sprite: { row: 4, col: 4 } },
  { test: /artichoke/, sprite: { row: 4, col: 2 } },
  { test: /bok.?choy|cabbage/, sprite: { row: 0, col: 2 } },
  { test: /lemon/, sprite: { row: 0, col: 1 } },
  { test: /veg/, sprite: { row: 0, col: 5 } },
];

export function resolveVegetableSprite(name: string): VegSprite | null {
  const n = name.trim().toLowerCase();
  if (BY_NAME[n]) return BY_NAME[n];
  for (const entry of BY_PATTERN) {
    if (entry.test.test(n)) return entry.sprite;
  }
  return null;
}

/** CSS background-position for a cell in an N×N sprite sheet. */
export function spriteBackgroundPosition(sprite: VegSprite): string {
  const x = `${(sprite.col / (COLS - 1)) * 100}%`;
  const y = `${(sprite.row / (ROWS - 1)) * 100}%`;
  return `${x} ${y}`;
}

export const VEG_SPRITE_URL = "/icons/vegetables.png";
export const VEG_SPRITE_SIZE = "600% 600%";
