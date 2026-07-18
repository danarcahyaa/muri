import { useState, useEffect, type ReactElement } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Search } from "lucide-react";

interface BatchToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  onSearch: () => void;
}

export function WasteBatchToolbar({
  searchQuery,
  setSearchQuery,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onSearch,
}: BatchToolbarProps): ReactElement {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    if (localSearch !== "") return;
    const handler = setTimeout(() => {
      if (searchQuery !== "") {
        setSearchQuery("");
        onSearch();
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(localSearch);
      onSearch();
    }
  };

  const handleSearchSubmit = () => {
    setSearchQuery(localSearch);
    onSearch();
  };

  const handleRangeChange = (start: string, end: string) => {
    setDateFrom(start);
    setDateTo(end);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full font-body">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0 w-full">
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
            placeholder="Cari batch code, nama kain, atau kota..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            size="default"
          />
          <Button
            variant="solid-white"
            size="icon"
            onClick={handleSearchSubmit}
            title="Cari jejak limbah"
            aria-label="Cari jejak limbah"
          >
            <Search className="size-4 text-muted-moss" />
          </Button>
        </div>
      </div>
    </div>
  );
}
