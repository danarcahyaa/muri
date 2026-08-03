"use client";

import { useState, useEffect, useRef, type ReactElement } from "react";
import { Search, Loader2, Compass, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export interface AddressJSONB {
  formatted_address: string;
  latitude: number;
  longitude: number;
  address_detail: string;
}

export interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    subdistrict?: string;
    suburb?: string;
    city_district?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export interface LocationPickerProps {
  value: AddressJSONB | null;
  onChange: (locationData: AddressJSONB) => void;
  label?: string;
  detailLabel?: string;
  placeholder?: string;
  detailPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Formats nominatim address into compact string: Wilayah/Kecamatan/Kabupaten/Kota, Provinsi
 * Example: "Denpasar Timur, Bali" or "Kuta, Badung, Bali"
 */
export function extractFormattedAddress(
  rawDisplayName: string,
  addressObj?: NominatimSearchResult["address"]
): string {
  if (addressObj) {
    const district =
      addressObj.subdistrict ||
      addressObj.suburb ||
      addressObj.city_district ||
      addressObj.town;
    const city = addressObj.city || addressObj.county;
    const state = addressObj.state;

    const parts: string[] = [];
    if (district) parts.push(district);
    if (city && city !== district) parts.push(city);
    if (state) parts.push(state);

    if (parts.length >= 2) {
      return parts.join(", ");
    }
  }

  // Fallback: split display_name commas and pick first 2-3 significant parts
  const parts = rawDisplayName.split(",").map((s) => s.trim());
  if (parts.length <= 2) return rawDisplayName;
  return parts.slice(0, 3).join(", ");
}

export function LocationPicker({
  value,
  onChange,
  label = "Cari Alamat Penjemputan / Pengiriman",
  detailLabel = "Detail Alamat Lengkap & Catatan",
  placeholder = "Ketik wilayah/kota (misal: Denpasar Timur)...",
  detailPlaceholder = "Jl. Industry No. 45, Gudang B2, Samping Dermaga Logistik, Kontak PJ: Pak Agus (08123456789)...",
  disabled = false,
  required = true,
}: LocationPickerProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  // Current values
  const currentFormattedAddress = value?.formatted_address || "";
  const currentLatitude = value?.latitude ?? 0;
  const currentLongitude = value?.longitude ?? 0;
  const currentDetail = value?.address_detail || "";

  // Debounced search logic (400ms)
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      setIsSearching(false);
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&addressdetails=1&countrycodes=id&limit=5`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "id,en",
          },
        });
        if (res.ok) {
          const data = (await res.json()) as NominatimSearchResult[];
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch {
        // Ignore network errors silently for debouncer
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to hide search suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle picking a search result
  const handleSelectSearchResult = (result: NominatimSearchResult) => {
    isSelectingRef.current = true;
    const formatted = extractFormattedAddress(result.display_name, result.address);
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    const updated: AddressJSONB = {
      formatted_address: formatted,
      latitude: lat,
      longitude: lon,
      address_detail: currentDetail,
    };

    onChange(updated);
    setSearchResults([]);
    setShowDropdown(false);
    setSearchQuery(formatted);
  };

  // Handle GPS button click
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Fitur Geolocation tidak didukung oleh peramban Anda.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
          const res = await fetch(url, {
            headers: {
              "Accept-Language": "id,en",
            },
          });
          if (res.ok) {
            const data = (await res.json()) as NominatimSearchResult;
            const formatted = extractFormattedAddress(
              data.display_name || "Lokasi Saya",
              data.address
            );

            const updated: AddressJSONB = {
              formatted_address: formatted,
              latitude: lat,
              longitude: lon,
              address_detail: currentDetail,
            };
            onChange(updated);
            isSelectingRef.current = true;
            setSearchResults([]);
            setShowDropdown(false);
            setSearchQuery(formatted);
            toast.success("Berhasil mendapatkan lokasi GPS saat ini!");
          } else {
            const updated: AddressJSONB = {
              formatted_address: `Lokasi GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
              latitude: lat,
              longitude: lon,
              address_detail: currentDetail,
            };
            onChange(updated);
          }
        } catch {
          const updated: AddressJSONB = {
            formatted_address: `Lokasi GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            latitude: lat,
            longitude: lon,
            address_detail: currentDetail,
          };
          onChange(updated);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Izin akses lokasi GPS ditolak oleh pengguna.");
        } else {
          toast.error("Gagal mendapatkan lokasi dari GPS peramban.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDetailChange = (text: string) => {
    const updated: AddressJSONB = {
      formatted_address: currentFormattedAddress || "Lokasi Penjemputan / Pengiriman",
      latitude: currentLatitude,
      longitude: currentLongitude,
      address_detail: text,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4 font-body" ref={containerRef}>
      {/* Baris Pertama: Search Bar & Current Location Button */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-brand-black">
          {label} {required && <span className="text-error-rust">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {/* Input Search Sisi Kiri */}
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              disabled={disabled || isLocating}
              className="bg-canvas-pure pr-9 text-xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-moss pointer-events-none">
              {isSearching ? (
                <Loader2 className="size-4 animate-spin text-brand-forest" />
              ) : (
                <Search className="size-4" />
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-line-trace bg-canvas-pure p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
                {searchResults.map((result) => {
                  const formatted = extractFormattedAddress(
                    result.display_name,
                    result.address
                  );
                  return (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => handleSelectSearchResult(result)}
                      className="flex w-full flex-col text-left px-3 py-2 text-xs hover:bg-canvas-warm rounded-md transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-brand-black">
                        {formatted}
                      </span>
                      <span className="text-[11px] text-muted-moss line-clamp-1">
                        {result.display_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sisi Kanan: Tombol Lokasi Saat Ini (GPS) */}
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={disabled || isLocating}
            onClick={handleGetCurrentLocation}
            className="shrink-0 flex items-center gap-1.5 border-brand-black/15 bg-canvas-pure text-brand-black hover:bg-canvas-warm"
            title="Gunakan lokasi GPS saat ini"
          >
            {isLocating ? (
              <Loader2 className="size-4 animate-spin text-brand-forest" />
            ) : (
              <Compass className="size-4 text-brand-forest" />
            )}
          </Button>
        </div>
      </div>


      {/* Input Detail Alamat Lengkap & Catatan */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-brand-black">
          {detailLabel} {required && <span className="text-error-rust">*</span>}
        </label>
        <textarea
          rows={5}
          disabled={disabled}
          placeholder={detailPlaceholder}
          value={currentDetail}
          onChange={(e) => handleDetailChange(e.target.value)}
          className="w-full rounded-md border border-brand-black/15 bg-canvas-pure p-2.5 text-xs text-brand-black placeholder:text-muted-moss/60 focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition disabled:opacity-50"
        />
      </div>
    </div>
  );
}
