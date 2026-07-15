import { useState, useEffect, useRef, type ReactElement } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";

interface ToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string[];
  setSelectedCategory: (c: string[]) => void;
  selectedStatus: string[];
  setSelectedStatus: (s: string[]) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  onAddClick: () => void;
}

const CATEGORIES = [
  { value: "all", label: "Semua Jenis Kain" },
  { value: "Katun", label: "Katun" },
  { value: "Denim", label: "Denim" },
  { value: "Linen", label: "Linen" },
  { value: "Rayon", label: "Rayon" },
  { value: "Polyester", label: "Polyester" },
  { value: "Sutra", label: "Sutra" },
  { value: "Sintetis", label: "Sintetis" },
  { value: "Campuran", label: "Campuran" },
];

const STATUSES = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "sold_out", label: "Terjual" },
  { value: "inactive", label: "Diarsipkan" },
];

// No static SORT_OPTIONS, defined inline for grouped components

export function WasteTableToolbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  onAddClick,
}: ToolbarProps): ReactElement {
  const isAllCategoriesSelected = selectedCategory.length === CATEGORIES.slice(1).length;
  const isAllStatusesSelected = selectedStatus.length === STATUSES.slice(1).length;

  const [searchValue, setSearchValue] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const renderTriggerLabel = () => {
    if (sortBy === "created_at_desc") return "Terbaru";
    if (sortBy === "created_at_asc") return "Terlama";
    if (sortBy === "weight_kg_desc") {
      return (
        <div className="flex items-center justify-between w-full gap-2 pr-1.5">
          <span>Berat</span>
          <ArrowUp className="size-3.5 text-muted-moss" />
        </div>
      );
    }
    if (sortBy === "weight_kg_asc") {
      return (
        <div className="flex items-center justify-between w-full gap-2 pr-1.5">
          <span>Berat</span>
          <ArrowDown className="size-3.5 text-muted-moss" />
        </div>
      );
    }
    if (sortBy === "price_per_kg_desc") {
      return (
        <div className="flex items-center justify-between w-full gap-2 pr-1.5">
          <span>Harga</span>
          <ArrowUp className="size-3.5 text-muted-moss" />
        </div>
      );
    }
    if (sortBy === "price_per_kg_asc") {
      return (
        <div className="flex items-center justify-between w-full gap-2 pr-1.5">
          <span>Harga</span>
          <ArrowDown className="size-3.5 text-muted-moss" />
        </div>
      );
    }
    return "Urutkan";
  };

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      setSearchQuery(searchValue);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0">
        {/* Dropdown Kategori */}
        <div className="w-full sm:w-40">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="flex w-full items-center justify-between gap-1.5 rounded-sm border border-input bg-canvas-pure py-2 pr-2.5 pl-3.5 text-sm h-10 transition-colors outline-none select-none focus:border-ring focus:ring-3 focus:ring-ring/50 text-brand-black cursor-pointer"
                >
                  <div className="flex-1 text-left min-w-0 pr-1 truncate">
                    {selectedCategory.length === 0
                      ? "Jenis kain"
                      : selectedCategory.length === CATEGORIES.slice(1).length
                        ? "Semua Jenis"
                        : selectedCategory.join(", ")}
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </button>
              }
            />
            <DropdownMenuContent className="bg-canvas-pure w-48">
              <DropdownMenuCheckboxItem
                checked={isAllCategoriesSelected}
                onCheckedChange={() => {
                  if (isAllCategoriesSelected) {
                    setSelectedCategory([]);
                  } else {
                    setSelectedCategory(CATEGORIES.slice(1).map((c) => c.value));
                  }
                }}
              >
                Pilih Semua
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator className="bg-line-trace/40 my-1" />
              {CATEGORIES.slice(1).map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat.value}
                  checked={selectedCategory.includes(cat.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategory([...selectedCategory, cat.value]);
                    } else {
                      setSelectedCategory(selectedCategory.filter((val) => val !== cat.value));
                    }
                  }}
                >
                  {cat.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dropdown Status */}
        <div className="w-full sm:w-36">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="flex w-full items-center justify-between gap-1.5 rounded-sm border border-input bg-canvas-pure py-2 pr-2.5 pl-3.5 text-sm h-10 transition-colors outline-none select-none focus:border-ring focus:ring-3 focus:ring-ring/50 text-brand-black cursor-pointer"
                >
                  <div className="flex-1 text-left min-w-0 pr-1 truncate">
                    {selectedStatus.length === 0
                      ? "Status"
                      : selectedStatus.length === STATUSES.slice(1).length
                        ? "Semua Status"
                        : selectedStatus
                            .map((val) => STATUSES.find((s) => s.value === val)?.label)
                            .filter(Boolean)
                            .join(", ")}
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </button>
              }
            />
            <DropdownMenuContent className="bg-canvas-pure w-44">
              <DropdownMenuCheckboxItem
                checked={isAllStatusesSelected}
                onCheckedChange={() => {
                  if (isAllStatusesSelected) {
                    setSelectedStatus([]);
                  } else {
                    setSelectedStatus(STATUSES.slice(1).map((s) => s.value));
                  }
                }}
              >
                Pilih Semua
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator className="bg-line-trace/40 my-1" />
              {STATUSES.slice(1).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={selectedStatus.includes(status.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedStatus([...selectedStatus, status.value]);
                    } else {
                      setSelectedStatus(selectedStatus.filter((val) => val !== status.value));
                    }
                  }}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dropdown Sorting - shadcn Dropdown Menu */}
        <div className="w-full sm:w-40">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="flex w-full items-center justify-between gap-1.5 rounded-sm border border-input bg-canvas-pure py-2 pr-2.5 pl-3.5 text-sm h-10 transition-colors outline-none select-none focus:border-ring focus:ring-3 focus:ring-ring/50 text-brand-black cursor-pointer"
                >
                  <div className="flex-1 text-left min-w-0 pr-1">
                    {renderTriggerLabel()}
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </button>
              }
            />
            <DropdownMenuContent className="w-40">
              {/* Terbaru */}
              <DropdownMenuItem
                onClick={() => setSortBy("created_at_desc")}
                className={`w-full text-left px-2.5 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${sortBy === "created_at_desc" ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
              >
                Terbaru
              </DropdownMenuItem>
              {/* Terlama */}
              <DropdownMenuItem
                onClick={() => setSortBy("created_at_asc")}
                className={`w-full text-left px-2.5 py-1.5 text-sm transition-colors cursor-pointer ${sortBy === "created_at_asc" ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
              >
                Terlama
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-line-trace/40 my-1" />

              {/* Berat submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${sortBy.startsWith("weight_kg") ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
                >
                  <span>Berat</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-canvas-pure w-36">
                  <DropdownMenuItem
                    onClick={() => setSortBy("weight_kg_desc")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${sortBy === "weight_kg_desc" ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
                  >
                    <span>Terbesar</span>
                    <ArrowUp className="size-3.5 text-muted-moss" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy("weight_kg_asc")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${sortBy === "weight_kg_asc" ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
                  >
                    <span>Terkecil</span>
                    <ArrowDown className="size-3.5 text-muted-moss" />
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Harga submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${sortBy.startsWith("price_per_kg") ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
                >
                  <span>Harga</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-canvas-pure w-36">
                  <DropdownMenuItem
                    onClick={() => setSortBy("price_per_kg_desc")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${sortBy === "price_per_kg_desc" ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
                  >
                    <span>Tertinggi</span>
                    <ArrowUp className="size-3.5 text-muted-moss" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy("price_per_kg_asc")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${sortBy === "price_per_kg_asc" ? "bg-canvas-warm/50 text-brand-black font-semibold" : "text-muted-moss"}`}
                  >
                    <span>Terendah</span>
                    <ArrowDown className="size-3.5 text-muted-moss" />
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Bar Group */}
        <div className="flex items-center gap-1.5 w-full sm:w-96">
          <Input
            className="bg-canvas-pure"
            placeholder="Cari nama kain..."
            value={searchValue}
            onChange={(e) => {
              const val = e.target.value;
              setSearchValue(val);
              
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              
              if (val === "") {
                debounceRef.current = setTimeout(() => {
                  setSearchQuery("");
                }, 300);
              }
            }}
            onKeyDown={handleKeyDown}
            size="default"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              setSearchQuery(searchValue);
            }}
            title="Cari"
          >
            <Search className="size-4 text-muted-moss" />
          </Button>
        </div>
      </div>

      {/* Button Tambah Limbah */}
      <div className="shrink-0">
        <Button onClick={onAddClick} variant={"solid-black"}>
          <Plus className="size-4" />
          Tambah Limbah
        </Button>
      </div>
    </div>
  );
}
