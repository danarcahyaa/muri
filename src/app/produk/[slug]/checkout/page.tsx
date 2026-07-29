import type { Metadata } from "next";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CustomerProductCheckout from "@/components/product/CustomerProductCheckout";
import { decodeProductSlug } from "@/lib/productDetail";

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
  description: "Selesaikan pembelian produk sirkular Anda.",
};

export default async function ProductCheckoutPage({
  params,
  searchParams,
}: ProductCheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const sku = decodeProductSlug(slug);
  const requestedQuantity = parseRequestedQuantity(query.quantity);

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas-warm/45 text-brand-black">
      <Header />

      <main className="pt-16">
        <section className="py-[clamp(48px,7vw,96px)]">
          <div className="mx-auto w-[min(1320px,calc(100%_-_48px))]">
            <CustomerProductCheckout
              sku={sku}
              requestedQuantity={requestedQuantity}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function parseRequestedQuantity(
  value: string | string[] | undefined,
): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue ?? "1");

  return Number.isSafeInteger(parsedValue) && parsedValue >= 1
    ? parsedValue
    : 0;
}
