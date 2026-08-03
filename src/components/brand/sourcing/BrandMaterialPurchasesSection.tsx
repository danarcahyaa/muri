"use client";

import { useCallback, useEffect, useState, useTransition, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  getBrandWastePurchases,
  type BrandWastePurchaseItem,
} from "@/services/sourcing.service";
import { BrandMaterialPurchasesHeader } from "./BrandMaterialPurchasesHeader";
import {
  BrandMaterialPurchasesToolbar,
  type PurchaseFilterTab,
} from "./BrandMaterialPurchasesToolbar";
import { BrandMaterialPurchasesTable } from "./BrandMaterialPurchasesTable";
import { BrandMaterialPurchasesPagination } from "./BrandMaterialPurchasesPagination";
import BrandWasteOrderDetailModal from "./BrandWasteOrderDetailModal";
import { supabase } from "@/lib/supabaseClient";

const ITEMS_PER_PAGE = 10;

export default function BrandMaterialPurchasesSection(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL query parameters synchronization
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = (searchParams.get("status") as PurchaseFilterTab) || "all";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState<string>(urlSearch);
  const [activeTab, setActiveTab] = useState<PurchaseFilterTab>(urlStatus);
  const [currentPage, setCurrentPage] = useState<number>(
    isNaN(urlPage) || urlPage < 1 ? 1 : urlPage
  );

  const [purchases, setPurchases] = useState<BrandWastePurchaseItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<BrandWastePurchaseItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Helper to sync state to URL params (without sort option)
  const updateQueryParams = useCallback(
    (newParams: { search?: string; status?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newParams.search !== undefined) {
        if (newParams.search.trim()) {
          params.set("search", newParams.search.trim());
        } else {
          params.delete("search");
        }
      }

      if (newParams.status !== undefined) {
        if (newParams.status !== "all") {
          params.set("status", newParams.status);
        } else {
          params.delete("status");
        }
      }

      if (newParams.page !== undefined) {
        if (newParams.page > 1) {
          params.set("page", String(newParams.page));
        } else {
          params.delete("page");
        }
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== urlSearch) {
        updateQueryParams({ search: searchInput, page: 1 });
        setCurrentPage(1);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, urlSearch, updateQueryParams]);

  // Load orders from service (auto-filters cancelled orders)
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBrandWastePurchases({
        searchQuery: urlSearch,
        statusFilter: urlStatus,
      });

      if (res.success && res.data) {
        setPurchases(res.data);
      } else {
        setPurchases([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [urlSearch, urlStatus]);

  // Supabase Realtime Subscription for real-time status updates on Brand side
  useEffect(() => {
    const channel = supabase
      .channel("waste_purchases_realtime_brand")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waste_purchases",
        },
        () => {
          void loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  // Sync selectedOrder if it's currently open in modal when purchases array updates
  useEffect(() => {
    if (selectedOrder) {
      const updated = purchases.find((p) => p.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [purchases]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Event handlers
  const handleTabChange = (status: PurchaseFilterTab) => {
    setActiveTab(status);
    setCurrentPage(1);
    updateQueryParams({ status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page });
  };

  // Pagination calculations
  const totalItems = purchases.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPurchases = purchases.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <section className="mt-8 font-body">
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        {/* Header */}
        <BrandMaterialPurchasesHeader
          totalCount={totalItems}
          onRefresh={() => void loadOrders()}
        />

        {/* Toolbar (Search & Filter Tabs, no sorting) */}
        <BrandMaterialPurchasesToolbar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Data Table */}
        <BrandMaterialPurchasesTable
          purchases={paginatedPurchases}
          isLoading={isLoading}
          searchQuery={urlSearch}
          onSelectOrder={setSelectedOrder}
        />

        {/* Pagination Controls */}
        <BrandMaterialPurchasesPagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Order Detail Modal */}
      <BrandWasteOrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOrderCancelled={() => void loadOrders()}
      />
    </section>
  );
}
