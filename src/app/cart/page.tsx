"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";

import { CartItemCard } from "@/components/cart/CartItemCard";
import { CartSummaryCard } from "@/components/cart/CartSummaryCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/hooks/customer/useCart";

export default function CartPage() {
  const { items, itemCount, isLoading } = useCart();

  return (
    <div className="flex min-h-screen flex-col bg-canvas-pure">
      <Header />

      <main className="flex-1 pb-16 pt-28">
        <div className="mx-auto w-[min(1320px,calc(100%_-_48px))]">
          {/* Top Breadcrumb / Back Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-moss transition hover:text-brand-emerald"
            >
              <ArrowLeft className="size-4" />
              <span>Kembali ke Katalog Produk</span>
            </Link>

            <span className="text-xs font-semibold text-muted-moss">
              {itemCount} barang di keranjang
            </span>
          </div>

          {/* Page Title */}
          <div className="mb-8 border-b border-line-trace pb-4">
            <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
              <ShoppingBag className="size-8 text-brand-emerald" />
              <span>Keranjang Belanja</span>
            </h1>
            <p className="mt-2 text-sm text-muted-moss">
              Kelola item produk sirkular pilihan Anda sebelum melanjutkan ke transaksi.
            </p>
          </div>

          {/* Cart Content Grid */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-brand-emerald border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-brand-black/15 bg-canvas-pure p-12 text-center">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-canvas-warm text-muted-moss">
                <ShoppingCart className="size-10 stroke-[1.5]" />
              </div>

              <h2 className="mt-6 font-display text-2xl font-bold text-brand-black">
                Keranjang Belanja Anda Kosong
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-moss">
                Belum ada produk yang ditambahkan. Temukan berbagai pakaian dan produk daur ulang berkualitas dari mitra brand MURI.
              </p>

              <Link
                href="/produk"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-brand-forest px-8 py-4 text-xs font-bold text-canvas-pure transition duration-300 hover:bg-brand-black"
              >
                <span>Mulai Belanja</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Items List */}
              <div className="space-y-4 lg:col-span-8">
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4">
                <div className="sticky top-28">
                  <CartSummaryCard />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
