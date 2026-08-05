import { BrandProfileSection } from "@/components/brand/dashboard/BrandProfileSection";

export const metadata = {
  title: "Profil Brand | Dashboard MURI",
  description: "Kelola profil, lokasi workshop, dan informasi kontak brand Anda di MURI.",
};

export default function BrandProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
          Pengaturan Profil Brand
        </h1>
        <p className="mt-2 text-sm text-muted-moss">
          Perbarui data brand, kontak WhatsApp, lokasi studio/gudang, dan tautan sosial media Anda.
        </p>
      </div>

      <BrandProfileSection />
    </div>
  );
}
