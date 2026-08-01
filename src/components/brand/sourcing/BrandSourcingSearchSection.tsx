"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FilterX,
  X,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { SourcingSkeletonGrid } from "./sourcing-skeleton-grid";
import { SourcingEmptyState } from "./sourcing-empty-state";
import { MaterialCard } from "./material-card";

import { useDebounce } from "@/hooks/useDebounce";
import { useSavedMaterials } from "@/hooks/useSavedMaterials";
import { getWastePosts } from "@/services/sourcing.service";
import { formatThousand, parseThousand } from "@/lib/formatter";
import type { SourcingFilterInput, SourcingWastePostItem } from "@/types/sourcing";

const FABRIC_CATEGORY_OPTIONS = [
  "Katun",
  "Denim",
  "Poliester Daur Ulang",
  "Batik/Tenun",
  "Rayon",
  "Linen",
  "Campuran",
];

const LOCATION_OPTIONS = [
  "Denpasar",
  "Badung",
  "Gianyar",
  "Tabanan",
  "Buleleng",
  "Surabaya",
  "Bandung",
];

const ITEMS_PER_PAGE = 10;

export default function BrandSourcingSearchSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Parse initial query params from URL
  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category")
    ? searchParams.get("category")!.split(",").filter(Boolean)
    : [];
  const initialMinPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const initialMaxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const initialMinOrderKg = searchParams.get("minOrderKg")
    ? Number(searchParams.get("minOrderKg"))
    : undefined;
  const initialLocation = searchParams.get("location") || "";
  const initialPage = searchParams.get("page")
    ? Math.max(1, parseInt(searchParams.get("page")!, 10) || 1)
    : 1;

  // Local Search Input (instant responsiveness)
  const [searchInput, setSearchInput] = useState<string>(initialQ);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Active Filter state
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategory);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [minOrderKg, setMinOrderKg] = useState<number | undefined>(initialMinOrderKg);
  const [location, setLocation] = useState<string>(initialLocation);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Popover state for filters
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [popoverMinPrice, setPopoverMinPrice] = useState<string>(
    initialMinPrice ? formatThousand(initialMinPrice) : ""
  );
  const [popoverMaxPrice, setPopoverMaxPrice] = useState<string>(
    initialMaxPrice ? formatThousand(initialMaxPrice) : ""
  );
  const [popoverMinOrder, setPopoverMinOrder] = useState<string>(
    initialMinOrderKg ? String(initialMinOrderKg) : ""
  );
  const [popoverCats, setPopoverCats] = useState<string[]>(initialCategory);
  const [popoverLocation, setPopoverLocation] = useState<string>(initialLocation);

  // Material Data & Saved state
  const [materials, setMaterials] = useState<SourcingWastePostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { savedPostIds, toggleSave } = useSavedMaterials();

  // Count active filters (excluding query text and page)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCats.length > 0) count += selectedCats.length;
    if (minPrice !== undefined) count += 1;
    if (maxPrice !== undefined) count += 1;
    if (minOrderKg !== undefined) count += 1;
    if (location) count += 1;
    return count;
  }, [selectedCats, minPrice, maxPrice, minOrderKg, location]);

  // Sync state to URL Query Parameters
  const updateUrlQueryParams = useCallback(
    (params: {
      q?: string;
      category?: string[];
      minPrice?: number;
      maxPrice?: number;
      minOrderKg?: number;
      location?: string;
      page?: number;
    }) => {
      const urlParams = new URLSearchParams();

      if (params.q?.trim()) {
        urlParams.set("q", params.q.trim());
      }
      if (params.category && params.category.length > 0) {
        urlParams.set("category", params.category.join(","));
      }
      if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
        urlParams.set("minPrice", String(params.minPrice));
      }
      if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
        urlParams.set("maxPrice", String(params.maxPrice));
      }
      if (params.minOrderKg !== undefined && !isNaN(params.minOrderKg)) {
        urlParams.set("minOrderKg", String(params.minOrderKg));
      }
      if (params.location?.trim()) {
        urlParams.set("location", params.location.trim());
      }
      if (params.page && params.page > 1) {
        urlParams.set("page", String(params.page));
      }

      const queryString = urlParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [pathname, router]
  );

  // Fetch data from backend
  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const filters: SourcingFilterInput = {
      searchQuery: debouncedSearch,
      categoryNames: selectedCats,
      minPrice,
      maxPrice,
      minOrderKg,
      location,
    };

    try {
      const res = await getWastePosts(filters);
      if (res.success && res.data) {
        setMaterials(res.data);
      } else {
        setMaterials([]);
        setErrorMessage(res.error ?? "Gagal memuat data material limbah.");
      }
    } catch {
      setMaterials([]);
      setErrorMessage("Terjadi kesalahan koneksi saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCats, minPrice, maxPrice, minOrderKg, location]);

  // Trigger fetch and URL update on filter / debounced search change
  useEffect(() => {
    fetchMaterials();
    updateUrlQueryParams({
      q: debouncedSearch,
      category: selectedCats,
      minPrice,
      maxPrice,
      minOrderKg,
      location,
      page: currentPage,
    });
  }, [
    debouncedSearch,
    selectedCats,
    minPrice,
    maxPrice,
    minOrderKg,
    location,
    currentPage,
    fetchMaterials,
    updateUrlQueryParams,
  ]);

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCats, minPrice, maxPrice, minOrderKg, location]);

  // Pagination calculation
  const totalItems = materials.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedMaterials = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return materials.slice(start, start + ITEMS_PER_PAGE);
  }, [materials, validCurrentPage]);

  // Filter Popover handlers
  const handleApplyFilter = () => {
    const parsedMin = parseThousand(popoverMinPrice);
    const parsedMax = parseThousand(popoverMaxPrice);

    setMinPrice(popoverMinPrice ? parsedMin : undefined);
    setMaxPrice(popoverMaxPrice ? parsedMax : undefined);
    setMinOrderKg(popoverMinOrder ? Number(popoverMinOrder) : undefined);
    setSelectedCats(popoverCats);
    setLocation(popoverLocation);
    setPopoverOpen(false);
  };

  const handleResetFilter = () => {
    setPopoverMinPrice("");
    setPopoverMaxPrice("");
    setPopoverMinOrder("");
    setPopoverCats([]);
    setPopoverLocation("");

    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinOrderKg(undefined);
    setSelectedCats([]);
    setLocation("");
    setSearchInput("");
    setCurrentPage(1);
    setPopoverOpen(false);
  };

  const handleToggleCategory = (cat: string) => {
    setPopoverCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header Title Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-brand-black/15 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-black sm:text-3xl">
            Cari Material Limbah
          </h1>
          <p className="mt-1 text-xs text-muted-moss sm:text-sm">
            Temukan dan sumberi bahan sisa kain terverifikasi langsung dari penyedia limbah terpercaya.
          </p>
        </div>

        {totalItems > 0 && !isLoading && (
          <div className="shrink-0 text-xs font-medium text-muted-moss bg-canvas-warm px-3 py-1.5 rounded-full border border-brand-black/10">
            Menampilkan <span className="font-bold text-brand-black">{totalItems}</span> material
          </div>
        )}
      </div>

      {/* SEARCH & FILTER BAR COMPONENT
          Requirements:
          1. Tombol/Panel Filter ada di sebalah KIRI Input Search
          2. Input Search ada di sebelah KANAN Tombol Filter
      */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full">
        {/* 1. FILTER BUTTON / POPOVER (SEBELAH KIRI INPUT SEARCH) */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="h-12 bg-canvas-pure hover:bg-canvas-warm border-brand-black/15 text-brand-black flex items-center justify-center gap-2 shrink-0 px-4 text-xs font-semibold rounded-sm shadow-none"
            >
              <SlidersHorizontal className="size-4 text-muted-moss" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="size-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-brand-lime text-brand-black font-bold border-none"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className="w-80 sm:w-96 bg-canvas-pure border-brand-black/15 p-5 space-y-5 shadow-none font-body rounded-md"
          >
            <div className="flex items-center justify-between border-b border-brand-black/10 pb-3">
              <h4 className="font-display text-sm font-bold text-brand-black flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-brand-forest" />
                Filter Material Limbah
              </h4>
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-[11px] text-muted-moss hover:text-error-rust flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="size-3" />
                Reset All
              </button>
            </div>

            {/* A. Kategori Jenis Kain */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-black/80">
                Kategori Jenis Kain
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FABRIC_CATEGORY_OPTIONS.map((cat) => {
                  const isChecked = popoverCats.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className={`text-xs px-2.5 py-1 rounded-sm border transition-all ${
                        isChecked
                          ? "bg-brand-lime/80 text-brand-black border-brand-black/20 font-bold"
                          : "bg-canvas-pure text-muted-moss border-brand-black/15 hover:bg-canvas-warm"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. Rentang Harga (Rp / Kg) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-black/80">
                Rentang Harga (Rp / Kg)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-moss">Harga Min</span>
                  <Input
                    type="text"
                    placeholder="0"
                    value={popoverMinPrice}
                    onChange={(e) => setPopoverMinPrice(formatThousand(e.target.value))}
                    className="h-9 text-xs bg-canvas-pure border-brand-black/15 rounded-sm"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-moss">Harga Maks</span>
                  <Input
                    type="text"
                    placeholder="100.000"
                    value={popoverMaxPrice}
                    onChange={(e) => setPopoverMaxPrice(formatThousand(e.target.value))}
                    className="h-9 text-xs bg-canvas-pure border-brand-black/15 rounded-sm"
                  />
                </div>
              </div>
            </div>

            {/* C. Minimum Order (Kg) & Wilayah Penyuplai */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-black/80">
                  Min. Order (Kg)
                </label>
                <Input
                  type="number"
                  placeholder="Misal: 5"
                  value={popoverMinOrder}
                  onChange={(e) => setPopoverMinOrder(e.target.value)}
                  className="h-9 text-xs bg-canvas-pure border-brand-black/15 rounded-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-black/80">
                  Wilayah
                </label>
                <select
                  value={popoverLocation}
                  onChange={(e) => setPopoverLocation(e.target.value)}
                  className="h-9 w-full rounded-sm border border-brand-black/15 bg-canvas-pure px-2 text-xs text-brand-black focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                >
                  <option value="">Semua Wilayah</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-brand-black/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPopoverOpen(false)}
                className="h-9 text-xs border-brand-black/15 rounded-sm shadow-none"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilter}
                className="h-9 text-xs bg-brand-lime text-brand-black hover:bg-brand-lime/90 font-bold rounded-sm shadow-none"
              >
                Terapkan Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. INPUT SEARCH FIELD (SEBELAH KANAN TOMBOL FILTER) */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-moss pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari nama limbah, jenis kain, deskripsi material, penyuplai..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-12 pl-10 pr-10 bg-canvas-pure border-brand-black/15 text-xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-moss hover:text-brand-black transition-colors"
              title="Bersihkan kata kunci"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE FILTER BADGES BAR */}
      {(activeFilterCount > 0 || debouncedSearch) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-moss text-[11px] font-semibold">Filter Aktif:</span>

          {debouncedSearch && (
            <Badge variant="secondary" className="bg-canvas-warm border border-brand-black/15 text-brand-black flex items-center gap-1.5 font-normal px-2.5 py-1">
              <span>Kata kunci: <strong>"{debouncedSearch}"</strong></span>
              <X className="size-3 cursor-pointer hover:text-error-rust" onClick={() => setSearchInput("")} />
            </Badge>
          )}

          {selectedCats.map((cat) => (
            <Badge key={cat} variant="secondary" className="bg-brand-lime/50 border border-brand-black/15 text-brand-black flex items-center gap-1.5 font-normal px-2.5 py-1">
              <span>Kategori: <strong>{cat}</strong></span>
              <X
                className="size-3 cursor-pointer hover:text-error-rust"
                onClick={() => setSelectedCats((prev) => prev.filter((c) => c !== cat))}
              />
            </Badge>
          ))}

          {minPrice !== undefined && (
            <Badge variant="secondary" className="bg-canvas-warm border border-brand-black/15 text-brand-black flex items-center gap-1.5 font-normal px-2.5 py-1">
              <span>Min Rp {formatThousand(minPrice)}</span>
              <X className="size-3 cursor-pointer hover:text-error-rust" onClick={() => setMinPrice(undefined)} />
            </Badge>
          )}

          {maxPrice !== undefined && (
            <Badge variant="secondary" className="bg-canvas-warm border border-brand-black/15 text-brand-black flex items-center gap-1.5 font-normal px-2.5 py-1">
              <span>Maks Rp {formatThousand(maxPrice)}</span>
              <X className="size-3 cursor-pointer hover:text-error-rust" onClick={() => setMaxPrice(undefined)} />
            </Badge>
          )}

          {minOrderKg !== undefined && (
            <Badge variant="secondary" className="bg-canvas-warm border border-brand-black/15 text-brand-black flex items-center gap-1.5 font-normal px-2.5 py-1">
              <span>Min Order: {minOrderKg} Kg</span>
              <X className="size-3 cursor-pointer hover:text-error-rust" onClick={() => setMinOrderKg(undefined)} />
            </Badge>
          )}

          {location && (
            <Badge variant="secondary" className="bg-canvas-warm border border-brand-black/15 text-brand-black flex items-center gap-1.5 font-normal px-2.5 py-1">
              <MapPin className="size-3 text-muted-moss" />
              <span>Lokasi: <strong>{location}</strong></span>
              <X className="size-3 cursor-pointer hover:text-error-rust" onClick={() => setLocation("")} />
            </Badge>
          )}

          <button
            type="button"
            onClick={handleResetFilter}
            className="text-[11px] text-error-rust hover:underline ml-1 font-semibold flex items-center gap-1"
          >
            <FilterX className="size-3" />
            Hapus Semua Filter
          </button>
        </div>
      )}

      {/* ERROR MESSAGE ALERT */}
      {errorMessage && (
        <div className="rounded-md border border-error-rust/20 bg-error-rust/5 p-4 text-xs text-error-rust flex items-center justify-between">
          <span>{errorMessage}</span>
          <Button variant="outline" size="sm" onClick={fetchMaterials} className="h-7 text-[11px] rounded-sm">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* CONTENT GRID / LOADING / EMPTY STATE */}
      {isLoading ? (
        <SourcingSkeletonGrid count={8} />
      ) : materials.length === 0 ? (
        <SourcingEmptyState
          hasActiveFilters={activeFilterCount > 0 || Boolean(debouncedSearch)}
          onResetFilters={handleResetFilter}
        />
      ) : (
        <div className="space-y-8">
          {/* Material Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedMaterials.map((item) => (
              <MaterialCard
                key={item.id}
                item={item}
                isSaved={savedPostIds.has(item.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>

          {/* PAGINATION CONTROL BAR */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-black/15 pt-6">
              <p className="text-xs text-muted-moss">
                Halaman <span className="font-bold text-brand-black">{validCurrentPage}</span> dari{" "}
                <span className="font-bold text-brand-black">{totalPages}</span> (Total {totalItems} material)
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 px-3 text-xs border-brand-black/15 bg-canvas-pure hover:bg-canvas-warm disabled:opacity-40 rounded-sm shadow-none"
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Sebelumnya
                </Button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`size-9 rounded-sm text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-brand-lime text-brand-black font-bold shadow-none"
                            : "bg-canvas-pure text-muted-moss hover:bg-canvas-warm hover:text-brand-black border border-brand-black/10"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="h-9 px-3 text-xs border-brand-black/15 bg-canvas-pure hover:bg-canvas-warm disabled:opacity-40 rounded-sm shadow-none"
                >
                  Selanjutnya
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
