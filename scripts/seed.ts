/**
 * Seeds demo data into Supabase: one user per role plus the Bleeding Horse
 * stock list (and a few kitchen extras like cleaning products).
 *
 * Usage:
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (e.g. in .env.local). Also run
 * supabase/migrations/20260815_add_bleeding_horse_categories.sql
 * in the Supabase SQL editor first.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const CSV_CATEGORY_MAP: Record<string, string> = {
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  { name: "Chef Alex", email: "chef@example.com", role: "chef" },
  {
    name: "Senior Chef Sam",
    email: "seniorchef@example.com",
    role: "senior_chef",
  },
  { name: "Admin Jordan", email: "admin@example.com", role: "admin" },
];

const DEMO_PASSWORD = "kitchen123";

type SeedItem = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  low_stock_threshold: number;
};

function guessUnit(name: string, category: string): string {
  const n = name.toLowerCase();
  if (category === "sauces" || /mayo|sauce|dressing|glaze|ketchup|mustard|pesto|relish|oil/.test(n)) {
    return "bottle";
  }
  if (category === "beverages") {
    if (/beans|tea$/.test(n)) return "bags";
    if (/milk|juice|water|coke|wine/.test(n)) return "bottle";
    return "bottle";
  }
  if (category === "bread_bakery" || category === "desserts") return "pcs";
  if (category === "dairy_eggs") {
    if (/milk|cream|buttermilk/.test(n)) return "bottle";
    if (/ice cream/.test(n)) return "boxes";
    return "pcs";
  }
  if (category === "meat" || category === "seafood") {
    if (/burger|patty|portion|wing|tender/.test(n)) return "pcs";
    return "kg";
  }
  if (category === "vegetables") {
    if (/lettuce|leaves|basil|oregano|lemon|garlic|onion|cucumber|pepper/.test(n)) {
      return "pcs";
    }
    return "kg";
  }
  if (category === "dry_goods") {
    if (/egg/.test(n)) return "pcs";
    if (/oil|guinness/.test(n)) return "bottle";
    if (/seasoning|pepper|salt|seed|cocoa|sugar|flour|breadcrumb|stock|broth|treacle/.test(n)) {
      return "bags";
    }
    if (/fries|chips/.test(n)) return "kg";
    return "bags";
  }
  if (category === "cleaning") return /soap/.test(n) ? "bottle" : "pcs";
  return "pcs";
}

function parseCsvItems(csvPath: string): SeedItem[] {
  const text = readFileSync(csvPath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const items: SeedItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const comma = line.indexOf(",");
    if (comma < 0) continue;
    const csvCategory = line.slice(0, comma).trim();
    const name = line.slice(comma + 1).trim();
    if (!name) continue;

    const category = CSV_CATEGORY_MAP[csvCategory];
    if (!category) {
      console.warn(`Unknown CSV category "${csvCategory}" for ${name}; skipping`);
      continue;
    }

    items.push({
      name,
      quantity: 5,
      unit: guessUnit(name, category),
      category,
      low_stock_threshold: 2,
    });
  }

  return items;
}

/** Kitchen extras not on the Bleeding Horse menu stock sheet. */
const EXTRA_ITEMS: SeedItem[] = [
  {
    name: "Parsley",
    quantity: 8,
    unit: "pcs",
    category: "vegetables",
    low_stock_threshold: 4,
  },
  {
    name: "Beetroot",
    quantity: 6,
    unit: "kg",
    category: "vegetables",
    low_stock_threshold: 3,
  },
  {
    name: "Dill",
    quantity: 5,
    unit: "pcs",
    category: "vegetables",
    low_stock_threshold: 3,
  },
  {
    name: "Gluten free bread",
    quantity: 6,
    unit: "pcs",
    category: "bread_bakery",
    low_stock_threshold: 4,
  },
  {
    name: "Vegan cheese",
    quantity: 4,
    unit: "pcs",
    category: "dairy_eggs",
    low_stock_threshold: 2,
  },
  {
    name: "Gochujang paste",
    quantity: 2,
    unit: "bottle",
    category: "sauces",
    low_stock_threshold: 1,
  },
  {
    name: "Italian sausages",
    quantity: 4,
    unit: "kg",
    category: "meat",
    low_stock_threshold: 3,
  },
  {
    name: "Hand soap (North Shore)",
    quantity: 2,
    unit: "bottle",
    category: "cleaning",
    low_stock_threshold: 2,
  },
  {
    name: "Yellow sponges",
    quantity: 8,
    unit: "pcs",
    category: "cleaning",
    low_stock_threshold: 4,
  },
];

