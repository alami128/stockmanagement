/**
 * Seeds demo data into Supabase: one user per role plus a starter
 * list of kitchen items.
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

const DEMO_ITEMS: { name: string; quantity: number; unit: string; low_stock_threshold: number }[] = [
  { name: "Chicken", quantity: 12, unit: "kg", low_stock_threshold: 5 },
  { name: "Tomatoes", quantity: 2, unit: "kg", low_stock_threshold: 5 },
  { name: "Milk", quantity: 0, unit: "bottle", low_stock_threshold: 4 },
  { name: "Rice", quantity: 20, unit: "kg", low_stock_threshold: 8 },
  { name: "Onions", quantity: 15, unit: "kg", low_stock_threshold: 5 },
  { name: "Olive Oil", quantity: 3, unit: "bottle", low_stock_threshold: 2 },
  { name: "Eggs", quantity: 6, unit: "pcs", low_stock_threshold: 12 },
  { name: "Butter", quantity: 1, unit: "kg", low_stock_threshold: 2 },
];

async function seedUsers() {
  for (const u of DEMO_USERS) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", u.email)
      .maybeSingle();

    if (existing) {
      console.log(`Skipping ${u.email} (already exists)`);
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
  for (const item of DEMO_ITEMS) {
    const { data: existing } = await supabase
      .from("items")
      .select("id")
      .eq("name", item.name)
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase.from("items").insert(item);
    if (error)
      console.error(`Failed to create item ${item.name}:`, error.message);
  }
  console.log(`Seeded ${DEMO_ITEMS.length} demo items.`);
}

async function main() {
  await seedUsers();
  await seedItems();
  console.log("\nDone. Demo logins (password: kitchen123):");
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(12)} ${u.email}`));
}

main();
