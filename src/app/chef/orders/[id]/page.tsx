import OrderDetailPageContent from "@/components/OrderDetailPageContent";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <OrderDetailPageContent orderId={params.id} basePath="/chef" />
  );
}
