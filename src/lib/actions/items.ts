"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { guessCategory, isItemCategory } from "@/lib/categories";
import type { ItemCategory, StockUnit } from "@/lib/types";

export type ActionResult = { error: string | null };

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

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const base = {
    name,
    quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
    low_stock_threshold: Number.isFinite(lowStockThreshold)
      ? Math.max(0, lowStockThreshold)
      : 5,
    updated_by: user.id,
  };

  // Prefer the full schema (category + bottle). If the live database
  // hasn't been migrated yet, fall back so adding items still works.
  let { error } = await supabase.from("items").insert({
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
      ({ error } = await supabase.from("items").insert({
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

  const supabase = createClient();
  const { error } = await supabase
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
) {
  const supabase = createClient();
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

  let { error } = await supabase.from("items").update(patch).eq("id", itemId);

  // Legacy DB without category / bottle: update unit + threshold only.
  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("category") ||
      msg.includes("bottle") ||
      msg.includes("schema cache")
    ) {
      ({ error } = await supabase
        .from("items")
        .update({
          unit: unit === "bottle" ? "L" : unit,
          low_stock_threshold: Math.max(0, lowStockThreshold),
        })
        .eq("id", itemId));
    }
  }

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/chef");
  revalidatePath("/senior-chef");
}

export async function removeItem(itemId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/chef");
  revalidatePath("/senior-chef");
}
