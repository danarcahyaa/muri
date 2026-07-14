import { BaseResponse } from "./common";

export interface WasteProviderRegisterInput {
  companyName: string;
  email: string;
  password?: string;
  activeNumber: string;
}

export interface WasteProviderRegisterData {
  wasteProvider: {
    id: string;
    companyName: string;
    email: string;
  };
}

export type WasteProviderRegisterResponse = BaseResponse<WasteProviderRegisterData>;
