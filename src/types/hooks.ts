import type { WastePostItem, FabricCategoryItem, WasteInput, WastePurchaseItem } from "@/types/wasteProvider";

/** Return type for the `useWasteInventory` hook. */
export interface UseWasteInventoryReturn {
  // Data
  filteredPosts: WastePostItem[];
  categories: FabricCategoryItem[];
  isLoading: boolean;
  error: string | null;
  refreshTrigger: number;
  // Filter state
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: string[];
  setSelectedCategory: (v: string[]) => void;
  selectedStatus: string[];
  setSelectedStatus: (v: string[]) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  // Dialog state
  dialogOpen: boolean;
  setDialogOpen: (v: boolean) => void;
  selectedPost: WastePostItem | null;
  // Handlers
  handleOpenAddDialog: () => void;
  handleViewClick: (post: WastePostItem) => void;
  handleArchiveClick: (post: WastePostItem) => Promise<void>;
  handlePermanentDeleteClick: (post: WastePostItem) => Promise<void>;
  handleSubmitPost: (formData: WasteInput) => Promise<void>;
}

/** Return type for the `useWastePurchases` hook. */
export interface UseWastePurchasesReturn {
  // Data
  purchases: WastePurchaseItem[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refreshTrigger: number;
  // Pagination & filter state
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  // Dialog state
  selectedPurchase: WastePurchaseItem | null;
  detailDialogOpen: boolean;
  setDetailDialogOpen: (v: boolean) => void;
  // Handlers
  handleConfirmPurchase: (purchaseId: string) => Promise<void>;
  handleRejectPurchase: (purchaseId: string) => Promise<void>;
  handleViewDetail: (purchase: WastePurchaseItem) => void;
  handleFilterSearchExecute: () => void;
  handleStatusFilterChange: (statuses: string[]) => void;
}
