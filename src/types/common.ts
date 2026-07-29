import { MediaType } from "@/enums/enums";
import { WastePostItem } from "./wasteProvider";

export interface BaseResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T | null;
  error?: string;
}

export interface MediaItem {
  id: string
  url: string
  file?: File
  type: MediaType
  name: string
}

export interface MediaGalleryItem {
  url: string;
  type: "image" | "video";
}

export type PendingAction = {
  post: WastePostItem;
  type: "archive" | "permanent_delete";
};

export interface IndonesiaProvince {
  province: string;
  regencies: string[];
}
