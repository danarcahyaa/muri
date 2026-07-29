import { type ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Eye } from "lucide-react";
import { WastePurchaseItem } from "@/types/wasteProvider";
import { formatWeightKg, formatIndonesianDate, formatCurrencyIDR } from "@/lib/formatter";
import { OrderStatus as PurchaseStatus } from "@/enums/enums";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { TableActionButton } from "@/components/ui/TableActionButton";

interface PurchaseTableProps {
  purchases: WastePurchaseItem[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetail: (purchase: WastePurchaseItem) => void;
}

export function PurchaseTable({
  purchases,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetail,
}: PurchaseTableProps): ReactElement {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PurchaseStatus.PENDING:
        return <StatusBadge variant="warning">Konfirmasi</StatusBadge>;
      case PurchaseStatus.COMPLETE:
        return <StatusBadge variant="success">Selesai</StatusBadge>;
      case PurchaseStatus.CANCELLED:
      case PurchaseStatus.REJECTED:
        return <StatusBadge variant="danger">{status === PurchaseStatus.CANCELLED ? "Dibatalkan" : "Ditolak"}</StatusBadge>;
      default:
        return <StatusBadge variant="neutral">{status}</StatusBadge>;
    }
  };

  return (
    <div className="w-full bg-canvas-pure border border-line-trace rounded-lg overflow-hidden font-body">
      <Table>
        <TableHeader>
          <TableRow className="bg-canvas-warm/50 border-b border-line-trace/60">
            <TableHead className="w-16 text-center px-4 py-3.5">No</TableHead>
            <TableHead className="px-4 py-3.5">Brand</TableHead>
            <TableHead className="px-4 py-3.5">Nama Kain</TableHead>
            <TableHead className="px-4 py-3.5">Berat Dibeli</TableHead>
            <TableHead className="px-4 py-3.5">Harga/Kg</TableHead>
            <TableHead className="px-4 py-3.5">Total Harga</TableHead>
            <TableHead className="px-4 py-3.5">Tanggal</TableHead>
            <TableHead className="px-4 py-3.5">Status</TableHead>
            <TableHead className="w-20 text-right px-6 py-3.5">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-line-trace/40">
          {isLoading ? (
            <TableSkeleton columnsCount={9} rowsCount={pageSize} />
          ) : purchases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-moss">
                Belum ada transaksi pesanan yang cocok dengan filter.
              </TableCell>
            </TableRow>
          ) : (
            purchases.map((purchase, index) => {
              const rowNumber = (currentPage - 1) * pageSize + index + 1;

              return (
                <TableRow
                  key={purchase.id}
                  className="hover:bg-canvas-warm/10 transition-colors"
                >
                  <TableCell className="w-16 text-center text-xs font-mono font-medium text-muted-moss px-4 py-3.5">
                    {rowNumber}
                  </TableCell>
                  <TableCell className="font-semibold text-brand-black px-4 py-3.5 max-w-[150px] truncate" title={purchase.brands?.brand_name}>
                    {purchase.brands?.brand_name || "Nama Brand Kosong"}
                  </TableCell>
                  <TableCell className="font-semibold text-brand-black px-4 py-3.5 max-w-[150px] truncate" title={purchase.brands?.brand_name}>
                    {purchase.fabric_name_snapshot} 
                  </TableCell>
                  <TableCell className="text-brand-black px-4 py-3.5">
                    {formatWeightKg(purchase.weight_bought_kg)}
                  </TableCell>
                  <TableCell className="text-brand-black px-4 py-3.5">
                    {formatCurrencyIDR(purchase.original_price_per_kg)}/kg
                  </TableCell>
                  <TableCell className="text-brand-black font-semibold px-4 py-3.5 font-sans">
                    {formatCurrencyIDR(purchase.final_price_idr)}
                  </TableCell>
                  <TableCell className="text-brand-black px-4 py-3.5">
                    {formatIndonesianDate(purchase.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    {getStatusBadge(purchase.purchase_status)}
                  </TableCell>
                  <TableCell className="w-20 text-right px-6 py-3.5">
                    <div className="flex justify-end gap-2 items-center">
                      <TableActionButton
                        onClick={() => onViewDetail(purchase)}
                        title="Lihat Detail Transaksi"
                        aria-label="Lihat Detail Transaksi"
                      >
                        <Eye className="size-4" />
                      </TableActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line-trace px-6 py-4 bg-canvas-warm/10">
          <div className="text-xs text-muted-moss">
            Menampilkan{" "}
            <span className="font-semibold text-brand-black">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-brand-black">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-brand-black">
              {totalCount}
            </span>{" "}
            data
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center justify-center rounded border border-line-trace bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 items-center justify-center rounded border border-line-trace bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
