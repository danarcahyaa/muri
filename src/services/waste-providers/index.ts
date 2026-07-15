/**
 * Barrel re-export for the waste-providers service layer.
 * All public functions are accessible from this single entry point.
 *
 * Internal structure:
 *   wastePostsService    — CRUD for waste posts
 *   wasteCategoryService — Fabric category reference data
 *   wasteMediaService    — Supabase storage upload helper
 *   wasteStatsService    — Aggregate statistics (RPC calls)
 */

export { getWastePosts, getWastePostsCount, createWastePost, updateWastePost, deleteWastePost } from "./wastePostsService";
export { getFabricCategories } from "./wasteCategoryService";
export { getTotalWasteWeight } from "./wasteStatsService";
// wasteMediaService (uploadMediaFile) is intentionally not re-exported — internal use only.