function mergeItems(csvItems: SeedItem[], extras: SeedItem[]): SeedItem[] {
  const byName = new Map<string, SeedItem>();
  for (const item of csvItems) {
    byName.set(item.name.toLowerCase(), item);
  }
  for (const item of extras) {
    if (!byName.has(item.name.toLowerCase())) {
      byName.set(item.name.toLowerCase(), item);
    }
  }
  return [...byName.values()];
}

async function seedUsers() {
  for (const u of DEMO_USERS) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", u.email)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (error) {
        console.error(`Failed to reset ${u.email}:`, error.message);
      } else {
        console.log(`Reset password for ${u.email} / ${DEMO_PASSWORD}`);
      }
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });

    if (error) {
      console.error(`Failed to create ${u.email}:`, error.message);
    } else {
      console.log(`Created ${u.role}: ${u.email} / ${DEMO_PASSWORD}`);
    }
  }
}

async function seedItems(items: SeedItem[]) {
  const CATEGORY_FALLBACK: Record<string, string> = {
    bread_bakery: "grains",
    sauces: "herbs_spices",
    dry_goods: "grains",
    desserts: "other",
    beverages: "other",
  };

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let usedFallback = false;

  for (const item of items) {
    const { data: existing } = await supabase
      .from("items")
      .select("id, category")
      .eq("name", item.name)
      .maybeSingle();

    if (existing) {
      if (existing.category !== item.category) {
        const { error } = await supabase
          .from("items")
          .update({ category: item.category })
          .eq("id", existing.id);
        if (error) {
          // DB may not allow the new category yet — leave as-is.
        } else {
          updated += 1;
          console.log(`Updated category: ${item.name} → ${item.category}`);
        }
      } else {
        skipped += 1;
      }
      continue;
    }

    let { error } = await supabase.from("items").insert(item);

    if (error) {
      const msg = error.message.toLowerCase();
      const fallback = CATEGORY_FALLBACK[item.category];
      if (
        fallback &&
        (msg.includes("check constraint") || msg.includes("category"))
      ) {
        usedFallback = true;
        ({ error } = await supabase
          .from("items")
          .insert({ ...item, category: fallback }));
      }
    }

    if (error) {
      failed += 1;
      console.error(`Failed to create item ${item.name}:`, error.message);
    } else {
      created += 1;
      console.log(`Created item: ${item.name} (${item.category})`);
    }
  }

  console.log(
    `Seeded ${created} new items (${updated} categories updated, ${skipped} unchanged, ${failed} failed, ${items.length} in list).`
  );
  if (usedFallback) {
    console.warn(
      "\nSome items used temporary categories. Run this in Supabase SQL Editor, then re-run npm run seed:\n"
    );
    console.warn(
      "  alter table public.items drop constraint if exists items_category_check;\n" +
        "  alter table public.items add constraint items_category_check\n" +
        "  check (category in (\n" +
        "    'vegetables', 'meat', 'seafood', 'dairy_eggs', 'bread_bakery',\n" +
        "    'sauces', 'dry_goods', 'desserts', 'beverages',\n" +
        "    'fats_oils', 'grains', 'herbs_spices', 'cleaning', 'other'\n" +
        "  ));\n"
    );
  }
}

type PrepMenuEntry = {
  name: string;
  section?: string;
  sort_order?: number;
};

async function seedPreps() {
  const menuPath = join(process.cwd(), "scripts/data/prep_menu.json");
  let entries: PrepMenuEntry[] = [];
  try {
    entries = JSON.parse(readFileSync(menuPath, "utf8")) as PrepMenuEntry[];
  } catch {
    console.warn("No prep_menu.json found; skipping prep items.");
    return;
  }

  if (entries.length === 0) {
    console.log("No prep menu entries yet (prep_menu.json is empty).");
    return;
  }

  let created = 0;
  for (const [index, entry] of entries.entries()) {
    const name = entry.name?.trim();
    if (!name) continue;

    const { data: existing } = await supabase
      .from("prep_items")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase.from("prep_items").insert({
      name,
      section: entry.section?.trim() || "Menu",
      sort_order: entry.sort_order ?? index,
    });

    if (error) {
      console.error(`Failed to create prep item ${name}:`, error.message);
    } else {
      created += 1;
      console.log(`Created prep item: ${name}`);
    }
  }

  console.log(`Seeded ${created} prep menu items.`);
}

async function main() {
  const csvPath = join(
    process.cwd(),
    "scripts/data/bleeding_horse_stock_list_clean.csv"
  );
  const csvItems = parseCsvItems(csvPath);
  const items = mergeItems(csvItems, EXTRA_ITEMS);
  console.log(
    `Loaded ${csvItems.length} CSV items + extras → ${items.length} total`
  );

  await seedUsers();
  await seedItems(items);
  await seedPreps();
  console.log("\nDone. Demo logins (password: kitchen123):");
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(12)} ${u.email}`));
}

main();
