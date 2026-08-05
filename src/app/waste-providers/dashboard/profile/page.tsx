import { WasteProviderProfileSection } from "@/components/waste-providers/dashboard/WasteProviderProfileSection";

export const metadata = {
  title: "Profil Provider | Dashboard MURI",
  description: "Kelola profil usaha, kontak WhatsApp, dan alamat gudang penjemputan limbah Anda di MURI.",
};

export default function WasteProviderProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
          Pengaturan Profil Penyedia Limbah
        </h1>
        <p className="mt-2 text-sm text-muted-moss">
          Perbarui data perusahaan, nomor kontak penjemputan, dan alamat gudang limbah Anda.
        </p>
      </div>

      <WasteProviderProfileSection />
    </div>
  );
}
