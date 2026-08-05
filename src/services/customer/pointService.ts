import { supabase } from "@/lib/supabaseClient";
import type { BaseResponse } from "@/types/common";

export interface PointLedgerItem {
  id: string;
  createdAt: string;
  activityName: string;
  type: "earned" | "spent";
  amountCoin: number;
}

export async function getCustomerPointLedger(): Promise<
  BaseResponse<PointLedgerItem[]>
> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const items: PointLedgerItem[] = [];

    if (user) {
      // 1. Fetch customer orders with point changes
      const { data: orders } = await supabase
        .from("orders")
        .select(
          "id, total_coins_redeemed, points_earned, created_at, order_items(product_name_snapshot)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (orders && orders.length > 0) {
        orders.forEach((ord: any) => {
          if (ord.points_earned > 0) {
            const productName =
              ord.order_items?.[0]?.product_name_snapshot || "Produk Sirkular";
            items.push({
              id: `earned-${ord.id}`,
              createdAt: ord.created_at,
              activityName: `Bonus Pembelian ${productName}`,
              type: "earned",
              amountCoin: ord.points_earned,
            });
          }
          if (ord.total_coins_redeemed > 0) {
            items.push({
              id: `spent-${ord.id}`,
              createdAt: ord.created_at,
              activityName: `Diskon Penukaran Coin Order #${ord.id.substring(0, 8)}`,
              type: "spent",
              amountCoin: ord.total_coins_redeemed,
            });
          }
        });
      }

      // 2. Fetch workshop registrations with points redeemed
      const { data: registrations } = await supabase
        .from("workshop_registrations")
        .select("id, points_redeemed, created_at, workshops(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (registrations && registrations.length > 0) {
        registrations.forEach((reg: any) => {
          if (reg.points_redeemed > 0) {
            const title = reg.workshops?.title || "Workshop Sirkular";
            items.push({
              id: `wreg-${reg.id}`,
              createdAt: reg.created_at,
              activityName: `Penukaran Workshop ${title}`,
              type: "spent",
              amountCoin: reg.points_redeemed,
            });
          }
        });
      }
    }



    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("[getCustomerPointLedger] Error:", error);
    return {
      success: true,
      data: [],
    };
  }
}
