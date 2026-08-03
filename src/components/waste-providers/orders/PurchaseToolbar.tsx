import { useState, useEffect, type ReactElement } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Search, ChevronDown } from "lucide-react";
import { OrderStatus as PurchaseStatus } from "@/enums/enums";

interface PurchaseToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string[];
  setStatusFilter: (s: string[]) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  onSearchExecute: () => void;
}

const TRANSACTION_STATUSES = [
  { value: PurchaseStatus.PENDING, label: "Menunggu Konfirmasi" },
  { value: PurchaseStatus.PROCESSING, label: "Diproses" },
  { value: PurchaseStatus.SHIPPED, label: "Dikirim" },
  { value: PurchaseStatus.COMPLETE, label: "Selesai" },
  { value: PurchaseStatus.CANCELLED, label: "Dibatalkan" },
  { value: PurchaseStatus.REJECTED, label: "Ditolak" },
];

export function PurchaseToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onSearchExecute,
}: PurchaseToolbarProps): ReactElement {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    if (localSearch !== "") return;
    const handler = setTimeout(() => {
      if (searchQuery !== "") {
        setSearchQuery("");
        onSearchExecute();
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const isAllStatusesSelected = statusFilter.length === TRANSACTION_STATUSES.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(localSearch);
      onSearchExecute();
    }
  };

  const handleSearchSubmit = () => {
    setSearchQuery(localSearch);
    onSearchExecute();
  };

  const handleRangeChange = (start: string, end: string) => {
    setDateFrom(start);
    setDateTo(end);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full font-body">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0 w-full">
        {/* Status Dropdown */}
        <div className="w-full sm:w-52 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex w-full items-center justify-between gap-1.5 rounded-sm border border-brand-black/15 bg-canvas-pure py-2 pr-4 pl-5 text-xs h-12 transition-colors outline-none select-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 text-brand-black cursor-pointer">
                  <span className="flex-1 text-left min-w-0 pr-1 truncate">
                    {statusFilter.length === 0
                      ? "Jenis Transaksi"
                      : statusFilter.length === TRANSACTION_STATUSES.length
                        ? "Semua Transaksi"
                        : TRANSACTION_STATUSES.filter((s) => statusFilter.includes(s.value))
                            .map((s) => s.label)
                            .join(", ")}
                  </span>
                  <ChevronDown className="size-4 text-muted-moss shrink-0" />
                </button>
              }
            />
            <DropdownMenuContent className="bg-canvas-pure w-52">
              <DropdownMenuCheckboxItem
                checked={isAllStatusesSelected}
                onCheckedChange={() => {
                  if (isAllStatusesSelected) {
                    setStatusFilter([]);
                  } else {
                    setStatusFilter(TRANSACTION_STATUSES.map((s) => s.value));
                  }
                }}
              >
                Pilih Semua
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator className="bg-line-trace/40 my-1" />
              {TRANSACTION_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={statusFilter.includes(status.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, status.value]);
                    } else {
                      setStatusFilter(
                        statusFilter.filter((val) => val !== status.value)
                      );
                    }
                  }}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Picker */}
        <div className="shrink-0 w-full sm:w-auto">
          <DateRangePicker
            startDate={dateFrom}
            endDate={dateTo}
            onRangeChange={handleRangeChange}
          />
        </div>

        {/* Search Input and Execution Button */}
        <div className="flex items-center gap-1.5 w-full">
          <Input
            className="bg-canvas-pure"
            placeholder="Cari..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            size="default"
          />
          <Button
            variant="solid-white"
            size="icon"
            onClick={handleSearchSubmit}
            title="Cari pesanan"
            aria-label="Cari pesanan"
          >
            <Search className="size-4 text-muted-moss" />
          </Button>
        </div>
      </div>
    </div>
  );
}
