"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import {
  getWastePosts,
  getFabricCategories,
  createWastePost,
  updateWastePost,
  deleteWastePost,
  permanentDeleteWastePost,
} from "@/services/waste-providers/wasteService";
import type { WastePostItem, FabricCategoryItem, WasteInput } from "@/types/wasteProvider";
import type { UseWasteInventoryReturn } from "@/types/hooks";
import { ALL_CATEGORIES, ALL_WASTE_STATUSES } from "@/constants/constant";

export function useWasteInventory(): UseWasteInventoryReturn {
  const { user } = useAuth();

  // allPosts: raw data from Supabase (no client-side filters applied)
  const [allPosts, setAllPosts] = useState<WastePostItem[]>([]);
  const [categories, setCategories] = useState<FabricCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>(ALL_CATEGORIES);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(ALL_WASTE_STATUSES);
  const [sortBy, setSortBy] = useState("created_at_desc");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<WastePostItem | null>(null);
  const [batchWarningOpen, setBatchWarningOpen] = useState(false);

  // Increment to manually trigger a data re-fetch after CRUD
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

  // Supabase fetch — runs on user change, refreshTrigger, or searchQuery change.
  // Category / status / sort changes do NOT trigger a refetch (handled client-side).
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function fetchPosts(uid: string) {
      try {
        setIsLoading(true);
        setError(null);

        if (searchQuery.trim()) {
          // Search mode: push all filters to Supabase
          let categoryIds: number[] | undefined = undefined;
          if (
            selectedCategory.length > 0 &&
            selectedCategory.length < ALL_CATEGORIES.length
          ) {
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
          // Normal mode: fetch all, filter/sort client-side
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

  /** Increment refresh counter to re-fetch data after a CRUD operation. */
  function triggerRefresh() {
    setRefreshTrigger((prev) => prev + 1);
  }

  // Client-side filter & sort (no-search mode only)
  const filteredPosts: WastePostItem[] = useMemo(() => {
    // In search mode, Supabase already returned filtered results
    if (searchQuery.trim()) return allPosts;

    let result = [...allPosts];

    // Category filter
    if (
      selectedCategory.length > 0 &&
      selectedCategory.length < ALL_CATEGORIES.length
    ) {
      result = result.filter((p) => selectedCategory.includes(p.category_name));
    }

    // Status filter
    if (
      selectedStatus.length > 0 &&
      !selectedStatus.includes("all") &&
      selectedStatus.length < ALL_WASTE_STATUSES.length
    ) {
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
      result.sort((a, b) =>
        desc ? b.weight_kg - a.weight_kg : a.weight_kg - b.weight_kg,
      );
    } else if (sortBy.startsWith("price_per_kg")) {
      result.sort((a, b) =>
        desc ? b.price_per_kg - a.price_per_kg : a.price_per_kg - b.price_per_kg,
      );
    }

    return result;
  }, [allPosts, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // --- Action Handlers ---


  const handleOpenAddDialog = () => {
    setSelectedPost(null);
    setBatchWarningOpen(true);
  };

  const handleConfirmAddDialog = () => {
    setBatchWarningOpen(false);
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
        triggerRefresh();
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
        triggerRefresh();
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
      // Edit mode
      const response = await updateWastePost(selectedPost.id, formData, user.id);
      if (response.success) {
        toast.success("Limbah berhasil diperbarui.");
        triggerRefresh();
      } else {
        throw new Error(response.error || "Gagal memperbarui limbah.");
      }
    } else {
      // Create mode
      const response = await createWastePost(user.id, formData);
      if (response.success) {
        toast.success("Limbah baru berhasil ditambahkan.");
        triggerRefresh();
      } else {
        throw new Error(response.error || "Gagal menambahkan limbah baru.");
      }
    }
  };

  return {
    filteredPosts,
    categories,
    isLoading,
    error,
    refreshTrigger,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    dialogOpen,
    setDialogOpen,
    selectedPost,
    batchWarningOpen,
    setBatchWarningOpen,
    handleOpenAddDialog,
    handleConfirmAddDialog,
    handleViewClick,
    handleArchiveClick,
    handlePermanentDeleteClick,
    handleSubmitPost,
  };
}
