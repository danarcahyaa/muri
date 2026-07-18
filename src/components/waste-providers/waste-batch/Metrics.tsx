import { useState, useEffect, type ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatWeightKg } from "@/lib/formatter";
import { getTotalBatchWeight, getTotalBatchCount } from "@/services/waste-providers/wasteBatchService";

interface BatchMetricsProps {
  providerId: string;
}

export function WasteBatchMetrics({ providerId }: BatchMetricsProps): ReactElement {
  const [totalBatches, setTotalBatches] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;

    async function loadMetrics() {
      try {
        setIsLoading(true);
        const [countRes, weightRes] = await Promise.all([
          getTotalBatchCount(providerId),
          getTotalBatchWeight(providerId),
        ]);
        if (countRes.success && countRes.data !== undefined) {
          setTotalBatches(countRes.data ?? 0);
        }
        if (weightRes.success && weightRes.data !== undefined) {
          setTotalWeight(weightRes.data ?? 0);
        }
      } catch (err) {
        console.error("Failed to load batch metrics:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, [providerId]);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <p className="text-[11px] font-medium uppercase text-muted-moss">
          Total Jejak
        </p>
        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-bold tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              `${totalBatches} Batch`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Jumlah total jejak limbah yang telah tercatat.
          </p>
        </div>
      </article>

      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <p className="text-[11px] font-medium uppercase text-muted-moss">
          Total Berat Tercatat
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
            Akumulasi berat awal seluruh limbah dari awal.
          </p>
        </div>
      </article>
    </div>
  );
}
