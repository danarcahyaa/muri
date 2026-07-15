import { useState, useEffect, type ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { WastePostItem } from "@/types/wasteProvider";
import { Trash2, Eye } from "lucide-react";
import { formatWeightKg, formatIndonesianDate, formatCurrencyIDR } from "@/lib/formatter";

interface TableProps {
  posts: WastePostItem[];
  isLoading: boolean;
  onViewClick: (post: WastePostItem) => void;
  onDeleteClick: (post: WastePostItem) => void;
}

export function WasteDataTable({
  posts,
  isLoading,
  onViewClick,
  onDeleteClick,
}: TableProps): ReactElement {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page to 1 when posts list change (e.g. on new filter or search query)
  useEffect(() => {
    setCurrentPage(1);
  }, [posts]);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full bg-canvas-pure border border-line-trace rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-canvas-warm/50 border-b border-line-trace/60">
            <TableHead className="w-16 text-center px-4 py-3.5">No</TableHead>
            <TableHead className="px-4 py-3.5">Nama Kain</TableHead>
            <TableHead className="px-4 py-3.5">Jenis</TableHead>
            <TableHead className="px-4 py-3.5">Berat</TableHead>
            <TableHead className="px-4 py-3.5">Harga/Kg</TableHead>
            <TableHead className="px-4 py-3.5">Tanggal</TableHead>
            <TableHead className="px-4 py-3.5">Status</TableHead>
            <TableHead className="w-24 text-right px-6 py-3.5">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-line-trace/40">
          {isLoading ? (
            // Loading Skelefns
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="hover:bg-transparent">
                <TableCell className="w-16 text-center px-4 py-3.5">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-44" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-5 w-16 rounded" />
                </TableCell>
                <TableCell className="w-24 text-right px-6 py-3.5">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="size-8 rounded" />
                    <Skeleton className="size-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-moss">
                Belum ada material terdaftar yang cocok dengan filter pencarian.
              </TableCell>
            </TableRow>
          ) : (
            paginatedPosts.map((post, index) => {
              const displayStatus =
                post.status === "active"
                  ? "Aktif"
                  : post.status === "sold_out"
                    ? "Terjual"
                    : "Diarsipkan";

              const statusColor =
                post.status === "active"
                  ? "bg-[#D2E7D6] text-brand-forest"
                  : post.status === "sold_out"
                    ? "bg-[#FFE8CC] text-[#B05B00]"
                    : "bg-canvas-warm text-muted-moss";

              return (
                <TableRow key={post.id} className="hover:bg-canvas-warm/10 transition-colors">
                  <TableCell className="w-16 text-center text-xs font-mono font-medium text-muted-moss px-4 py-3.5">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-brand-black px-4 py-3.5 max-w-[200px] truncate" title={post.custom_fabric_name || "Kain Tanpa Nama"}>
                    {post.custom_fabric_name || "Kain Tanpa Nama"}
                  </TableCell>
                  <TableCell className="text-brand-black px-4 py-3.5">
                    {post.category_name}
                  </TableCell>
                  <TableCell className="text-brand-black px-4 py-3.5">
                    {formatWeightKg(post.weight_kg)}
                  </TableCell>
                  <TableCell className="text-brand-black px-4 py-3.5">
                    {formatCurrencyIDR(post.price_per_kg)}
                    <span className="text-muted-moss text-[10px] ml-0.5">/kg</span>
                  </TableCell>
                  <TableCell className="text-brand-black px-4 py-3.5">
                    {formatIndonesianDate(post.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className={`inline-block rounded px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${statusColor}`}>
                      {displayStatus}
                    </span>
                  </TableCell>
                  <TableCell className="w-24 text-right px-6 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewClick(post)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line-trace bg-canvas-pure text-muted-moss hover:bg-canvas-warm hover:text-brand-black transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClick(post)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line-trace bg-canvas-pure text-error-rust hover:bg-error-rust/[0.06] hover:text-error-rust transition-colors"
                        title="Arsipkan Limbah"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line-trace px-6 py-4 bg-canvas-warm/10">
          <div className="text-xs text-muted-moss">
            Menampilkan <span className="font-semibold text-brand-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-semibold text-brand-black">{Math.min(currentPage * itemsPerPage, posts.length)}</span> dari <span className="font-semibold text-brand-black">{posts.length}</span> data
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
