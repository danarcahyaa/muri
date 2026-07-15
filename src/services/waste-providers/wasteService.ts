/**
 * @deprecated Import langsung dari file service spesifik atau dari "./index".
 * File ini hanya menjaga backward compatibility agar import lama tidak perlu diubah.
 */
export { getWastePosts, getWastePostsCount, createWastePost, updateWastePost, deleteWastePost, permanentDeleteWastePost } from "./wastePostsService";
export * from "./wasteCategoryService";
export * from "./wasteStatsService";
