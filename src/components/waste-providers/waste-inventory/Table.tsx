import { useState, useEffect, type ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { TableActionButton } from "@/components/ui/TableActionButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { WastePostItem } from "@/types/wasteProvider";
import { WastePostStatus } from "@/enums/enums";
import { Eye, Archive, Trash2, PencilOff, AlertTriangle, X } from "lucide-react";
import {
  formatWeightKg,
  formatIndonesianDate,
  formatCurrencyIDR,
} from "@/lib/formatter";
import { Button } from "@/components/ui/Button";
import { PendingAction } from "@/types/common";

interface TableProps {
  posts: WastePostItem[];
  isLoading: boolean;
  onViewClick: (post: WastePostItem) => void;
  onArchiveClick: (post: WastePostItem) => void;
  onPermanentDeleteClick: (post: WastePostItem) => void;
}

export function WasteDataTable({
  posts,
  isLoading,
  onViewClick,
  onArchiveClick,
  onPermanentDeleteClick,
}: TableProps): ReactElement {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pending action to confirm via AlertDialog
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  // Reset page to 1 when posts list change (e.g. on new filter or search query)
  useEffect(() => {
    setCurrentPage(1);
  }, [posts]);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function handleConfirm() {
    if (!pendingAction) return;
    if (pendingAction.type === "archive") {
      onArchiveClick(pendingAction.post);
    } else {
      onPermanentDeleteClick(pendingAction.post);
    }
    setPendingAction(null);
  }

  const isSoldOut = (post: WastePostItem) =>
    post.status === WastePostStatus.SOLD_OUT;

  return (
    <>
      {/* Confirmation Modal */}
      {pendingAction && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPendingAction(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default shadow-xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${
                    pendingAction.type === "permanent_delete"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pendingAction.type === "permanent_delete" ? (
                    <AlertTriangle className="size-5" />
                  ) : (
                    <Archive className="size-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-black">
                    {pendingAction.type === "permanent_delete"
                      ? "Hapus Permanen Limbah?"
                      : "Arsipkan Limbah?"}
                  </h3>
                  <p className="text-xs text-muted-moss">
                    {pendingAction.type === "permanent_delete"
                      ? "Tindakan ini tidak dapat dibatalkan"
                      : "Penyimpanan kain limbah"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPendingAction(null)}
                aria-label="Tutup modal"
                className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-xs leading-relaxed text-brand-black/80">
                {pendingAction.type === "permanent_delete" ? (
                  <>
                    Limbah{" "}
                    <span className="font-bold text-brand-black">
                      &ldquo;
                      {pendingAction.post.custom_fabric_name || "Kain Tanpa Nama"}
                      &rdquo;
                    </span>{" "}
                    berstatus{" "}
                    <span className="font-semibold text-amber-800">
                      Terjual
                    </span>{" "}
                    akan dihapus secara{" "}
                    <span className="font-semibold text-red-700">
                      permanen
                    </span>{" "}
                    dari sistem. Semua data terkait limbah ini tidak dapat dikembalikan.
                  </>
                ) : (
                  <>
                    Limbah{" "}
                    <span className="font-bold text-brand-black">
                      &ldquo;
                      {pendingAction.post.custom_fabric_name || "Kain Tanpa Nama"}
                      &rdquo;
                    </span>{" "}
                    akan diarsipkan dan tidak lagi ditampilkan pada katalog aktif brand.
                  </>
                )}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-5 sm:px-8">
              <Button
                size="md"
                variant="outline"
                type="button"
                onClick={() => setPendingAction(null)}
              >
                Batal
              </Button>
              <Button
                size="md"
                variant={
                  pendingAction.type === "permanent_delete"
                    ? "destructive"
                    : "default"
                }
                type="button"
                onClick={handleConfirm}
              >
                {pendingAction.type === "permanent_delete"
                  ? "Ya, Hapus Permanen"
                  : "Ya, Arsipkan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-full bg-canvas-pure border border-brand-black/15 rounded-xl overflow-hidden">
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
              <TableHead className="w-24 text-right px-6 py-3.5">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-line-trace/40">
            {isLoading ? (
              <TableSkeleton columnsCount={8} rowsCount={itemsPerPage} />
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-xs text-muted-moss"
                >
                  Belum ada material terdaftar yang cocok dengan filter
                  pencarian.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPosts.map((post, index) => {
                const soldOut = isSoldOut(post);

                const displayStatus =
                  post.status === "active"
                    ? "Aktif"
                    : post.status === "sold_out"
                      ? "Terjual"
                      : "Diarsipkan";

                return (
                  <TableRow
                    key={post.id}
                    className="hover:bg-canvas-warm/10 transition-colors"
                  >
                    <TableCell className="w-16 text-center text-xs font-mono font-medium text-muted-moss px-4 py-3.5">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell
                      className="font-semibold text-brand-black px-4 py-3.5 max-w-[200px] truncate"
                      title={post.custom_fabric_name || "Kain Tanpa Nama"}
                    >
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
                      <span className="text-muted-moss text-[10px] ml-0.5">
                        /kg
                      </span>
                    </TableCell>
                    <TableCell className="text-brand-black px-4 py-3.5">
                      {formatIndonesianDate(post.created_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <StatusBadge
                        variant={
                          post.status === "active"
                            ? "success"
                            : post.status === "sold_out"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {displayStatus}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="w-24 text-right px-6 py-3.5">
                      <TooltipProvider>
                        <div className="flex justify-end gap-2">
                          {/*  View / Edit button  */}
                          <TableActionButton
                            onClick={() => !soldOut && onViewClick(post)}
                            disabled={soldOut}
                            aria-label={
                              soldOut
                                ? "Tidak dapat diedit — sudah terjual"
                                : "Lihat / Edit Detail"
                            }
                          >
                            {soldOut ? (
                              <PencilOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </TableActionButton>

                          {/* Archive / Permanent Delete button */}
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <TableActionButton
                                  variant={soldOut ? "destructive" : "default"}
                                  onClick={() =>
                                    setPendingAction({
                                      post,
                                      type: soldOut
                                        ? "permanent_delete"
                                        : "archive",
                                    })
                                  }
                                  aria-label={
                                    soldOut
                                      ? "Hapus permanen"
                                      : "Arsipkan limbah"
                                  }
                                >
                                  {soldOut ? (
                                    <Trash2
                                      aria-hidden="true"
                                      className="size-4"
                                    />
                                  ) : (
                                    <Archive
                                      aria-hidden="true"
                                      className="size-4"
                                    />
                                  )}
                                </TableActionButton>
                              }
                            />

                            <TooltipContent side="top">
                              {soldOut ? "Hapus permanen" : "Arsipkan limbah"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line-trace px-6 py-4 bg-canvas-warm/10">
            <div className="text-xs text-muted-moss">
              Menampilkan{" "}
              <span className="font-semibold text-brand-black">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-brand-black">
                {Math.min(currentPage * itemsPerPage, posts.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-brand-black">
                {posts.length}
              </span>{" "}
              data
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex h-8 items-center justify-center rounded border border-brand-black/15 bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="inline-flex h-8 items-center justify-center rounded border border-brand-black/15 bg-canvas-pure px-3 text-xs font-semibold text-brand-black hover:bg-canvas-warm disabled:opacity-50 disabled:hover:bg-canvas-pure transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
