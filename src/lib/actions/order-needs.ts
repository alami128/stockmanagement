"use server";

import { createClient } from "@/lib/supabase/server";
import { kitchenToday } from "@/lib/dates";
import { revalidateKitchenDashboards } from "@/lib/revalidate-kitchen";

async function requireChef() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const, user: null, supabase };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "chef" && profile?.role !== "admin") {
    return {
      error: "Only chefs can flag order needs." as const,
      user: null,
      supabase,
    };
  }

  return { error: null, user, supabase };
}

export async function toggleOrderNeed(
  itemId: string,
  needed: boolean
): Promise<{ error: string | null }> {
  const auth = await requireChef();
  if (auth.error || !auth.user) return { error: auth.error };

  const { supabase, user } = auth;
  const needDate = kitchenToday();

  if (needed) {
    const { error } = await supabase.from("order_needs").insert({
      item_id: itemId,
      need_date: needDate,
      flagged_by: user.id,
    });
    if (error) {
      if (error.code === "23505") return { error: null };
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("order_needs")
      .delete()
      .eq("item_id", itemId)
      .eq("need_date", needDate);
    if (error) return { error: error.message };
  }

  revalidateKitchenDashboards();
  return { error: null };
}
