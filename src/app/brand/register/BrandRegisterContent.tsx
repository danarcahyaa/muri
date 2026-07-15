"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Building2,
  Globe2,
  KeyRound,
  Leaf,
  Link2,
  Mail,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/BackLink";
import { AuthFooterLink } from "@/components/ui/AuthFooterLink";

import { registerBrand } from "@/services/brand-fashion/auth/authService";
import { BrandLink } from "@/types/brandLink";

export default function BrandRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromPath = searchParams.get("from") || "/";

  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [password, setPassword] = useState("");
  const [links, setLinks] = useState<BrandLink[]>([
    {
      label: "",
      url: "",
    },
  ]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (error) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [error]);

  const handleLinkChange = (
    index: number,
    field: keyof BrandLink,
    value: string,
  ) => {
    setLinks((currentLinks) =>
      currentLinks.map((link, currentIndex) =>
        currentIndex === index
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    );
  };

  const handleAddLink = () => {
    setLinks((currentLinks) => [
      ...currentLinks,
      {
        label: "",
        url: "",
      },
    ]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((currentLinks) => {
      if (currentLinks.length <= 1) {
        return currentLinks;
      }

      return currentLinks.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const normalizedBrandName = brandName.trim();
    const normalizedEmail = email.trim();
    const normalizedActiveNumber = activeNumber.trim();

    if (!normalizedBrandName) {
      setError("Nama brand wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!normalizedEmail) {
      setError("Email bisnis wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (!normalizedActiveNumber) {
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

    const hasEmptyLink = links.some(
      (link) => !link.label.trim() || !link.url.trim(),
    );

    if (hasEmptyLink) {
      setError("Harap lengkapi semua label dan URL link pendukung.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerBrand({
        brandName: normalizedBrandName,
        email: normalizedEmail,
        activeNumber: normalizedActiveNumber,
        password,
        socialMediaLinks: links.map((link) => ({
          label: link.label.trim(),
          url: link.url.trim(),
        })),
        shortStory: description.trim() || undefined,
      });

      if (!response.success) {
        setError(response.error || "Gagal melakukan pendaftaran.");
        return;
      }

      toast.success(response.message || "Pendaftaran brand berhasil!");

      setBrandName("");
      setEmail("");
      setActiveNumber("");
      setPassword("");
      setLinks([
        {
          label: "",
          url: "",
        },
      ]);
      setDescription("");

      router.push("/brand/login");
    } catch {
      setError("Terjadi kesalahan. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-pure px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Back link */}
        <div className="flex justify-start">
          <BackLink
            href={fromPath}
            label={searchParams.get("from") ? "Kembali" : "Kembali ke Beranda"}
          />
        </div>

        {/* Main content */}
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Muri Logo"
              width={40}
              height={40}
              priority
              className="size-10 object-contain"
            />

            <span className="font-display text-2xl font-medium tracking-tight text-brand-black">
              Muri
            </span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />

              <span className="text-xs font-bold uppercase tracking-tight">
                Bergabung sebagai Brand
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              <span className="block">Daftarkan</span>

              <span className="block">Brand Anda.</span>
            </h1>

            <p className="mt-7 font-body text-sm leading-relaxed text-muted-moss">
              Jadilah bagian dari ekosistem fesyen sirkular dan ubah sisa
              produksi menjadi karya bernilai bersama Muri.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 rounded-xl border-error-rust/20 bg-error-rust/[0.05]"
            >
              <AlertCircle className="size-4" />

              <AlertDescription className="text-sm leading-relaxed">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Brand name */}
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
                variant="auth"
                size="auth"
                autoComplete="organization"
                placeholder="Masukkan nama brand Anda"
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Building2 strokeWidth={1.7} />}
              />
            </div>

            {/* Email */}
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
                variant="auth"
                size="auth"
                autoComplete="email"
                placeholder="Masukkan email bisnis Anda"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Mail strokeWidth={1.7} />}
              />
            </div>

            {/* Phone */}
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
                variant="auth"
                size="auth"
                autoComplete="tel"
                inputMode="tel"
                placeholder="Contoh: 081234567890"
                value={activeNumber}
                onChange={(event) => setActiveNumber(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Phone strokeWidth={1.7} />}
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
                variant="auth"
                size="auth"
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                endIcon={<KeyRound strokeWidth={1.7} />}
              />
            </div>

            {/* Links */}
            <div className="space-y-4 pt-1">
              <div>
                <p className="text-xs font-bold text-brand-black">
                  Link Media Sosial / Portofolio / Web
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-muted-moss">
                  Tambahkan website atau media sosial utama brand Anda.
                </p>
              </div>

              <div className="space-y-3">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-sm border border-line-trace bg-canvas-warm/30 p-3"
                  >
                    <Input
                      type="text"
                      variant="auth"
                      size="auth"
                      placeholder="Platform, contoh: Instagram"
                      value={link.label}
                      onChange={(event) =>
                        handleLinkChange(index, "label", event.target.value)
                      }
                      required
                      disabled={isLoading}
                      endIcon={<Globe2 strokeWidth={1.7} />}
                    />

                    <div className="flex items-center gap-2">
                      <Input
                        type="url"
                        variant="auth"
                        size="auth"
                        inputMode="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(event) =>
                          handleLinkChange(index, "url", event.target.value)
                        }
                        required
                        disabled={isLoading}
                        endIcon={<Link2 strokeWidth={1.7} />}
                      />

                      {links.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLink(index)}
                          disabled={isLoading}
                          aria-label={`Hapus link ${index + 1}`}
                          title="Hapus link"
                          className="
                            size-12 shrink-0 rounded-sm
                            text-error-rust
                            hover:bg-error-rust/5
                            hover:text-error-rust
                          "
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="auth-outline"
                size="auth"
                onClick={handleAddLink}
                disabled={isLoading}
                className="w-full border-dashed text-muted-moss hover:text-brand-emerald"
              >
                <Plus className="size-4" />
                <span>Tambah Link</span>
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="brand-description"
                className="text-xs font-bold text-brand-black"
              >
                Cerita Brand{" "}
                <span className="font-normal text-muted-moss/70">
                  (Opsional)
                </span>
              </label>

              <Textarea
                id="brand-description"
                placeholder="Ceritakan visi dan perjalanan brand Anda"
                value={description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(event.target.value)
                }
                disabled={isLoading}
                variant="auth"
                size="auth"
                className="min-h-32 resize-y"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="auth-primary"
              size="auth"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Daftar Sekarang
            </Button>
          </form>

          {/* Footer link */}
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
