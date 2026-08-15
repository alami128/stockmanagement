"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { guessCategory, isItemCategory } from "@/lib/categories";
import type { ItemCategory, Role, StockUnit } from "@/lib/types";

export type ActionResult = { error: string | null };

const CAN_MANAGE_ITEMS: Role[] = ["chef", "admin"];

async function requireItemManager() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const, user: null, role: null };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as Role | undefined;
  if (!role || !CAN_MANAGE_ITEMS.includes(role)) {
    return {
      error: "Only chefs and admins can add or manage items." as const,
      user: null,
      role: null,
    };
  }

  return { error: null, user, role };
}

export async function setItemQuantity(itemId: string, quantity: number) {
  const safeQuantity = Math.max(0, quantity);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("items")
    .update({
      quantity: safeQuantity,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath("/chef");
  revalidatePath("/senior-chef");
}

export async function addItem(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") || "").trim();
  const unitRaw = String(formData.get("unit") || "pcs");
  const unit = unitRaw as StockUnit;
  const categoryRaw = String(formData.get("category") || "");
  const category: ItemCategory = isItemCategory(categoryRaw)
    ? categoryRaw
    : guessCategory(name);
  const lowStockThreshold = parseFloat(
    String(formData.get("low_stock_threshold") || "5")
  );
  const quantity = parseFloat(String(formData.get("quantity") || "0"));
  if (!name) return { error: "Name is required." };

  const auth = await requireItemManager();
  if (auth.error || !auth.user) return { error: auth.error || "Not signed in." };

  const base = {
    name,
    quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
    low_stock_threshold: Number.isFinite(lowStockThreshold)
      ? Math.max(0, lowStockThreshold)
      : 5,
    updated_by: auth.user.id,
  };

  // Insert with the service role after we've verified the caller is a
  // chef/admin. Avoids brittle RLS/current_role failures on insert.
  const admin = createAdminClient();

  let { error } = await admin.from("items").insert({
    ...base,
    unit,
    category,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    const schemaGap =
      msg.includes("category") ||
      msg.includes("bottle") ||
      msg.includes("schema cache") ||
      msg.includes("check constraint");

    if (schemaGap) {
      const legacyUnit = unit === "bottle" ? "L" : unit;
      ({ error } = await admin.from("items").insert({
        ...base,
        unit: legacyUnit,
      }));
    }
  }

  if (error) {
    return {
      error:
        error.message.includes("category") || error.message.includes("bottle")
          ? "Database is missing recent updates. Run the SQL in supabase/migrations in your Supabase SQL editor, then try again."
          : error.message,
    };
  }

  revalidatePath("/chef");
  revalidatePath("/admin");
  revalidatePath("/senior-chef");
  return { error: null };
}

export async function renameItem(itemId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const auth = await requireItemManager();
  if (auth.error || !auth.user) throw new Error(auth.error || "Not signed in");
  if (auth.role !== "admin") throw new Error("Admin access required");

  const admin = createAdminClient();
  const { error } = await admin
    .from("items")
    .update({ name: trimmed })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/chef");
  revalidatePath("/senior-chef");
}

export async function updateItemSettings(
  itemId: string,
  unit: StockUnit,
  lowStockThreshold: number,
  category?: ItemCategory
): Promise<ActionResult> {
  const auth = await requireItemManager();
  if (auth.error || !auth.user) {
    return { error: auth.error || "Not signed in." };
  }
  if (auth.role !== "admin") {
    return { error: "Admin access required." };
  }

  const admin = createAdminClient();
  const patch: {
    unit: StockUnit;
    low_stock_threshold: number;
    category?: ItemCategory;
  } = {
    unit,
    low_stock_threshold: Math.max(0, lowStockThreshold),
  };
  if (category && isItemCategory(category)) {
    patch.category = category;
  }

  const { error } = await admin.from("items").update(patch).eq("id", itemId);

  if (error) {
    const msg = error.message.toLowerCase();
    const schemaGap =
      msg.includes("check constraint") ||
      msg.includes("items_unit_check") ||
      msg.includes("category") ||
      msg.includes("bottle") ||
      msg.includes("bags") ||
      msg.includes("packets") ||
      msg.includes("boxes") ||
      msg.includes("schema cache") ||
      msg.includes("invalid input");

    return {
      error: schemaGap
        ? "Your database doesn’t allow “boxes” yet. In Supabase → SQL Editor, run: alter table public.items drop constraint if exists items_unit_check; alter table public.items add constraint items_unit_check check (unit in ('pcs', 'bottle', 'bags', 'packets', 'boxes', 'kg', 'g', 'L', 'ml'));"
        : error.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/chef");
  revalidatePath("/senior-chef");
  return { error: null };
}

export async function removeItem(itemId: string) {
  const auth = await requireItemManager();
  if (auth.error || !auth.user) throw new Error(auth.error || "Not signed in");

  const admin = createAdminClient();
  const { error } = await admin.from("items").delete().eq("id", itemId);
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("foreign key") || msg.includes("restrict")) {
      throw new Error(
        "This item is used in an order, so it can’t be deleted yet."
      );
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/chef");
  revalidatePath("/senior-chef");
}
