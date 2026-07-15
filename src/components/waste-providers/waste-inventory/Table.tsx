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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WastePostItem } from "@/types/wasteProvider";
import { WastePostStatus } from "@/enums/enum";
import { Eye, Archive, Trash2, PencilOff } from "lucide-react";
import { formatWeightKg, formatIndonesianDate, formatCurrencyIDR } from "@/lib/formatter";

interface TableProps {
  posts: WastePostItem[];
  isLoading: boolean;
  onViewClick: (post: WastePostItem) => void;
  onArchiveClick: (post: WastePostItem) => void;
  onPermanentDeleteClick: (post: WastePostItem) => void;
}

type PendingAction = {
  post: WastePostItem;
  type: "archive" | "permanent_delete";
};

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
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Reset page to 1 when posts list change (e.g. on new filter or search query)
  useEffect(() => {
    setCurrentPage(1);
  }, [posts]);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

  const isSoldOut = (post: WastePostItem) => post.status === WastePostStatus.SOLD_OUT;

  return (
    <>
      {/* ─── Alert Dialog ─────────────────────────────────────────────── */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "permanent_delete"
                ? "Hapus Permanen Limbah?"
                : "Arsipkan Limbah?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "permanent_delete" ? (
                <>
                  Limbah{" "}
                  <span className="font-semibold text-brand-black">
                    &ldquo;{pendingAction.post.custom_fabric_name || "Kain Tanpa Nama"}&rdquo;
                  </span>{" "}
                  berstatus <span className="font-semibold text-[#B05B00]">Terjual</span> akan dihapus
                  secara <span className="font-semibold text-error-rust">permanen</span> dari sistem.
                  Tindakan ini tidak dapat dibatalkan.
                </>
              ) : (
                <>
                  Limbah{" "}
                  <span className="font-semibold text-brand-black">
                    &ldquo;{pendingAction?.post.custom_fabric_name || "Kain Tanpa Nama"}&rdquo;
                  </span>{" "}
                  akan diarsipkan dan tidak akan muncul di daftar aktif.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                pendingAction?.type === "permanent_delete"
                  ? "bg-error-rust text-white hover:bg-error-rust/90"
                  : "bg-brand-forest text-white hover:bg-brand-forest/90"
              }
            >
              {pendingAction?.type === "permanent_delete" ? "Hapus Permanen" : "Arsipkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Table ────────────────────────────────────────────────────── */}
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
                const soldOut = isSoldOut(post);

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
                      <TooltipProvider>
                        <div className="flex justify-end gap-2">
                          {/* ── View / Edit button ── */}
                          <Tooltip>
                            <TooltipTrigger>
                              <button
                                onClick={() => !soldOut && onViewClick(post)}
                                disabled={soldOut}
                                className="inline-flex size-8 items-center justify-center rounded-md border border-line-trace bg-canvas-pure text-muted-moss hover:bg-canvas-warm hover:text-brand-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-canvas-pure"
                                aria-label={soldOut ? "Tidak dapat diedit — sudah terjual" : "Lihat / Edit Detail"}
                              >
                                {soldOut ? (
                                  <PencilOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {soldOut
                                ? "Limbah terjual tidak dapat diedit"
                                : "Lihat / Edit Detail"}
                            </TooltipContent>
                          </Tooltip>

                          {/* ── Archive / Permanent Delete button ── */}
                          <Tooltip>
                            <TooltipTrigger>
                              <button
                                onClick={() =>
                                  setPendingAction({
                                    post,
                                    type: soldOut ? "permanent_delete" : "archive",
                                  })
                                }
                                className={`inline-flex size-8 items-center justify-center rounded-md border transition-colors ${
                                  soldOut
                                    ? "border-error-rust/40 bg-canvas-pure text-error-rust hover:bg-error-rust/[0.06]"
                                    : "border-line-trace bg-canvas-pure text-muted-moss hover:bg-canvas-warm hover:text-brand-black"
                                }`}
                                aria-label={soldOut ? "Hapus permanen" : "Arsipkan limbah"}
                              >
                                {soldOut ? (
                                  <Trash2 className="size-4" />
                                ) : (
                                  <Archive className="size-4" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {soldOut
                                ? "Hapus permanen"
                                : "Arsipkan limbah"}
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
    </>
  );
}
