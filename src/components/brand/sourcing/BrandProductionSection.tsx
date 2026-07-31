"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Factory,
  Package,
  RefreshCw,
  Scale,
  Scissors,
  Search,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatIdr } from "@/lib/productDetail";
import { formatWeightKg } from "@/lib/formatter";
import { getBrandMaterialOrders } from "@/services/material";
import type { MaterialOrder } from "@/types/materialOrder";

type ProductionStage = "raw" | "cutting" | "sewing" | "ready";
type FilterTab = "all" | "raw" | "cutting" | "sewing" | "ready";

interface ProductionBatchItem extends MaterialOrder {
  stage: ProductionStage;
}

const ITEMS_PER_PAGE = 5;

export default function BrandProductionSection() {
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stageMap, setStageMap] = useState<Record<string, ProductionStage>>({});
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBrandMaterialOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const productionItems: ProductionBatchItem[] = useMemo(() => {
    return orders.map((ord, idx) => ({
      ...ord,
      stage: stageMap[ord.id] ?? (idx % 2 === 0 ? "cutting" : "raw"),
    }));
  }, [orders, stageMap]);

  const filteredItems = useMemo(() => {
    let result = productionItems;

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((item) => item.stage === activeTab);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.batchTitle.toLowerCase().includes(q) ||
          item.orderCode.toLowerCase().includes(q) ||
          item.providerName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [productionItems, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, startIndex]);

  const totalWeightKg = useMemo(() => {
    return orders.reduce((sum, item) => sum + item.weightKg, 0);
  }, [orders]);

  function handleAdvanceStage(orderId: string, currentStage: ProductionStage) {
    const nextStage: ProductionStage =
      currentStage === "raw"
        ? "cutting"
        : currentStage === "cutting"
          ? "sewing"
          : "ready";

    setStageMap((prev) => ({
      ...prev,
      [orderId]: nextStage,
    }));
  }

  return (
    <section className="mt-8 font-body">
      {/* Top Metrics Cards - Harmonized with Overview Ringkasan */}
      <section className="overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
        <div className="grid divide-y divide-line-trace sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Metric 1 */}
          <article className="flex flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-moss">
                Total Limbah Diproduksi
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-lime text-brand-forest">
                <Scale className="size-4" strokeWidth={1.8} />
              </div>
            </div>
            <div className="mt-6">
              <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
                {formatWeightKg(totalWeightKg)}
              </p>
              <p className="mt-2 text-xs text-muted-moss">
                Bahan sisa dari Waste Provider terverifikasi
              </p>
            </div>
          </article>

          {/* Metric 2 */}
          <article className="flex flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-moss">
                Batch Aktif di Workshop
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-lime text-brand-forest">
                <Scissors className="size-4" strokeWidth={1.8} />
              </div>
            </div>
            <div className="mt-6">
              <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
                {orders.length} Batch
              </p>
              <p className="mt-2 text-xs text-muted-moss">
                Sedang dalam tahapan cutting &amp; sewing
              </p>
            </div>
          </article>

          {/* Metric 3 */}
          <article className="flex flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-moss">
                Produk Siap Rilis
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-lime text-brand-forest">
                <Shirt className="size-4" strokeWidth={1.8} />
              </div>
            </div>
            <div className="mt-6">
              <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
                {Object.values(stageMap).filter((s) => s === "ready").length} Batch
              </p>
              <p className="mt-2 text-xs text-muted-moss">
                Siap dipublikasikan ke Katalog Produk MURI
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Main Card Wrapper */}
      <div className="mt-8 rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black">
              Manajemen Produksi Limbah Terbeli ({orders.length})
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Pantau alokasi dan progres tahapan produksi limbah kain yang dibeli dari Waste Provider.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-black/15 bg-canvas-pure px-4 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm"
          >
            <RefreshCw className="size-3.5" />
            Muat Ulang
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode batch, material, provider..."
              endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterTabButton
              label="Semua"
              active={activeTab === "all"}
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
            />
            <FilterTabButton
              label="Bahan Baku"
              active={activeTab === "raw"}
              onClick={() => {
                setActiveTab("raw");
                setCurrentPage(1);
              }}
            />
            <FilterTabButton
              label="Cutting"
              active={activeTab === "cutting"}
              onClick={() => {
                setActiveTab("cutting");
                setCurrentPage(1);
              }}
            />
            <FilterTabButton
              label="Penjahitan"
              active={activeTab === "sewing"}
              onClick={() => {
                setActiveTab("sewing");
                setCurrentPage(1);
              }}
            />
            <FilterTabButton
              label="Ready Stock"
              active={activeTab === "ready"}
              onClick={() => {
                setActiveTab("ready");
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="mt-6 overflow-hidden rounded-xl border border-brand-black/15 bg-canvas-pure">
          {!isLoading && paginatedItems.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
              <Factory className="size-8 text-muted-moss/40" />
              <p className="mt-3 text-xs font-bold text-brand-black">
                Belum Ada Antrean Produksi
              </p>
              <p className="mt-1 text-[11px] text-muted-moss">
                Material limbah yang Anda beli dari Waste Provider akan muncul di sini untuk dikelola.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto muri-scrollbar w-full min-w-0">
              <Table className="min-w-[750px]">
                <TableHeader className="bg-canvas-warm/60">
                  <TableRow className="border-line-trace">
                    <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-muted-moss sm:pl-8">
                      BATCH MATERIAL & TANGGAL
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                      MATERIAL & PROVIDER
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                      VOLUME & TOTAL COST
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                      TAHAPAN PRODUKSI
                    </TableHead>
                    <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
                      AKSI & UPDATE
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-line-trace">
                  {isLoading ? (
                    <TableSkeleton columnsCount={5} rowsCount={4} />
                  ) : (
                    paginatedItems.map((item) => {
                      const stageMeta = getStageMeta(item.stage);
                      return (
                        <TableRow
                          key={item.id}
                          className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                        >
                          {/* Batch Code & Date */}
                          <TableCell className="py-4 pl-6 sm:pl-8">
                            <div className="flex items-center gap-2.5">
                              <Package className="size-4 shrink-0 text-brand-emerald" />
                              <div>
                                <p className="font-mono text-xs font-bold text-brand-black">
                                  {item.orderCode}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                                  <CalendarDays className="size-3 shrink-0" />
                                  {formatDate(item.createdAt)}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Material & Provider */}
                          <TableCell className="py-4">
                            <div>
                              <p className="text-xs font-bold text-brand-black">
                                {item.batchTitle}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                                <Factory className="size-3 shrink-0" />
                                {item.providerName}
                              </p>
                            </div>
                          </TableCell>

                          {/* Volume & Cost */}
                          <TableCell className="py-4">
                            <div>
                              <p className="text-xs font-bold text-brand-black">
                                {formatWeightKg(item.weightKg)}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-moss">
                                {formatIdr(item.totalPriceIdr)}
                              </p>
                            </div>
                          </TableCell>

                          {/* Production Stage */}
                          <TableCell className="py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wide ${stageMeta.className}`}
                            >
                              {stageMeta.label}
                            </span>
                          </TableCell>

                          {/* Action */}
                          <TableCell className="py-4 pr-6 text-right sm:pr-8">
                            {item.stage === "ready" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest">
                                <CheckCircle2 className="size-3.5 text-brand-forest" />
                                Siap Rilis
                              </span>
                            ) : (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleAdvanceStage(item.id, item.stage)}
                              >
                                Lanjut Tahap
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-moss">
              Menampilkan{" "}
              <span className="font-bold text-brand-black">
                {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)}
              </span>{" "}
              dari <span className="font-bold text-brand-black">{filteredItems.length}</span> batch
            </p>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1.5 rounded-sm border border-brand-black/15 bg-canvas-pure px-3.5 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
                Sebelumnya
              </button>

              <span className="px-2 text-xs font-bold text-brand-black">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-1.5 rounded-sm border border-brand-black/15 bg-canvas-pure px-3.5 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest hover:bg-canvas-warm disabled:opacity-40"
              >
                Berikutnya
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
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
      className={`rounded-sm px-3.5 py-1.5 text-xs font-bold transition ${
        active
          ? "bg-brand-forest text-white"
          : "border border-brand-black/15 bg-canvas-pure text-brand-black hover:border-brand-forest hover:bg-canvas-warm"
      }`}
    >
      {label}
    </button>
  );
}

function getStageMeta(stage: ProductionStage) {
  switch (stage) {
    case "ready":
      return { label: "Selesai / Ready Stock", className: "bg-brand-lime/50 text-brand-forest" };
    case "sewing":
      return { label: "Tahap Penjahitan", className: "bg-blue-50 text-blue-700 border border-blue-200" };
    case "cutting":
      return { label: "Pemilahan & Cutting", className: "bg-amber-50 text-amber-800 border border-amber-200" };
    case "raw":
    default:
      return { label: "Bahan Baku di Gudang", className: "bg-canvas-warm text-muted-moss" };
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
