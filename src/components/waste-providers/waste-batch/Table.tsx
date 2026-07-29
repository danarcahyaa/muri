import { useState, useEffect, type ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { TableActionButton } from "@/components/ui/TableActionButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { WasteBatchItem } from "@/types/wasteProvider";
import { Eye } from "lucide-react";
import { formatWeightKg, formatIndonesianDate } from "@/lib/formatter";

interface TableProps {
  batches: WasteBatchItem[];
  isLoading: boolean;
  onViewClick: (batch: WasteBatchItem) => void;
}

export function WasteBatchTable({
  batches,
  isLoading,
  onViewClick,
}: TableProps): ReactElement {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page to 1 when batches list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [batches]);

  const totalPages = Math.ceil(batches.length / itemsPerPage);
  const paginatedBatches = batches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full bg-canvas-pure border border-line-trace rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-canvas-warm/50 border-b border-line-trace/60">
            <TableHead className="w-16 text-center px-4 py-3.5">No</TableHead>
            <TableHead className="px-4 py-3.5">Batch Code</TableHead>
            <TableHead className="px-4 py-3.5">Nama Kain</TableHead>
            <TableHead className="px-4 py-3.5">Jenis Kain</TableHead>
            <TableHead className="px-4 py-3.5">Berat Original</TableHead>
            <TableHead className="px-4 py-3.5">Alamat Asal</TableHead>
            <TableHead className="px-4 py-3.5">Tanggal Dibuat</TableHead>
            <TableHead className="w-24 text-right px-6 py-3.5">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-line-trace/40">
          {isLoading ? (
            <TableSkeleton columnsCount={8} rowsCount={itemsPerPage} />
          ) : batches.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-10 text-xs text-muted-moss"
              >
                Belum ada jejak limbah tercatat yang cocok dengan filter pencarian.
              </TableCell>
            </TableRow>
          ) : (
            paginatedBatches.map((batch, index) => (
              <TableRow
                key={batch.id}
                className="hover:bg-canvas-warm/10 transition-colors"
              >
                <TableCell className="w-16 text-center text-xs font-mono font-medium text-muted-moss px-4 py-3.5">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="font-mono font-semibold text-brand-black px-4 py-3.5">
                  {batch.batch_code}
                </TableCell>
                <TableCell
                  className="font-semibold text-brand-black px-4 py-3.5 max-w-[200px] truncate"
                  title={batch.fabric_name_snapshot || "Kain Tanpa Nama"}
                >
                  {batch.fabric_name_snapshot || "Kain Tanpa Nama"}
                </TableCell>
                <TableCell className="text-brand-black px-4 py-3.5">
                  {batch.fabric_category_snapshot || "-"}
                </TableCell>
                <TableCell className="text-brand-black px-4 py-3.5">
                  {formatWeightKg(batch.initial_weight_kg)}
                </TableCell>
                <TableCell className="text-brand-black px-4 py-3.5">
                  {batch.origin_city}
                </TableCell>
                <TableCell className="text-brand-black px-4 py-3.5">
                  {formatIndonesianDate(batch.created_at)}
                </TableCell>
                <TableCell className="w-24 text-right px-6 py-3.5">
                  <TableActionButton
                    onClick={() => onViewClick(batch)}
                    aria-label="Lihat Detail Jejak Limbah"
                  >
                    <Eye className="size-4" />
                  </TableActionButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line-trace px-6 py-4 bg-canvas-warm/10">
          <div className="text-xs text-muted-moss">
            Menampilkan{" "}
            <span className="font-semibold text-brand-black">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-brand-black">
              {Math.min(currentPage * itemsPerPage, batches.length)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-brand-black">
              {batches.length}
            </span>{" "}
            data
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center justify-center rounded border border-line-trace bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors"
            >
              Sebelumnya
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="inline-flex h-8 items-center justify-center rounded border border-line-trace bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
