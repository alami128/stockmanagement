"use server";

import { createClient } from "@/lib/supabase/server";
import { kitchenToday } from "@/lib/dates";
import { revalidateKitchenDashboards } from "@/lib/revalidate-kitchen";
import type { KitchenTaskType } from "@/lib/types";

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
      error: "Only chefs can manage kitchen status." as const,
      user: null,
      supabase,
    };
  }

  return { error: null, user, supabase };
}

export async function addKitchenTask(
  taskType: KitchenTaskType,
  name: string
): Promise<{ error: string | null }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Enter a description." };

  const auth = await requireChef();
  if (auth.error || !auth.user) return { error: auth.error };

  const { error } = await auth.supabase.from("kitchen_status_tasks").insert({
    task_date: kitchenToday(),
    task_type: taskType,
    name: trimmed,
    created_by: auth.user.id,
  });

  if (error) return { error: error.message };

  revalidateKitchenDashboards();
  return { error: null };
}

export async function toggleKitchenEquipmentTask(
  equipmentId: string,
  taskType: KitchenTaskType,
  selected: boolean
): Promise<{ error: string | null }> {
  const auth = await requireChef();
  if (auth.error || !auth.user) return { error: auth.error };

  const { supabase, user } = auth;
  const taskDate = kitchenToday();

  if (selected) {
    const { data: equipment } = await supabase
      .from("kitchen_equipment")
      .select("name")
      .eq("id", equipmentId)
      .single();

    if (!equipment) return { error: "Equipment not found." };

    const { error } = await supabase.from("kitchen_status_tasks").insert({
      equipment_id: equipmentId,
      task_date: taskDate,
      task_type: taskType,
      name: equipment.name,
      created_by: user.id,
    });

    if (error) {
      if (error.code === "23505") return { error: null };
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("kitchen_status_tasks")
      .delete()
      .eq("equipment_id", equipmentId)
      .eq("task_date", taskDate)
      .eq("task_type", taskType);
    if (error) return { error: error.message };
  }

  revalidateKitchenDashboards();
  return { error: null };
}

export async function toggleKitchenTaskDone(
  taskId: string,
  done: boolean
): Promise<{ error: string | null }> {
  const auth = await requireChef();
  if (auth.error) return { error: auth.error };

  const { error } = await auth.supabase
    .from("kitchen_status_tasks")
    .update({
      done,
      done_at: done ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidateKitchenDashboards();
  return { error: null };
}

export async function removeKitchenTask(
  taskId: string
): Promise<{ error: string | null }> {
  const auth = await requireChef();
  if (auth.error) return { error: auth.error };

  const { error } = await auth.supabase
    .from("kitchen_status_tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidateKitchenDashboards();
  return { error: null };
}
