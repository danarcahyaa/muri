import { useState, useEffect, type ReactElement } from "react";
import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPurchaseMetrics } from "@/services/waste-providers/purchaseService";

interface PurchaseSummaryMetricsProps {
  providerId: string;
  refreshTrigger?: number;
}

export function PurchaseSummaryMetrics({
  providerId,
  refreshTrigger,
}: PurchaseSummaryMetricsProps): ReactElement {
  const [waitingCount, setWaitingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;

    async function loadMetricsData() {
      try {
        setIsLoading(true);
        const res = await getPurchaseMetrics(providerId);

        if (res.success && res.data) {
          setWaitingCount(res.data.waitingCount);
          setCompletedCount(res.data.completedCount);
          setCancelledCount(res.data.cancelledCount);
          setRejectedCount(res.data.rejectedCount);
        }
      } catch (err) {
        console.error("Gagal mengambil metrik pesanan:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetricsData();
  }, [providerId, refreshTrigger]);

  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-4 font-body">
      {/* Menunggu Konfirmasi */}
      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase text-muted-moss">
            Menunggu Konfirmasi
          </p>
          <div className="p-1 rounded-full bg-line-trace/20">
            <Clock className="h-4 w-4 text-muted-moss/80" />
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-bold tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${waitingCount} Pesanan`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Pesanan baru yang perlu segera Anda konfirmasi.
          </p>
        </div>
      </article>

      {/* Complete */}
      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase text-muted-moss">
            Selesai
          </p>
          <div className="p-1 rounded-full bg-brand-emerald/10">
            <CheckCircle2 className="h-4 w-4 text-brand-emerald/70" />
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-bold tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${completedCount} Pesanan`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Akumulasi transaksi order kain yang berhasil dituntaskan.
          </p>
        </div>
      </article>

      {/* Cancelled */}
      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase text-muted-moss">
            Dibatalkan
          </p>
          <div className="p-1 rounded-full bg-error-rust/10">
            <XCircle className="h-4 w-4 text-error-rust/70" />
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-bold tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${cancelledCount} Pesanan`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Order limbah yang telah dibatalkan oleh kustomer.
          </p>
        </div>
      </article>
          
      {/* Rejected */}
      <article className="flex min-h-32 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase text-muted-moss">
            Ditolak
          </p>
          <div className="p-1 rounded-full bg-error-rust/10">
            <Ban className="h-4 w-4 text-error-rust/70" />
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-bold tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${rejectedCount} Pesanan`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Order limbah yang telah ditolak oleh Anda.
          </p>
        </div>
      </article>
    </div>
  );
}
