import type { Metadata } from "next";

import CustomerProductCheckout from "@/components/product/CustomerProductCheckout";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { decodeProductSlug } from "@/lib/product-detail";

interface ProductCheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    quantity?: string | string[];
  }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Produk | Muri",
  description:
    "Selesaikan pembelian produk sirkular Anda.",
};

export default async function ProductCheckoutPage({
  params,
  searchParams,
}: ProductCheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const sku = decodeProductSlug(slug);

  const quantityValue = Array.isArray(
    query.quantity,
  )
    ? query.quantity[0]
    : query.quantity;

  const parsedQuantity = Number(
    quantityValue ?? "1",
  );

  const requestedQuantity =
    Number.isInteger(parsedQuantity) &&
    parsedQuantity >= 1
      ? parsedQuantity
      : 0;

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas-warm/45 text-brand-black">
      <Header />

      <main className="pt-16">
        <section className="py-[clamp(48px,7vw,96px)]">
          <div className="mx-auto w-[min(1320px,calc(100%_-_48px))]">
            <CustomerProductCheckout
              sku={sku}
              requestedQuantity={
                requestedQuantity
              }
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}