"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  addToCart as addToCartService,
  clearCart as clearCartService,
  getUserCart,
  removeCartItem as removeCartItemService,
  updateCartItemQuantity as updateCartItemQuantityService,
} from "@/services/customer/cartService";
import type { Cart, CartItem } from "@/types/cart";

interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  totalPriceIdr: number;
  isLoading: boolean;
  isUpdating: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await getUserCart();
      if (res.success && res.data) {
        setCart(res.data);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error("[CartProvider] Error refreshing cart:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const handleAddToCart = useCallback(
    async (productId: string, quantity = 1): Promise<boolean> => {
      if (!user) {
        toast.error("Silakan masuk terlebih dahulu untuk menambahkan produk ke keranjang.");
        return false;
      }

      try {
        setIsUpdating(true);
        const res = await addToCartService({ productId, quantity });
        if (res.success && res.data) {
          setCart(res.data);
          toast.success("Produk berhasil ditambahkan ke keranjang!");
          return true;
        } else {
          toast.error(res.error || "Gagal menambahkan produk ke keranjang.");
          return false;
        }
      } catch (error) {
        console.error("[CartProvider] Error adding to cart:", error);
        toast.error("Terjadi kesalahan saat menambahkan ke keranjang.");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [user],
  );

  /**
   * Optimistic Quantity Update: Update local state instantly (0ms)
   * then perform async sync in background.
   */
  const handleUpdateQuantity = useCallback(
    async (cartItemId: string, quantity: number): Promise<boolean> => {
      const previousCart = cart;

      // Optimistically update React state immediately
      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items
          .map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item,
          )
          .filter((item) => item.quantity > 0);

        const { totalItems, totalPriceIdr } = computeCartTotals(updatedItems);
        return {
          ...prev,
          items: updatedItems,
          totalItems,
          totalPriceIdr,
        };
      });

      try {
        const res = await updateCartItemQuantityService({ cartItemId, quantity });
        if (!res.success) {
          // Revert optimistic update on failure
          setCart(previousCart);
          toast.error(res.error || "Gagal memperbarui jumlah item.");
          return false;
        }
        return true;
      } catch (error) {
        console.error("[CartProvider] Error updating quantity:", error);
        setCart(previousCart);
        toast.error("Terjadi kesalahan saat memperbarui keranjang.");
        return false;
      }
    },
    [cart],
  );

  /**
   * Optimistic Remove Item: Delete item locally instantly (0ms)
   * then sync deletion with Supabase in background.
   */
  const handleRemoveItem = useCallback(
    async (cartItemId: string): Promise<boolean> => {
      const previousCart = cart;

      // Optimistically remove item from React state immediately
      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.filter((item) => item.id !== cartItemId);
        const { totalItems, totalPriceIdr } = computeCartTotals(updatedItems);
        return {
          ...prev,
          items: updatedItems,
          totalItems,
          totalPriceIdr,
        };
      });

      toast.success("Item berhasil dihapus dari keranjang.");

      try {
        const res = await removeCartItemService(cartItemId);
        if (!res.success) {
          // Revert on failure
          setCart(previousCart);
          toast.error(res.error || "Gagal menghapus item dari keranjang.");
          return false;
        }
        return true;
      } catch (error) {
        console.error("[CartProvider] Error removing item:", error);
        setCart(previousCart);
        toast.error("Terjadi kesalahan saat menghapus item.");
        return false;
      }
    },
    [cart],
  );

  const handleClearCart = useCallback(async (): Promise<boolean> => {
    const previousCart = cart;

    setCart((prev) =>
      prev
        ? {
            ...prev,
            items: [],
            totalItems: 0,
            totalPriceIdr: 0,
          }
        : null,
    );

    try {
      setIsUpdating(true);
      const res = await clearCartService();
      if (res.success) {
        toast.success("Keranjang berhasil dikosongkan.");
        return true;
      } else {
        setCart(previousCart);
        toast.error(res.error || "Gagal mengosongkan keranjang.");
        return false;
      }
    } catch (error) {
      console.error("[CartProvider] Error clearing cart:", error);
      setCart(previousCart);
      toast.error("Terjadi kesalahan saat mengosongkan keranjang.");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [cart]);

  const items = cart?.items ?? [];
  const itemCount = cart?.totalItems ?? 0;
  const totalPriceIdr = cart?.totalPriceIdr ?? 0;

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      items,
      itemCount,
      totalPriceIdr,
      isLoading,
      isUpdating,
      isOpen,
      setIsOpen,
      openCart,
      closeCart,
      refreshCart,
      addToCart: handleAddToCart,
      updateQuantity: handleUpdateQuantity,
      removeItem: handleRemoveItem,
      clearCart: handleClearCart,
    }),
    [
      cart,
      items,
      itemCount,
      totalPriceIdr,
      isLoading,
      isUpdating,
      isOpen,
      openCart,
      closeCart,
      refreshCart,
      handleAddToCart,
      handleUpdateQuantity,
      handleRemoveItem,
      handleClearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function computeCartTotals(items: CartItem[]): {
  totalItems: number;
  totalPriceIdr: number;
} {
  let totalItems = 0;
  let totalPriceIdr = 0;
  for (const item of items) {
    totalItems += item.quantity;
    totalPriceIdr += item.quantity * item.product.priceIdr;
  }
  return { totalItems, totalPriceIdr };
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext harus digunakan di dalam CartProvider.");
  }
  return context;
}
