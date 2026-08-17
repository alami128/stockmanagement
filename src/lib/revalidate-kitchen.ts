import { revalidatePath } from "next/cache";

/** Revalidate chef and head chef dashboard views after data changes. */
export function revalidateKitchenDashboards() {
  revalidatePath("/chef");
  revalidatePath("/chef/kitchen-status");
  revalidatePath("/chef/preps");
  revalidatePath("/chef/orders");
  revalidatePath("/chef/stock");
  revalidatePath("/senior-chef");
  revalidatePath("/senior-chef/kitchen-status");
  revalidatePath("/senior-chef/preps");
  revalidatePath("/senior-chef/orders");
}
