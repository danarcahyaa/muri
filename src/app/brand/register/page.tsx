"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { registerBrand } from "@/services/brand-fashion/auth/authService";
import { BrandLink } from "@/types/brandLink";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BrandRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/";

  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [password, setPassword] = useState("");
  const [links, setLinks] = useState<BrandLink[]>([{ label: "", url: "" }]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  const handleLinkChange = (
    index: number,
    field: keyof BrandLink,
    value: string
  ) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  const handleAddLink = () => {
    setLinks([...links, { label: "", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic Validation
    if (!brandName.trim()) {
      setError("Nama brand wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email bisnis wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!activeNumber.trim()) {
      setError("Nomor aktif wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Kata sandi wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi harus minimal 8 karakter.");
      setIsLoading(false);
      return;
    }

    // Validate social/portfolio links
    const hasEmptyLink = links.some(
      (link) => !link.label.trim() || !link.url.trim()
    );
    if (hasEmptyLink) {
      setError("Harap lengkapi semua label dan URL link pendukung.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerBrand({
        brandName: brandName.trim(),
        email: email.trim(),
        activeNumber: activeNumber.trim(),
        password: password,
        socialMediaLinks: links,
        shortStory: description.trim() || undefined,
      });

      if (!response.success) {
        setError(response.error || "Gagal melakukan pendaftaran.");
        return;
      }

      toast.success(
        response.message || "Pendaftaran brand berhasil!"
      );

      // Reset form fields
      setBrandName("");
      setEmail("");
      setActiveNumber("");
      setPassword("");
      setLinks([{ label: "", url: "" }]);
      setDescription("");

      // Redirect to brand login page
      router.push("/brand/login");
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Back Link */}
        <div className="flex justify-start">
          <BackLink
            href={fromPath}
            label={searchParams.get("from") ? "Kembali" : "Kembali ke Beranda"}
          />
        </div>

        {/* Form Container (No Card) */}
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/logo.svg"
              alt="Muri Logo"
              width={48}
              height={48}
              priority
              className="mb-4 size-12 object-contain"
            />
            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-black sm:text-3xl">
              Daftarkan Brand Anda
            </h1>
            <p className="mt-2 font-body text-sm text-muted-moss/90 leading-relaxed">
              Jadilah pelopor fesyen sirkular dan ubah sisa produksi menjadi
              mahakarya bersama ekosistem MURI.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-sm leading-relaxed">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Brand */}
            <div className="space-y-2">
              <label
                htmlFor="brand-name"
                className="text-xs font-bold text-brand-black"
              >
                Nama Brand
              </label>
              <Input
                id="brand-name"
                type="text"
                placeholder="Masukkan nama brand..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Bisnis */}
            <div className="space-y-2">
              <label
                htmlFor="brand-email"
                className="text-xs font-bold text-brand-black"
              >
                Email Bisnis/Brand
              </label>
              <Input
                id="brand-email"
                type="email"
                placeholder="Masukkan email brand..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Nomor Aktif */}
            <div className="space-y-2">
              <label
                htmlFor="brand-active-number"
                className="text-xs font-bold text-brand-black"
              >
                Nomor Aktif
              </label>
              <Input
                id="brand-active-number"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={activeNumber}
                onChange={(e) => setActiveNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="brand-password"
                className="text-xs font-bold text-brand-black"
              >
                Kata Sandi
              </label>
              <Input
                id="brand-password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-black">
                  Link Media Sosial / Portofolio / Web
                </span>
              </div>

              <div className="space-y-3">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-lg border border-line-trace/40 p-3 sm:flex-row sm:items-center sm:p-0 sm:border-0"
                  >
                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Platform (contoh: Instagram)"
                        value={link.label}
                        onChange={(e) =>
                          handleLinkChange(index, "label", e.target.value)
                        }
                        required
                        disabled={isLoading}
                      />
                      <Input
                        type="url"
                        placeholder="URL (https://...)"
                        value={link.url}
                        onChange={(e) =>
                          handleLinkChange(index, "url", e.target.value)
                        }
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {links.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(index)}
                        disabled={isLoading}
                        className="self-end text-error-rust hover:bg-error-rust/5 hover:text-error-rust sm:self-auto"
                        title="Hapus Link"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLink}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-1.5 border-dashed border-line-trace text-muted-moss hover:border-brand-emerald hover:text-brand-emerald"
              >
                <Plus className="size-4" />
                <span>Tambah Link</span>
              </Button>
            </div>

            {/* Brand Description  */}
            <div className="space-y-2">
              <label
                htmlFor="brand-description"
                className="text-xs font-bold text-brand-black"
              >
                Cerita Brand{" "}
                <span className="font-normal text-muted-moss/70">(Opsional)</span>
              </label>
              <Textarea
                id="brand-description"
                placeholder="Ceritakan visi brand Anda..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                disabled={isLoading}
                className="min-h-[90px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                variant={"solid-black"}
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2"
              >
                <span>Daftar</span>
              </Button>
            </div>
          </form>

          {/* Footer Secondary Link */}
          <AuthFooterLink
            text="Sudah memiliki akun brand?"
            linkText="Masuk di sini"
            href="/brand/login"
          />
        </div>
      </div>
    </div>
  );
}
