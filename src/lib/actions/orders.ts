"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface OrderLine {
  itemId: string;
  quantity: number;
  notes?: string;
}

export async function createOrder(lines: OrderLine[]) {
  const usableLines = lines.filter((l) => l.quantity > 0);
  if (usableLines.length === 0) {
    throw new Error("Enter a quantity for at least one item.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ created_by: user.id, status: "draft" })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Could not create order");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    usableLines.map((l) => ({
      order_id: order.id,
      item_id: l.itemId,
      quantity: l.quantity,
      notes: l.notes || null,
    }))
  );

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/senior-chef");
  revalidatePath("/senior-chef/orders");
  revalidatePath("/senior-chef/preps");
  revalidatePath("/senior-chef/kitchen-status");
  redirect(`/senior-chef/orders/${order.id}`);
}

export async function markOrderStatus(
  orderId: string,
  status: "ordered" | "completed"
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/senior-chef");
  revalidatePath("/senior-chef/orders");
  revalidatePath("/senior-chef/preps");
  revalidatePath("/senior-chef/kitchen-status");
  revalidatePath(`/senior-chef/orders/${orderId}`);
}
