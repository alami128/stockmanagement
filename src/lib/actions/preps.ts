"use server";

import { createClient } from "@/lib/supabase/server";
import { kitchenToday } from "@/lib/dates";
import { revalidateKitchenDashboards } from "@/lib/revalidate-kitchen";

export async function togglePrepSelection(
  prepItemId: string,
  selected: boolean
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "chef" && profile?.role !== "admin") {
    return { error: "Only chefs can mark preps." };
  }

  const prepDate = kitchenToday();

  if (selected) {
    const { error } = await supabase.from("prep_selections").insert({
      prep_item_id: prepItemId,
      prep_date: prepDate,
      selected_by: user.id,
    });
    if (error) {
      if (error.code === "23505") return { error: null };
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("prep_selections")
      .delete()
      .eq("prep_item_id", prepItemId)
      .eq("prep_date", prepDate);
    if (error) return { error: error.message };
  }

  revalidateKitchenDashboards();
  return { error: null };
}
