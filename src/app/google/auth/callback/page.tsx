"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Spinner } from "@/components/ui/spinner"
import { syncGoogleUser } from "@/services/common/userService"
import { translateSupabaseError } from "@/lib/supabaseError"
import Image from "next/image"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [statusText, setStatusText] = useState("Menghubungkan dengan Google...")
  const [isError, setIsError] = useState(false)
  const [fromPage, setFromPage] = useState<"login" | "register">("login")

  useEffect(() => {
    // Parse query parameter
    const params = new URLSearchParams(window.location.search)
    const fromParam = (params.get("from") === "register" ? "register" : "login") as "login" | "register"
    setFromPage(fromParam)

    const handleAuthCallback = async () => {
      try {
        // Get the session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          router.replace(`/${fromParam}`)
          return
        }

        if (session && session.user) {
          const user = session.user
          
          setStatusText("Memverifikasi profil pengguna...")
          await syncGoogleUser(user)

          setStatusText("Autentikasi berhasil! Mengalihkan...")
          window.location.href = "/"
        } else {
          // If session is not immediately available, listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session && session.user) {
              const user = session.user
              try {
                setStatusText("Memverifikasi profil pengguna...")
                await syncGoogleUser(user)
                subscription.unsubscribe()
                window.location.href = "/"
              } catch (err: any) {
                console.error("Gagal sinkronisasi profil pengguna Google:", err)
                setIsError(true)
                setStatusText(translateSupabaseError(err))
                subscription.unsubscribe()
              }
            }
          })
          
          // Timeout after 10 seconds if no auth state response is received
          const timeout = setTimeout(() => {
            subscription.unsubscribe()
            setIsError(true)
            setStatusText("Sesi masuk kedaluwarsa atau tidak valid. Silakan coba masuk kembali.")
          }, 10000)

          return () => {
            clearTimeout(timeout)
            subscription.unsubscribe()
          }
        }
      } catch (err: any) {
        console.error("Kesalahan saat memproses callback autentikasi:", err)
        setIsError(true)
        setStatusText(translateSupabaseError(err))
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-canvas-warm p-6 selection:bg-brand-lime/30">
      <div className="w-full max-w-md p-8 rounded-lg bg-canvas-pure border border-line-trace text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/logo.svg" alt="MURI Logo" width={52} height={52} className="h-13 w-auto" />
        </div>

        {/* Loading Spinner or Error Icon */}
        <div className="my-8 flex justify-center">
          {isError ? (
            <div className="size-16 rounded-full bg-error-rust/10 flex items-center justify-center text-error-rust">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <Spinner className="size-13 text-brand-emerald" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <h3 className="text-lg font-bold font-display tracking-tight text-brand-black mb-2">
          {isError ? "Autentikasi Gagal" : "Menghubungkan Akun"}
        </h3>
        <p className={`text-sm font-body ${isError ? "text-error-rust" : "text-muted-moss"} leading-relaxed max-w-xs mx-auto`}>
          {statusText}
        </p>

        {isError && (
          <button
            onClick={() => router.push(`/${fromPage}`)}
            className="mt-6 w-full py-2.5 px-4 rounded-full bg-brand-black hover:bg-brand-black/90 text-canvas-pure text-xs font-semibold font-body tracking-wider transition-all cursor-pointer"
          >
            {fromPage === "register" ? "Kembali ke Pendaftaran" : "Kembali ke Halaman Masuk"}
          </button>
        )}
      </div>
    </div>
  )
}
