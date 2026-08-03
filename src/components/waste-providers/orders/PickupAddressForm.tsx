"use client";

import type { ReactElement } from "react";
import { LocationPicker, type AddressJSONB } from "@/components/shared/LocationPicker";
import type { PickupAddress } from "@/types/wasteProvider";

interface PickupAddressFormProps {
  value: PickupAddress | null;
  onChange: (address: PickupAddress) => void;
  disabled?: boolean;
}

export function PickupAddressForm({
  value,
  onChange,
  disabled = false,
}: PickupAddressFormProps): ReactElement {
  return (
    <LocationPicker
      value={value}
      onChange={(data: AddressJSONB) => onChange(data as PickupAddress)}
      label="Cari Alamat Penjemputan"
      detailLabel="Detail Alamat Lengkap & Catatan Penjemputan"
      placeholder="Ketik wilayah/kota penjemputan (misal: Denpasar Timur)..."
      detailPlaceholder="Jl. Industry No. 45, Gudang B2, Samping Dermaga Logistik, Kontak PJ: Pak Agus (08123456789)..."
      disabled={disabled}
      required={true}
    />
  );
}
