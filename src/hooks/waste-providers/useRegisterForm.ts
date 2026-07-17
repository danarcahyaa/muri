"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerWasteProvider } from "@/services/waste-providers/authService";

export interface RegisterFormState {
  companyName: string;
  email: string;
  activeNumber: string;
  password: string;
  selectedProvince: string;
  selectedRegency: string;
  error: string | null;
  isLoading: boolean;
}

export interface RegisterFormActions {
  setCompanyName: (value: string) => void;
  setEmail: (value: string) => void;
  setActiveNumber: (value: string) => void;
  setPassword: (value: string) => void;
  setSelectedProvince: (value: string) => void;
  setSelectedRegency: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export interface UseRegisterFormReturn extends RegisterFormState, RegisterFormActions {}

export function useRegisterForm(nextPath: string): UseRegisterFormReturn {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [activeNumber, setActiveNumber] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const normalizedCompanyName = companyName.trim();
    const normalizedEmail = email.trim();
    const normalizedActiveNumber = activeNumber.trim();

    // Field-by-field validation in user-facing order
    if (!normalizedCompanyName) {
      setError("Nama pabrik/garmen wajib diisi.");
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

    if (!selectedProvince) {
      setError("Provinsi wajib dipilih.");
      setIsLoading(false);
      return;
    }

    if (!selectedRegency) {
      setError("Kabupaten wajib dipilih.");
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

    try {
      const response = await registerWasteProvider({
        companyName: normalizedCompanyName,
        email: normalizedEmail,
        activeNumber: normalizedActiveNumber,
        password,
        address: {
          province: selectedProvince,
          regency: selectedRegency,
        },
      });

      if (!response.success) {
        setError(response.error || "Gagal melakukan pendaftaran.");
        return;
      }

      toast.success(response.message || "Pendaftaran waste provider berhasil!");

      // Reset form after successful registration
      setCompanyName("");
      setEmail("");
      setActiveNumber("");
      setPassword("");
      setSelectedProvince("");
      setSelectedRegency("");

      const loginParams = new URLSearchParams({
        from: "/waste-providers/register",
        next: nextPath,
      });

      router.push(`/waste-providers/login?${loginParams.toString()}`);
    } catch {
      setError("Terjadi kesalahan. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    companyName,
    email,
    activeNumber,
    password,
    selectedProvince,
    selectedRegency,
    error,
    isLoading,
    setCompanyName,
    setEmail,
    setActiveNumber,
    setPassword,
    setSelectedProvince,
    setSelectedRegency,
    handleSubmit,
  };
}
