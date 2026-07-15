import { MediaType } from "@/enums/enum";

export interface BaseResponse<T = any> {
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
