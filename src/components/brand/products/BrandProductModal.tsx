"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Package, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  saveBrandProduct,
  type BrandProductItem,
} from "@/services/brand";
import {
  getBrandProductions,
  type BrandProductionItem as ProductionBatchItem,
} from "@/services/brand-fashion/circularProductionService";

interface BrandProductModalProps {
  product: BrandProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES: { id: number; label: string }[] = [
  { id: 1, label: "Atasan & Outer" },
  { id: 2, label: "Bawahan" },
  { id: 3, label: "Aksesori & Tas" },
  { id: 4, label: "Home & Living" },
  { id: 5, label: "Anak" },
];

export function BrandProductModal({
  product,
  isOpen,
  onClose,
  onSaved,
}: BrandProductModalProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [priceIdr, setPriceIdr] = useState("");
  const [stock, setStock] = useState("10");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [description, setDescription] = useState("");
  const [productionId, setProductionId] = useState("");

  const [productionsList, setProductionsList] = useState<ProductionBatchItem[]>([]);
  const [isLoadingProductions, setIsLoadingProductions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      void fetchProductions();
      if (product) {
        setName(product.name);
        setSku(product.sku);
        setCategoryId(String(product.categoryId));
        setPriceIdr(String(product.priceIdr));
        setStock(String(product.stock));
        setStatus(product.status === "published" ? "published" : "draft");
        setDescription(product.description ?? "");
        setProductionId(product.productionId ?? "");
      } else {
        setName("");
        setSku("");
        setCategoryId("1");
        setPriceIdr("");
        setStock("10");
        setStatus("published");
        setDescription("");
        setProductionId("");
      }
    }
  }, [isOpen, product]);

  async function fetchProductions() {
    setIsLoadingProductions(true);
    try {
      const res = await getBrandProductions();
      if (res.success && res.data) {
        setProductionsList(res.data);
      } else {
        setProductionsList([]);
      }
    } catch {
      setProductionsList([]);
    } finally {
      setIsLoadingProductions(false);
    }
  }

  if (!isOpen) return null;

  const selectedCategory = CATEGORIES.find((c) => String(c.id) === categoryId);
  const selectedProduction = productionsList.find((p) => p.id === productionId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedSku = sku.trim();
    const parsedPriceIdr = Number(priceIdr);
    const parsedStock = Number(stock);

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Nama produk minimal 2 karakter.");
      return;
    }

    if (!trimmedSku || trimmedSku.length < 2) {
      setErrorMessage("SKU produk minimal 2 karakter.");
      return;
    }

    if (!productionId) {
      setErrorMessage("Wajib memilih batch produksi sirkular.");
      return;
    }

    if (Number.isNaN(parsedPriceIdr) || parsedPriceIdr < 0) {
      setErrorMessage("Harga IDR harus berupa angka positif.");
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setErrorMessage("Stok harus berupa angka non-negatif.");
      return;
    }

    if (selectedProduction && parsedStock > selectedProduction.targetQuantity) {
      setErrorMessage(
        `Stok produk (${parsedStock} pcs) tidak boleh melebihi pcs produksi (${selectedProduction.targetQuantity} pcs).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await saveBrandProduct({
        productId: product?.id,
        name: trimmedName,
        sku: trimmedSku,
        categoryId: Number(categoryId),
        priceIdr: parsedPriceIdr,
        stock: parsedStock,
        description: description.trim() || undefined,
        status,
        productionId,
      });

      if (!res.success) {
        setErrorMessage(res.error ?? "Gagal menyimpan produk.");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setErrorMessage("Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default font-body"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <Package className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-brand-black">
                {product ? "Edit Produk Brand" : "Tambah Produk Baru"}
              </h2>
              <p className="text-xs text-muted-moss">
                Isi rincian informasi dan stok produk sirkular Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto p-6 sm:p-8">
            {errorMessage && (
              <div className="rounded-sm border border-error-rust/30 bg-error-rust/10 px-4 py-3 text-xs font-medium text-error-rust">
                {errorMessage}
              </div>
            )}

            {/* Batch Produksi Sirkular (Wajib) */}
            <div className="space-y-2">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Hasil Produksi Limbah <span className="text-error-rust">*</span>
              </label>
              <Select
                value={productionId}
                onValueChange={(val) => {
                  if (val) setProductionId(val);
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedProduction
                      ? selectedProduction.productionName
                      : "Pilih Hasil Produksi"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProductions ? (
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                    </div>
                  ) : productionsList.length === 0 ? (
                    <div className="p-3 text-xs text-muted-moss">
                      Belum ada batch produksi. Silakan buat produksi terlebih dahulu.
                    </div>
                  ) : (
                    productionsList.map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.productionName} (Target: {prod.targetQuantity} Pcs)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Nama Produk */}
            <div className="space-y-2">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Nama Produk <span className="text-error-rust">*</span>
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Tote Bag Selvedge Denim"
              />
            </div>

            {/* SKU & Kategori */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block mb-2 text-xs font-bold text-brand-black">
                  SKU Produk <span className="text-error-rust">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Contoh: PWA-TOT-001"
                />
              </div>

              {/* Kategori (Displayed with Number ID) */}
              <div className="space-y-2">
                <label className="block mb-2 text-xs font-bold text-brand-black">
                  Kategori <span className="text-error-rust">*</span>
                </label>
                <Select
                  value={categoryId}
                  onValueChange={(val) => {
                    if (val) setCategoryId(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedCategory
                        ? selectedCategory.label
                        : "Pilih kategori"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        <span className="font-bold mr-1">{cat.id}.</span>{" "}
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Harga IDR */}
            <div className="space-y-2.5">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Harga IDR (Rp) <span className="text-error-rust">*</span>
              </label>
              <Input
                type="number"
                required
                min={0}
                value={priceIdr}
                onChange={(e) => setPriceIdr(e.target.value)}
                placeholder="Contoh: 269000"
              />
            </div>

            {/* Stok & Status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <label className="block mb-2 text-xs font-bold text-brand-black">
                  Stok Produk <span className="text-error-rust">*</span>
                </label>
                <Input
                  type="number"
                  required
                  min={0}
                  max={selectedProduction ? selectedProduction.targetQuantity : undefined}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Contoh: 15"
                />
                {selectedProduction && (
                  <p className="mt-1 text-[11px] text-muted-moss">
                    Maksimal stok:{" "}
                    <span className="font-semibold text-brand-black">
                      {selectedProduction.targetQuantity} Pcs
                    </span>{" "}
                    (berdasarkan pcs produksi)
                  </p>
                )}
              </div>

              {/* Status Katalog (Displaying Human Readable Label) */}
              <div className="space-y-2.5">
                <label className="block mb-2 text-xs font-bold text-brand-black">
                  Status Katalog <span className="text-error-rust">*</span>
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    if (val) setStatus(val as "published" | "draft");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {status === "published"
                        ? "Published (Tampil di Katalog)"
                        : "Draft (Disimpan)"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">
                      Published (Tampil di Katalog)
                    </SelectItem>
                    <SelectItem value="draft">Draft (Disimpan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2.5">
              <label className="block mb-2 text-xs font-bold text-brand-black">
                Deskripsi Produk{" "}
                <span className="font-normal text-muted-moss">(Opsional)</span>
              </label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tulis deskripsi singkat produk sirkular Anda..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              variant="default"
              size="md"
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Simpan Produk
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
