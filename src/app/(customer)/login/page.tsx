"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Leaf, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInWithEmail, signInWithGoogle } from "@/services/customer/auth/authService"
import { translateSupabaseError } from "@/lib/supabaseError"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await signInWithEmail({ email, password })
      if (!response.success) {
        setError(response.error || "Gagal masuk ke akun.")
      } else {
        toast.success(response.message || "Berhasil masuk!")
        
        setTimeout(() => {
          router.replace('/')
        }, 500)
      }
    } catch (err: any) {
      setError(translateSupabaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithGoogle("login")
    } catch (err: any) {
      setError(translateSupabaseError(err))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-canvas-warm">
      {/* Left Column Form & Auth */}
      <div className="flex flex-col justify-between p-8 md:p-12 lg:p-16 min-h-screen bg-canvas-pure">
        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          {/* Header with Logo */}
          <div className="flex justify-start items-center mb-8">
            <Image src="/logo.svg" alt="MURI Logo" width={32} height={32} className="h-8 w-auto" />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-black mb-1 font-display leading-tight">
              Masuk ke Akun Muri Anda
            </h1>
            <span className="text-sm text-muted-moss font-body">
              Mulai coba ekosistem sirkulasi Muri
            </span>
          </div>

          {/* Alert Error */}
          {error && (
            <Alert variant="destructive" className="mb-6 font-body">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-black/80 font-body">Email</label>
              <Input 
                type="email" 
                placeholder="Masukkan email Anda..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-black/80 font-body">Password</label>
              <Input 
                type="password" 
                placeholder="Masukkan kata sandi Anda..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>

            <Button 
              variant="solid-black" 
              type="submit" 
              className={"w-full"}
              loading={isLoading}
            >
              Masuk
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line-trace"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-canvas-pure px-2 text-muted-moss">Atau</span>
            </div>
          </div>

          {/* Google Login */}
          <Button 
            variant="outline"  
            type="button"
            className={"w-full"}
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="size-4 mr-2 inline animate-none" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Lanjut dengan Google</span>
          </Button>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-moss mt-6 font-body">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-brand-emerald hover:text-brand-forest hover:underline transition-colors">
              Daftar
            </Link>
          </p>
        </div>
      </div>

      {/* Right Col Visual & Copywriting */}
      <div className="relative hidden md:block overflow-hidden min-h-screen bg-brand-forest">
        <Image 
          src="/tree-bg.png" 
          alt="Tree Background" 
          fill 
          priority
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/90 via-brand-forest/40 to-brand-forest/60 flex flex-col justify-center p-12 lg:p-16 text-canvas-pure">
          <div className="max-w-md">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-semibold mb-6 font-body">
              <Leaf className="size-3.5 fill-current text-brand-lime" />
              <span className="text-brand-lime tracking-wider">Kembali ke alam</span>
            </div>
            
            {/* Headline Utama */}
            <h2 className="text-3xl lg:text-5xl font-bold font-display tracking-tight leading-tight mb-4 text-canvas-pure">
              Setiap Langkah Kecilmu, Menyelamatkan Bumi Kita.
            </h2>
            
            {/* Sub-headline body */}
            <p className="text-sm lg:text-base text-canvas-pure/90 font-body leading-relaxed">
              Masuk kembali ke ekosistem Muri dan lanjutkan kontribusimu dalam menekan emisi karbon, menghemat air bersih, serta memberi napas baru bagi material yang terbuang.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
