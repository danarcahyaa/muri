import { BaseResponse } from "./common";
import { BrandLink } from "./brandLink";

export interface BrandRegisterInput {
  brandName: string;
  email: string;
  password?: string;
  socialMediaLinks: BrandLink[];
  shortStory?: string;
}

export interface BrandRegisterData {
  brand: {
    id: string;
    brandName: string;
    email: string;
  };
}

export type BrandRegisterResponse = BaseResponse<BrandRegisterData>;
