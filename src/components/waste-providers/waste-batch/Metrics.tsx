import { useState, useEffect, type ReactElement } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
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
      <Card className="flex min-h-40 flex-col p-6">
        <p className="text-[11px] font-medium uppercase text-muted-moss">
          Total Jejak
        </p>
        <div className="mt-auto pt-6">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              `${totalBatches} batch`
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Jumlah total jejak limbah yang telah tercatat.
          </p>
        </div>
      </Card>

      <Card className="flex min-h-40 flex-col p-6">
        <p className="text-[11px] font-medium uppercase text-muted-moss">
          Total Berat Tercatat
        </p>
        <div className="mt-auto pt-6">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-28" />
            ) : (
              formatWeightKg(totalWeight)
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Akumulasi berat awal seluruh limbah dari awal.
          </p>
        </div>
      </Card>
    </div>
  );
}

