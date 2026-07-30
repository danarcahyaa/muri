"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coins,
  RefreshCw,
  Search,
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
import { getCustomerDashboardSummary } from "@/services/customer";
import {
  getCustomerPointLedger,
  type PointLedgerItem,
} from "@/services/customer/pointService";
import type { CustomerDashboardSummary } from "@/types/customerDashboard";

type PointFilterTab = "all" | "earned" | "spent";

const ITEMS_PER_PAGE = 5;

const STATUS_TABS: Array<{ value: PointFilterTab; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "earned", label: "Perolehan Poin" },
  { value: "spent", label: "Penukaran Poin" },
];

export default function CustomerPointsSection() {
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [ledger, setLedger] = useState<PointLedgerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PointFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, ledgerRes] = await Promise.all([
        getCustomerDashboardSummary(),
        getCustomerPointLedger(),
      ]);

      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      }
      if (ledgerRes.success && ledgerRes.data) {
        setLedger(ledgerRes.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const filteredLedger = useMemo(() => {
    let result = ledger;

    if (activeTab === "earned") {
      result = result.filter((item) => item.type === "earned");
    } else if (activeTab === "spent") {
      result = result.filter((item) => item.type === "spent");
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((item) =>
        item.activityName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeTab, ledger, searchQuery]);

  const totalPages = Math.ceil(filteredLedger.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLedger = useMemo(() => {
    return filteredLedger.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLedger, startIndex]);

  const totalCoins = summary?.totalPoints ?? 145;

  return (
    <section className="mt-8 font-body">
      {/* Hero Card: Saldo Coin Sirkular */}
      <article className="flex min-h-[160px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-gradient-to-br from-brand-forest to-[#315F35] p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-brand-lime">
              <Coins className="size-4" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              Saldo Coin Sirkular Anda
            </p>
          </div>

          <div className="mt-4 font-display text-4xl font-medium leading-none tracking-tight text-brand-lime sm:text-5xl">
            {totalCoins} <span className="text-xl font-normal text-white/70">coin</span>
          </div>

          <p className="mt-2 text-xs text-white/60 max-w-lg">
            Setara dengan potongan hingga Rp {(totalCoins * 100).toLocaleString("id-ID")}. Gunakan coin Anda untuk penukaran produk atau pendaftaran workshop.
          </p>
        </div>

        <div className="mt-5 sm:mt-0 flex flex-wrap items-center gap-2.5">
          <Button
            variant="solid-lime"
            size="md"
            render={
              <Link href="/katalog">
                Tukarkan di Katalog
                <ArrowRight className="size-4" />
              </Link>
            }
          />
          <Button
            variant="outline-white"
            size="md"
            render={
              <Link href="/edukasi">
                Ikuti Workshop
              </Link>
            }
          />
        </div>
      </article>

      {/* Main Table Section Container (Matching CustomerOrdersSection) */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-line-trace px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black">
              Riwayat Poin ({filteredLedger.length})
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Catatan perolehan dan penukaran coin sirkular Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-brand-black/15 bg-canvas-pure px-3.5 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest"
          >
            <RefreshCw className="size-3.5" />
            Muat Ulang
          </button>
        </div>

        {/* Toolbar: Search Bar & Filter Tabs */}
        <div className="flex flex-col gap-4 border-b border-line-trace bg-canvas-warm/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          {/* Search Input */}
          <div className="w-full max-w-sm">
            <Input
              type="text"
              placeholder="Cari transaksi poin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
              size="sm"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-sm px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-brand-forest text-white"
                      : "bg-canvas-pure border border-brand-black/15 text-brand-black hover:border-brand-forest"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table View */}
        {filteredLedger.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
            <Search className="size-8 text-muted-moss/40" />
            <p className="mt-3 text-sm font-bold text-brand-black">
              Tidak ada transaksi poin yang sesuai
            </p>
            <p className="mt-1 text-xs text-muted-moss">
              Coba sesuaikan kata kunci pencarian atau filter Anda.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto muri-scrollbar w-full min-w-0">
              <Table className="min-w-[650px]">
                <TableHeader className="bg-canvas-warm/60">
                  <TableRow className="border-line-trace">
                    <TableHead className="py-3.5 pl-6 text-xs font-bold uppercase tracking-wider text-muted-moss sm:pl-8">
                      TANGGAL & WAKTU
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                      AKTIVITAS / SUMBER
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-moss">
                      JENIS
                    </TableHead>
                    <TableHead className="py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-moss sm:pr-8">
                      PERUBAHAN COIN
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-line-trace">
                  {isLoading ? (
                    <TableSkeleton columnsCount={4} rowsCount={4} />
                  ) : (
                    paginatedLedger.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-line-trace transition-colors hover:bg-canvas-warm/40"
                      >
                        {/* Date */}
                        <TableCell className="py-4 pl-6 sm:pl-8">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-black">
                            <CalendarDays className="size-3.5 text-muted-moss" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </TableCell>

                        {/* Activity */}
                        <TableCell className="py-4">
                          <p className="text-xs font-bold text-brand-black">
                            {item.activityName}
                          </p>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wide ${
                              item.type === "earned"
                                ? "bg-brand-lime/50 text-brand-forest"
                                : "bg-canvas-warm text-muted-moss"
                            }`}
                          >
                            {item.type === "earned" ? "Dapat Poin" : "Pakai Poin"}
                          </span>
                        </TableCell>

                        {/* Change Amount */}
                        <TableCell className="py-4 pr-6 text-right sm:pr-8">
                          <span
                            className={`font-display text-sm font-bold ${
                              item.type === "earned"
                                ? "text-brand-forest"
                                : "text-brand-black"
                            }`}
                          >
                            {item.type === "earned" ? "+" : "-"}
                            {item.amountCoin} coin
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls (Matching CustomerOrdersSection) */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line-trace bg-canvas-warm/30 px-6 py-4 sm:px-8">
              <p className="text-xs text-muted-moss">
                Menampilkan{" "}
                <span className="font-bold text-brand-black">
                  {startIndex + 1}
                </span>
                –
                <span className="font-bold text-brand-black">
                  {Math.min(startIndex + ITEMS_PER_PAGE, filteredLedger.length)}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-brand-black">
                  {filteredLedger.length}
                </span>{" "}
                transaksi
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="inline-flex items-center gap-1 rounded-sm border border-brand-black/15 bg-canvas-pure px-3 py-1.5 text-xs font-bold text-brand-black transition hover:border-brand-forest disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
