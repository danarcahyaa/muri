"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionButton } from "@/components/ui/TableActionButton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import {
  getMyBrandProducts,
  toggleBrandProductStatus,
  type BrandProductItem,
} from "@/services/brand";

import { BrandProductModal } from "./products/BrandProductModal";

type ProductFilterTab = "all" | "published" | "draft";

const ITEMS_PER_PAGE = 5;

export default function BrandProductsSection() {
  const [products, setProducts] = useState<BrandProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<ProductFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState<BrandProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await getMyBrandProducts();
      if (!res.success || !res.data) {
        setProducts([]);
        setErrorMessage(res.error ?? "Gagal memuat produk brand.");
        return;
      }
      setProducts(res.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeTab !== "all") {
      result = result.filter((p) => p.status === activeTab);
    }

    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, activeTab, debouncedSearch]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, startIndex]);

  function handleOpenAddModal() {
    setSelectedProduct(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(prod: BrandProductItem) {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  }

  async function handleToggleStatus(prod: BrandProductItem) {
    const nextStatus = prod.status === "published" ? "draft" : "published";
    try {
      const res = await toggleBrandProductStatus(prod.id, nextStatus);
      if (res.success) {
        setSuccessMessage(`Status produk "${prod.name}" berhasil diubah menjadi ${nextStatus}.`);
        await loadProducts();
      }
    } catch {
      setErrorMessage("Gagal mengubah status produk.");
    }
  }

  return (
    <>
      <section className="mt-8">
        {/* Single Unified White Card Container (Matching Screenshot 2 Layout) */}
        <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
          {/* Card Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-brand-black">
                Katalog Produk Brand ({products.length})
              </h1>
              <p className="mt-1 text-xs text-muted-moss">
                Kelola daftar produk sirkular, stok, dan harga produk toko Anda.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadProducts()}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-black/15 bg-canvas-pure px-4 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm"
              >
                <RefreshCw className="size-3.5" />
                Muat Ulang
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-black"
              >
                <Plus className="size-4" />
                Tambah Produk Baru
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="mt-4 rounded-xl border border-brand-lime bg-brand-lime/15 px-4 py-3 text-xs font-medium text-brand-forest">
              {successMessage}
            </div>
          )}

          {/* Card Toolbar: Search Input on Left, Filter Tabs on Right */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-80">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk, SKU, kategori..."
                endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterTabButton
                label="Semua"
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              />
              <FilterTabButton
                label="Published"
                active={activeTab === "published"}
                onClick={() => setActiveTab("published")}
              />
              <FilterTabButton
                label="Draft"
                active={activeTab === "draft"}
                onClick={() => setActiveTab("draft")}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="mt-6 overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
            {errorMessage ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                <RefreshCw className="size-7 text-muted-moss/40" />
                <p className="mt-3 text-xs font-medium text-brand-black">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => void loadProducts()}
                  className="mt-4 rounded-sm bg-brand-forest px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-black"
                >
                  Coba Lagi
                </button>
              </div>
            ) : !isLoading && paginatedProducts.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                <Package className="size-7 text-muted-moss/40" />
                <p className="mt-3 text-xs font-bold text-brand-black">Belum Ada Produk</p>
                <p className="mt-1 text-[11px] text-muted-moss">
                  {searchQuery
                    ? "Tidak ada produk yang sesuai dengan pencarian Anda."
                    : "Klik tombol Tambah Produk Baru untuk mendaftarkan produk baru."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto muri-scrollbar w-full min-w-0">
                <Table className="min-w-[650px]">
                  <TableHeader className="bg-canvas-warm/60">
                    <TableRow className="border-line-trace">
                      <TableHead className="pl-6 sm:pl-8">PRODUK & SKU</TableHead>
                      <TableHead>KATEGORI</TableHead>
                      <TableHead>HARGA (IDR / COIN)</TableHead>
                      <TableHead>STOK</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="pr-6 text-right sm:pr-8">AKSI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-line-trace">
                    {isLoading ? (
                      <TableSkeleton columnsCount={6} rowsCount={5} />
                    ) : (
                      paginatedProducts.map((prod) => (
                        <TableRow
                          key={prod.id}
                          className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                        >
                          <TableCell className="py-4 pl-6 sm:pl-8">
                            <p className="text-xs font-bold text-brand-black">{prod.name}</p>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-moss">
                              SKU: {prod.sku}
                            </p>
                          </TableCell>

                          <TableCell className="py-4 text-xs text-brand-black">
                            {prod.categoryName}
                          </TableCell>

                          <TableCell className="py-4">
                            <p className="text-xs font-bold text-brand-black">
                              {formatIdr(prod.priceIdr)}
                            </p>
                          </TableCell>

                          <TableCell className="py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                prod.stock <= 5
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-canvas-warm text-brand-black"
                              }`}
                            >
                              {prod.stock} unit
                            </span>
                          </TableCell>

                          <TableCell className="py-4">
                            <StatusBadge variant={prod.status === "published" ? "success" : "neutral"}>
                              {prod.status === "published" ? "Published" : "Draft"}
                            </StatusBadge>
                          </TableCell>

                          <TableCell className="py-4 pr-6 text-right sm:pr-8">
                            <div className="flex items-center justify-end gap-2">
                              <TableActionButton
                                onClick={() => handleOpenEditModal(prod)}
                                title="Edit Produk"
                                aria-label="Edit Produk"
                              >
                                <Edit2 className="size-4 text-brand-emerald" />
                              </TableActionButton>

                              <TableActionButton
                                onClick={() => void handleToggleStatus(prod)}
                                title={
                                  prod.status === "published"
                                    ? "Jadikan Draft"
                                    : "Publikasikan"
                                }
                                aria-label={
                                  prod.status === "published"
                                    ? "Jadikan Draft"
                                    : "Publikasikan"
                                }
                              >
                                {prod.status === "published" ? (
                                  <ToggleRight className="size-4 text-brand-forest" />
                                ) : (
                                  <ToggleLeft className="size-4 text-muted-moss" />
                                )}
                              </TableActionButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          {!isLoading && !errorMessage && filteredProducts.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-moss">
                Menampilkan <span className="font-bold text-brand-black">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</span> dari{" "}
                <span className="font-bold text-brand-black">{filteredProducts.length}</span> produk
              </p>

              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-1 rounded-sm border border-brand-black/20 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:opacity-40"
                >
                  <ChevronLeft className="size-3.5" />
                  Sebelumnya
                </button>

                <span className="px-2 text-xs font-bold text-brand-black">
                  {currentPage}/{totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="inline-flex items-center gap-1 rounded-sm border border-brand-black/20 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      <BrandProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => void loadProducts()}
      />
    </>
  );
}

function FilterTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-sm px-3.5 py-1.5 text-xs font-bold transition
        ${
          active
            ? "bg-brand-forest text-white"
            : "border border-brand-black/15 bg-canvas-pure text-brand-black hover:border-brand-forest hover:bg-canvas-warm"
        }
      `}
    >
      {label}
    </button>
  );
}
