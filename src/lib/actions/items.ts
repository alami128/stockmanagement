"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { guessCategory, isItemCategory } from "@/lib/categories";
import type { ItemCategory, StockUnit } from "@/lib/types";

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

export async function addItem(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const unit = (String(formData.get("unit") || "pcs")) as StockUnit;
  const categoryRaw = String(formData.get("category") || "");
  const category: ItemCategory = isItemCategory(categoryRaw)
    ? categoryRaw
    : guessCategory(name);
  const lowStockThreshold = parseFloat(
    String(formData.get("low_stock_threshold") || "5")
  );
  const quantity = parseFloat(String(formData.get("quantity") || "0"));
  if (!name) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("items").insert({
    name,
    unit,
    category,
    quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
    low_stock_threshold: Number.isFinite(lowStockThreshold)
      ? Math.max(0, lowStockThreshold)
      : 5,
    updated_by: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/chef");
  revalidatePath("/admin");
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

  const { error } = await supabase.from("items").update(patch).eq("id", itemId);

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
