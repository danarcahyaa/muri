import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { AddToCartInput, Cart, CartItem, UpdateCartItemInput } from "@/types/cart";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";

const CART_ITEMS_SELECT = `
  id,
  cart_id,
  product_id,
  quantity,
  created_at,
  updated_at,
  products!inner (
    id,
    sku,
    product_name,
    description,
    price_idr,
    stock,
    status,
    brand_id,
    product_category_id,
    brands!inner (
      id,
      brand_name
    ),
    product_categories!inner (
      id,
      category_name
    )
  )
` as const;

/**
 * Get or create a cart for the specified user ID.
 */
export async function getOrCreateUserCart(userId: string): Promise<string | null> {
  const { data: existingCart, error: fetchError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.warn("[getOrCreateUserCart] Fetch cart warning:", translateSupabaseError(fetchError));
    return null;
  }

  if (existingCart) {
    return existingCart.id as string;
  }

  const { data: newCart, error: createError } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (createError || !newCart) {
    console.warn("[getOrCreateUserCart] Create cart warning:", translateSupabaseError(createError));
    return null;
  }

  return newCart.id as string;
}

/**
 * Fetch the complete user cart with item and product details.
 */
export async function getUserCart(): Promise<BaseResponse<Cart>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
      };
    }

    const cartId = await getOrCreateUserCart(user.id);
    if (!cartId) {
      return {
        success: false,
        error: "Gagal memuat keranjang belanja.",
      };
    }

    const { data: rawItems, error: itemsError } = await supabase
      .from("cart_items")
      .select(CART_ITEMS_SELECT)
      .eq("cart_id", cartId)
      .order("created_at", { ascending: false });

    if (itemsError) {
      return {
        success: false,
        error: translateSupabaseError(itemsError),
      };
    }

    const items: CartItem[] = [];
    let totalItems = 0;
    let totalPriceIdr = 0;

    if (rawItems) {
      for (const row of rawItems) {
        const item = mapCartItemRow(row);
        if (item) {
          items.push(item);
          totalItems += item.quantity;
          totalPriceIdr += item.quantity * item.product.priceIdr;
        }
      }
    }

    return {
      success: true,
      data: {
        id: cartId,
        userId: user.id,
        items,
        totalItems,
        totalPriceIdr,
        createdAt: null,
        updatedAt: null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Add a product to the user's cart.
 */
export async function addToCart(
  input: AddToCartInput,
): Promise<BaseResponse<Cart>> {
  try {
    const productId = input.productId.trim();
    const quantity = Math.max(1, Math.floor(input.quantity));

    if (!productId) {
      return {
        success: false,
        error: "ID produk tidak valid.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Silakan masuk terlebih dahulu untuk menambahkan produk ke keranjang.",
      };
    }

    // Verify product status & stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock, status, product_name")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product) {
      return {
        success: false,
        error: "Produk tidak ditemukan.",
      };
    }

    if (product.status !== "published") {
      return {
        success: false,
        error: "Produk ini sedang tidak tersedia.",
      };
    }

    const availableStock = Math.max(0, Number(product.stock));
    if (availableStock <= 0) {
      return {
        success: false,
        error: "Stok produk sudah habis.",
      };
    }

    const cartId = await getOrCreateUserCart(user.id);
    if (!cartId) {
      return {
        success: false,
        error: "Gagal mengakses keranjang belanja.",
      };
    }

    // Check existing item in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .maybeSingle();

    const newQuantity = (existingItem ? Number(existingItem.quantity) : 0) + quantity;

    if (newQuantity > availableStock) {
      return {
        success: false,
        error: `Jumlah melebihi stok yang tersedia (${availableStock} barang).`,
      };
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);

      if (updateError) {
        return {
          success: false,
          error: translateSupabaseError(updateError),
        };
      }
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
      });

      if (insertError) {
        return {
          success: false,
          error: translateSupabaseError(insertError),
        };
      }
    }

    return await getUserCart();
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Update quantity of a cart item.
 */
export async function updateCartItemQuantity(
  input: UpdateCartItemInput,
): Promise<BaseResponse<Cart>> {
  try {
    const cartItemId = input.cartItemId.trim();
    const quantity = Math.floor(input.quantity);

    if (!cartItemId) {
      return {
        success: false,
        error: "ID item keranjang tidak valid.",
      };
    }

    if (quantity <= 0) {
      return removeCartItem(cartItemId);
    }

    // Check cart item & product stock
    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select("id, product_id, products!inner(stock)")
      .eq("id", cartItemId)
      .maybeSingle();

    if (itemError || !item) {
      return {
        success: false,
        error: "Item tidak ditemukan di keranjang.",
      };
    }

    const productRecord = item.products as unknown as { stock: number };
    const availableStock = Math.max(0, Number(productRecord?.stock ?? 0));

    if (quantity > availableStock) {
      return {
        success: false,
        error: `Stok tidak mencukupi (maksimal ${availableStock} barang).`,
      };
    }

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartItemId);

    if (updateError) {
      return {
        success: false,
        error: translateSupabaseError(updateError),
      };
    }

    return await getUserCart();
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Remove a specific item from the cart.
 */
export async function removeCartItem(
  cartItemId: string,
): Promise<BaseResponse<Cart>> {
  try {
    const id = cartItemId.trim();
    if (!id) {
      return {
        success: false,
        error: "ID item keranjang tidak valid.",
      };
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return await getUserCart();
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Clear all items in the user's cart.
 */
export async function clearCart(): Promise<BaseResponse<void>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Sesi Anda telah berakhir.",
      };
    }

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cart) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id);

      if (error) {
        return {
          success: false,
          error: translateSupabaseError(error),
        };
      }
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Get total item count in user's cart (using Supabase count option).
 */
export async function getCartItemCount(): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!cart) {
      return 0;
    }

    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("cart_id", cart.id);

    if (error || count === null) {
      return 0;
    }

    return count;
  } catch {
    return 0;
  }
}

function mapCartItemRow(row: Record<string, unknown>): CartItem | null {
  try {
    const productData = unwrapRelation(row.products) as Record<string, unknown> | null;
    if (!productData) {
      return null;
    }

    const brandData = unwrapRelation(productData.brands) as Record<string, unknown> | null;
    const categoryData = unwrapRelation(productData.product_categories) as Record<string, unknown> | null;

    if (!brandData || !categoryData) {
      return null;
    }

    const priceIdr = Math.max(0, Number(productData.price_idr ?? 0));
    const stock = Math.max(0, Number(productData.stock ?? 0));

    return {
      id: row.id as string,
      cartId: row.cart_id as string,
      productId: row.product_id as string,
      quantity: Math.max(1, Number(row.quantity ?? 1)),
      createdAt: (row.created_at as string) || null,
      updatedAt: (row.updated_at as string) || null,
      product: {
        id: productData.id as string,
        slug: (productData.sku as string)?.trim() || "",
        name: (productData.product_name as string)?.trim() || "",
        description: (productData.description as string)?.trim() || null,
        priceIdr,
        stock,
        status: (productData.status as Database["public"]["Enums"]["product_status"]) || "draft",
        brandId: brandData.id as string,
        brandName: (brandData.brand_name as string)?.trim() || "",
        categoryId: Number(categoryData.id ?? 0),
        categoryName: (categoryData.category_name as string)?.trim() || "",
      },
    };
  } catch {
    return null;
  }
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
