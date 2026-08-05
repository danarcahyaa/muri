import { useState, useEffect, type ReactElement } from "react";
import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
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
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 font-body">
      {/* Menunggu Konfirmasi */}
      <Card className="flex min-h-40 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Menunggu Konfirmasi
          </p>
          <div className="p-1.5 rounded-full bg-line-trace/40 text-muted-moss">
            <Clock className="size-4" />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${waitingCount} pesanan`
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Pesanan baru yang perlu segera Anda konfirmasi.
          </p>
        </div>
      </Card>

      {/* Complete */}
      <Card className="flex min-h-40 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Selesai
          </p>
          <div className="p-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald">
            <CheckCircle2 className="size-4" />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${completedCount} pesanan`
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Akumulasi transaksi order kain yang berhasil dituntaskan.
          </p>
        </div>
      </Card>

      {/* Cancelled */}
      <Card className="flex min-h-40 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Dibatalkan
          </p>
          <div className="p-1.5 rounded-full bg-error-rust/10 text-error-rust">
            <XCircle className="size-4" />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${cancelledCount} pesanan`
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Order limbah yang telah dibatalkan oleh kustomer.
          </p>
        </div>
      </Card>

      {/* Rejected */}
      <Card className="flex min-h-40 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Ditolak
          </p>
          <div className="p-1.5 rounded-full bg-error-rust/10 text-error-rust">
            <Ban className="size-4" />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `${rejectedCount} pesanan`
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Order limbah yang telah ditolak oleh Anda.
          </p>
        </div>
      </Card>
    </div>
  );
}

