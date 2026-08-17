import KitchenDashboardHub from "@/components/KitchenDashboardHub";

export default function ChefPage() {
  return (
    <KitchenDashboardHub
      basePath="/chef"
      eyebrow="Chef"
      stockHref="/chef/stock"
    />
  );
}
