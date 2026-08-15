/**
 * Seeds demo data into Supabase: one user per role plus the kitchen
 * order-list starter items.
 *
 * Usage:
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * to be set (e.g. in .env.local).
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

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

const DEMO_ITEMS: {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  low_stock_threshold: number;
}[] = [
  // Vegetables
  { name: "Parsley", quantity: 8, unit: "pcs", category: "vegetables", low_stock_threshold: 4 },
  { name: "Skinny fries", quantity: 10, unit: "kg", category: "vegetables", low_stock_threshold: 5 },
  { name: "Beetroot", quantity: 6, unit: "kg", category: "vegetables", low_stock_threshold: 3 },
  { name: "Dill", quantity: 5, unit: "pcs", category: "vegetables", low_stock_threshold: 3 },

  // Meat / Fish / Protein
  { name: "Chicken breast", quantity: 8, unit: "kg", category: "meat", low_stock_threshold: 4 },
  {
    name: "Beef (for beef sandwich)",
    quantity: 0.5,
    unit: "kg",
    category: "meat",
    low_stock_threshold: 2,
  },
  {
    name: "Beef Burgers (3oz)",
    quantity: 3,
    unit: "pcs",
    category: "meat",
    low_stock_threshold: 6,
  },
  {
    name: "Italian sausages",
    quantity: 4,
    unit: "kg",
    category: "meat",
    low_stock_threshold: 3,
  },
  { name: "Chorizo", quantity: 3, unit: "kg", category: "meat", low_stock_threshold: 2 },

  // Spices / Flavors
  {
    name: "Gochujang paste",
    quantity: 2,
    unit: "bottle",
    category: "herbs_spices",
    low_stock_threshold: 1,
  },

  // Dairy (listed under fats column on order sheet)
  { name: "Vegan cheese", quantity: 4, unit: "pcs", category: "dairy_eggs", low_stock_threshold: 2 },
  { name: "Parmesan", quantity: 2, unit: "kg", category: "dairy_eggs", low_stock_threshold: 1 },
  { name: "Milk", quantity: 0, unit: "bottle", category: "dairy_eggs", low_stock_threshold: 4 },
  { name: "Smoked cheese", quantity: 3, unit: "pcs", category: "dairy_eggs", low_stock_threshold: 2 },

  // Starches
  {
    name: "Gluten free bread",
    quantity: 6,
    unit: "pcs",
    category: "grains",
    low_stock_threshold: 4,
  },
  {
    name: "Plain flour",
    quantity: 5,
    unit: "kg",
    category: "grains",
    low_stock_threshold: 5,
  },

  // Cleaning products
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

async function seedItems() {
  let created = 0;
  for (const item of DEMO_ITEMS) {
    const { data: existing } = await supabase
      .from("items")
      .select("id")
      .eq("name", item.name)
      .maybeSingle();

    if (existing) {
      console.log(`Skipping item ${item.name} (already exists)`);
      continue;
    }

    let { error } = await supabase.from("items").insert(item);

    // Older DBs may not allow `cleaning` yet — fall back so items still appear.
    if (error && item.category === "cleaning") {
      console.warn(
        `Category "cleaning" not allowed yet for ${item.name}; inserting as "other". Run supabase/migrations/20260815_add_cleaning_category.sql`
      );
      ({ error } = await supabase
        .from("items")
        .insert({ ...item, category: "other" }));
    }

    if (error) {
      console.error(`Failed to create item ${item.name}:`, error.message);
    } else {
      created += 1;
      console.log(`Created item: ${item.name}`);
    }
  }
  console.log(`Seeded ${created} new items (${DEMO_ITEMS.length} in default list).`);
}

async function main() {
  await seedUsers();
  await seedItems();
  console.log("\nDone. Demo logins (password: kitchen123):");
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(12)} ${u.email}`));
}

main();
