"use client";

import { useEffect, useState, useMemo, type ReactElement } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getWastePosts,
  getFabricCategories,
  createWastePost,
  updateWastePost,
  deleteWastePost,
  permanentDeleteWastePost,
} from "@/services/waste-providers/wasteService";
import { WastePostItem, FabricCategoryItem, WasteInput } from "@/types/wasteProvider";

// Import sub-components
import { WasteSummaryMetrics } from "@/components/waste-providers/waste-inventory/Metrics";
import { WasteTableToolbar } from "@/components/waste-providers/waste-inventory/Toolbar";
import { WasteDataTable } from "@/components/waste-providers/waste-inventory/Table";
import { WasteDialogForm } from "@/components/waste-providers/waste-inventory/DialogForm";

const ALL_CATEGORIES = ["Katun", "Denim", "Linen", "Rayon", "Polyester", "Sutra", "Sintetis", "Campuran"];
const ALL_STATUSES = ["active", "sold_out", "inactive"];

export default function WasteInventoryPage(): ReactElement {
  const { user } = useAuth();
  // allPosts: raw data from Supabase (no client-side filters applied)
  const [allPosts, setAllPosts] = useState<WastePostItem[]>([]);
  const [categories, setCategories] = useState<FabricCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>(ALL_CATEGORIES);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(ALL_STATUSES);
  const [sortBy, setSortBy] = useState("created_at_desc");

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<WastePostItem | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load static categories once on mount
  useEffect(() => {
    async function loadCategories() {
      const res = await getFabricCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    }
    loadCategories();
  }, []);

  // ─── Supabase fetch ───────────────────────────────────────────────────────
  // Only runs when: user changes, refreshTrigger fires (CRUD), or searchQuery changes.
  // Category/status/sort changes do NOT trigger a refetch — they are handled client-side.
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function fetchPosts(uid: string) {
      try {
        setIsLoading(true);
        setError(null);

        if (searchQuery.trim()) {
          // ── Search mode: push all filters to Supabase ──
          let categoryIds: number[] | undefined = undefined;
          if (selectedCategory.length > 0 && selectedCategory.length < ALL_CATEGORIES.length) {
            categoryIds = categories
              .filter((c) => selectedCategory.includes(c.name))
              .map((c) => c.id);
          }

          let sortField: "created_at" | "weight_kg" | "price_per_kg" = "created_at";
          let sortOrder: "asc" | "desc" = "desc";
          if (sortBy.endsWith("_desc")) {
            sortField = sortBy.slice(0, -5) as typeof sortField;
            sortOrder = "desc";
          } else if (sortBy.endsWith("_asc")) {
            sortField = sortBy.slice(0, -4) as typeof sortField;
            sortOrder = "asc";
          }

          const res = await getWastePosts(uid, {
            searchQuery: searchQuery.trim(),
            categoryIds,
            statuses: selectedStatus,
            sortBy: sortField,
            sortOrder,
          });

          if (res.success && res.data) {
            setAllPosts(res.data);
          } else {
            setError(res.error || "Gagal memuat data inventaris.");
          }
        } else {
          // ── Normal mode: fetch all, filter/sort client-side ──
          const res = await getWastePosts(uid);
          if (res.success && res.data) {
            setAllPosts(res.data);
          } else {
            setError(res.error || "Gagal memuat data inventaris.");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan sistem saat memuat inventaris.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts(userId);
    // searchQuery intentionally triggers a refetch; category/status/sort do NOT
  }, [user?.id, searchQuery, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual refresh trigger for CRUD handlers
  function loadInventoryData() {
    setRefreshTrigger((prev) => prev + 1);
  }

  // ─── Client-side filter & sort (no-search mode only) ─────────────────────
  const filteredPosts: WastePostItem[] = useMemo(() => {
    // In search mode, Supabase already returned filtered results
    if (searchQuery.trim()) return allPosts;

    let result = [...allPosts];

    // Category filter
    if (selectedCategory.length > 0 && selectedCategory.length < ALL_CATEGORIES.length) {
      result = result.filter((p) => selectedCategory.includes(p.category_name));
    }

    // Status filter
    if (selectedStatus.length > 0 && !selectedStatus.includes("all") && selectedStatus.length < ALL_STATUSES.length) {
      result = result.filter((p) => selectedStatus.includes(p.status));
    }

    // Sort
    const desc = sortBy.endsWith("_desc");
    if (sortBy.startsWith("created_at")) {
      result.sort((a, b) => {
        const ta = new Date(a.created_at ?? 0).getTime();
        const tb = new Date(b.created_at ?? 0).getTime();
        return desc ? tb - ta : ta - tb;
      });
    } else if (sortBy.startsWith("weight_kg")) {
      result.sort((a, b) => (desc ? b.weight_kg - a.weight_kg : a.weight_kg - b.weight_kg));
    } else if (sortBy.startsWith("price_per_kg")) {
      result.sort((a, b) => (desc ? b.price_per_kg - a.price_per_kg : a.price_per_kg - b.price_per_kg));
    }

    return result;
  }, [allPosts, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Action Handlers
  const handleOpenAddDialog = () => {
    setSelectedPost(null);
    setDialogOpen(true);
  };

  const handleViewClick = (post: WastePostItem) => {
    setSelectedPost(post);
    setDialogOpen(true);
  };

  const handleArchiveClick = async (post: WastePostItem) => {
    try {
      const response = await deleteWastePost(post.id);
      if (response.success) {
        toast.success("Limbah berhasil diarsipkan.");
        loadInventoryData();
      } else {
        toast.error(response.error || "Gagal mengarsipkan limbah.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menghubungi server.");
    }
  };

  const handlePermanentDeleteClick = async (post: WastePostItem) => {
    try {
      const response = await permanentDeleteWastePost(post.id);
      if (response.success) {
        toast.success("Limbah berhasil dihapus secara permanen.");
        loadInventoryData();
      } else {
        toast.error(response.error || "Gagal menghapus limbah.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menghubungi server.");
    }
  };

  const handleSubmitPost = async (formData: WasteInput) => {
    if (!user?.id) return;

    if (selectedPost) {
      // Edit Mode
      const response = await updateWastePost(selectedPost.id, formData, user.id);
      if (response.success) {
        toast.success("Limbah berhasil diperbarui.");
        loadInventoryData();
      } else {
        throw new Error(response.error || "Gagal memperbarui limbah.");
      }
    } else {
      // Create Mode
      const response = await createWastePost(user.id, formData);
      if (response.success) {
        toast.success("Limbah baru berhasil ditambahkan.");
        loadInventoryData();
      } else {
        throw new Error(response.error || "Gagal menambahkan limbah baru.");
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
          Inventaris
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-moss">
          Kelola sisa kain perca garmen, atur detail kategori serat kain, serta perbarui status dan berat ketersediaan kain Anda di sini.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-xl">
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Metrics */}
        <WasteSummaryMetrics
          providerId={user?.id || ""}
          refreshTrigger={refreshTrigger}
        />

        {/* Toolbar Filters & Aksi */}
        <WasteTableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onAddClick={handleOpenAddDialog}
        />

        {/* Data Table */}
        <WasteDataTable
          posts={filteredPosts}
          isLoading={isLoading}
          onViewClick={handleViewClick}
          onArchiveClick={handleArchiveClick}
          onPermanentDeleteClick={handlePermanentDeleteClick}
        />
      </div>

      {/* Dialog Form Form Tambah / Detail Edit */}
      <WasteDialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={selectedPost}
        categories={categories}
        onSubmit={handleSubmitPost}
      />
    </div>
  );
}
