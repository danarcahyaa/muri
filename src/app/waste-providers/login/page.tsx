import { Suspense } from "react";

import WasteProviderLoginContent from "./WasteProviderLoginContent";

export default function WasteProviderLoginPage() {
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
                Penyedia Limbah
              </span>
            </div>

            <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-brand-black">
              <span className="block">Masuk ke Akun</span>
              <span className="block">Mitra Anda.</span>
            </h1>

            <p className="mt-7 font-body text-sm leading-relaxed text-muted-moss">
              Kelola sisa tekstil, pantau dampak lingkungan, dan berkolaborasi
              dalam ekosistem sirkular bersama Muri.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-2xl">
              <AlertCircle className="size-4" strokeWidth={2.1} />

              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="provider-email"
                className="text-xs font-bold text-brand-black"
              >
                Email
              </label>

              <Input
                id="provider-email"
                type="email"
                variant="auth"
                size="auth"
                autoComplete="email"
                placeholder="Masukkan email pabrik/garmen Anda"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<Mail strokeWidth={1.7} />}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="provider-password"
                className="text-xs font-bold text-brand-black"
              >
                Kata Sandi
              </label>

              <Input
                id="provider-password"
                type="password"
                variant="auth"
                size="auth"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi Anda"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isLoading}
                endIcon={<KeyRound strokeWidth={1.7} />}
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="auth-primary"
              size="auth"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Masuk Sekarang
            </Button>
          </form>

function WasteProviderLoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-pure">
      <p className="text-sm text-muted-moss">Memuat halaman login...</p>
    </div>
  );
}