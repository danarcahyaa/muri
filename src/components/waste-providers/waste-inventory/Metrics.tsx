import { useState, useEffect, type ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatWeightKg } from "@/lib/formatter";
import { getWastePostsCount, getTotalWasteWeight } from "@/services/waste-providers/wasteService";

interface WasteSummaryMetricsProps {
  providerId: string;
  refreshTrigger?: number;
}

export function WasteSummaryMetrics({
  providerId,
  refreshTrigger,
}: WasteSummaryMetricsProps): ReactElement {
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;

    async function loadMetricsData() {
      try {
        setIsLoading(true);
        const [countResponse, weightResponse] = await Promise.all([
          getWastePostsCount(providerId),
          getTotalWasteWeight(providerId),
        ]);

        if (countResponse.success && countResponse.data !== undefined) {
          setTotalRecords(countResponse.data ?? 0);
        }
        if (weightResponse.success) {
          setTotalWeight(weightResponse.data || 0);
        }
      } catch (err) {
        console.error("Gagal mengambil metrik ringkasan:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetricsData();
  }, [providerId, refreshTrigger]);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* Total Catatan */}
      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <p className="text-[11px] font-medium uppercase text-muted-moss">
          Total
        </p>
        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-bold tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              `${totalRecords} Kain`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Jumlah total limbah kain Anda.
          </p>
        </div>
      </article>

      {/* Total Berat */}
      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <p className="text-[11px] font-medium uppercase text-muted-moss">
          Total Berat
        </p>
        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-bold tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-28" />
            ) : (
              formatWeightKg(totalWeight)
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Akumulasi berat keseluruhan material limbah.
          </p>
        </div>
      </article>
    </div>
  );
}
