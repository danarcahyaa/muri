import CustomerQrisPayment from "@/components/dashboard/CustomerQrisPayment";

interface CustomerQrisPaymentPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function CustomerQrisPaymentPage({
  params,
}: CustomerQrisPaymentPageProps) {
  const { orderId } = await params;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <CustomerQrisPayment
        orderId={orderId}
      />
    </main>
  );
}