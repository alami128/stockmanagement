import { revalidatePath } from "next/cache";

/** Revalidate chef and head chef dashboard views after data changes. */
export function revalidateKitchenDashboards(options?: {
  skip?: string[];
}) {
  const skip = new Set(options?.skip ?? []);
  const paths = [
    "/chef",
    "/chef/kitchen-status",
    "/chef/preps",
    "/chef/orders",
    "/chef/stock",
    "/senior-chef",
    "/senior-chef/kitchen-status",
    "/senior-chef/preps",
    "/senior-chef/orders",
  ];

  for (const path of paths) {
    if (!skip.has(path)) revalidatePath(path);
  }
}
