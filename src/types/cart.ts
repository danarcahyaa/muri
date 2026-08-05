import type { ProductStatus } from "@/types/product";

export interface CartProductSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceIdr: number;
  stock: number;
  status: ProductStatus;
  brandId: string;
  brandName: string;
  categoryId: number;
  categoryName: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string | null;
  updatedAt: string | null;
  product: CartProductSummary;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPriceIdr: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cartItemId: string;
  quantity: number;
}

export type CartErrorCode =
  | "UNAUTHENTICATED"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_NOT_AVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "EXCEEDS_STOCK"
  | "INVALID_QUANTITY"
  | "CART_NOT_FOUND"
  | "ITEM_NOT_FOUND"
  | "CART_OPERATION_FAILED";
