import Image from "next/image"
import { Leaf, Mail, Search, Lock, User, Globe } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"


export default function Home() {
  return (
    <div className="min-h-screen bg-canvas-warm text-brand-black flex flex-col justify-between selection:bg-brand-lime/30 selection:text-brand-black">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-brand-forest/90 backdrop-blur-md border-b border-brand-emerald/30 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-lime/10 rounded-lg text-brand-lime">
              <Leaf className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-canvas-pure font-display">
              MURI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-canvas-pure/80 font-body">
            <a href="#" className="hover:text-brand-lime transition-colors">Beranda</a>
            <a href="#" className="hover:text-brand-lime transition-colors">Fitur</a>
            <a href="#" className="hover:text-brand-lime transition-colors">Tentang Kami</a>
            <a href="#" className="hover:text-brand-lime transition-colors">Kontak</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Outline Button */}
            <Button variant="solid-lime" size="sm">
              Masuk
            </Button>
            {/* Lime Pill Button */}
            <Button variant="solid-lime" size="sm" >
              Mulai Bergabung
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section (Dark Forest Canvas) */}
        <section className="bg-brand-forest text-canvas-pure pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden border-b border-brand-emerald">
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* Eco Sub-Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-semibold mb-6 font-body">
              <Leaf className="size-3.5 fill-current" />
              <span>SOLUSI SIRKULAR BERBASIS AI</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.05] mb-6 font-display text-canvas-pure">
              Jangan Biarkan Limbah Tekstil Menjadi Akhir Cerita
            </h1>

            {/* Sub-headline / Copy */}
            <p className="text-base sm:text-lg text-muted-moss max-w-2xl mx-auto mb-10 leading-relaxed font-body">
              MURI menghubungkan hulu ke hilir secara digital, mendaur ulang sisa bahan garmen menjadi serat kain baru yang 100% terlacak.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="solid-lime" size="lg" className="w-full sm:w-auto font-body">
                Mulai Sekarang
              </Button>
              <Button variant="outline-white" size="lg" className="w-full sm:w-auto font-body">
                Pelajari Fitur
              </Button>
            </div>
          </div>
        </section>

        {/* Reusable Input Showcase Section (Warm Canvas) */}
        <section className="bg-canvas-warm py-20 border-b border-line-trace">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-wider text-brand-emerald uppercase font-body">
                Komponen Interaktif
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-black mt-2 mb-4 font-display">
                Demo Reusable Input Component
              </h2>
              <p className="text-sm text-muted-moss max-w-xl mx-auto font-body">
                Komponen Input kustom berbasis Shadcn dan Base UI yang fleksibel, mendukung penggunaan ikon di sisi kiri, kanan, keduanya, atau tanpa ikon.
              </p>
            </div>

            <div className="bg-canvas-pure rounded-2xl border border-line-trace p-8 shadow-sm space-y-8">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Tanpa Icon */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-black/80 font-body">
                    Input Standar (Tanpa Icon)
                  </label>
                  <Input type="text" placeholder="Masukkan nama lengkap Anda..." />
                </div>

                {/* 2. Start Icon */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-black/80 font-body">
                    Input dengan Start Icon
                  </label>
                  <Input 
                    type="email" 
                    placeholder="nama@perusahaan.com" 
                    startIcon={<Mail className="text-muted-moss" />} 
                  />
                </div>

                {/* 3. End Icon */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-black/80 font-body">
                    Input dengan End Icon
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Cari kode pelacakan limbah..." 
                    endIcon={<Search className="text-muted-moss" />} 
                  />
                </div>

                {/* 4. Start & End Icon */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-black/80 font-body">
                    Input dengan Kedua Icon
                  </label>
                  <Input 
                    type="password" 
                    placeholder="Kata sandi akun MURI..." 
                    startIcon={<Lock className="text-muted-moss" />}
                    endIcon={<Globe className="text-muted-moss" />} 
                  />
                </div>
              </div>

              {/* Newsletter Subscription Demo */}
              <div className="border-t border-line-trace pt-8">
                <h3 className="text-lg font-semibold text-brand-black mb-3 font-display">
                  Contoh Penggunaan: Newsletter Sirkular
                </h3>
                <p className="text-xs text-muted-moss mb-4 font-body">
                  Dapatkan pembaruan logistik keberlanjutan dan pelacakan tekstil langsung di email Anda.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input 
                      type="email" 
                      size="lg"
                      placeholder="Masukkan alamat email Anda" 
                      startIcon={<Mail className="text-brand-emerald" />} 
                      className="bg-canvas-warm/50 border-line-trace focus-visible:ring-brand-emerald/30 focus-visible:border-brand-emerald"
                    />
                  </div>
                  <Button variant="solid-lime" size="lg">
                    Langganan
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Reusable Button Showcase Section (Warm Canvas) */}
        <section className="bg-canvas-warm py-20 border-b border-line-trace">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-wider text-brand-emerald uppercase font-body">
                Komponen Interaktif
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-black mt-2 mb-4 font-display">
                Demo Reusable Button Component
              </h2>
              <p className="text-sm text-muted-moss max-w-xl mx-auto font-body">
                Komponen Button dengan 4 varian utama sesuai identitas visual keberlanjutan MURI.
              </p>
            </div>

            <div className="space-y-8">
              {/* Light Background Showcase */}
              <div className="bg-canvas-pure rounded-2xl border border-line-trace p-8 shadow-sm">
                <h3 className="text-md font-semibold text-brand-black mb-4 font-display">
                  Tampilan pada Latar Terang
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Variant 1: solid-black */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-moss font-semibold font-body">1. Solid Black</span>
                    <Button variant="solid-black">
                      Mulai Sekarang
                    </Button>
                  </div>

                  {/* Variant 2: outline-black */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-moss font-semibold font-body">2. Outline Black</span>
                    <Button variant="outline-black">
                      Pelajari Fitur
                    </Button>
                  </div>

                  {/* Variant 4: solid-lime */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-moss font-semibold font-body">4. Solid Lime</span>
                    <Button variant="solid-lime">
                      Gabung Kemitraan
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dark Background Showcase */}
              <div className="bg-brand-forest rounded-2xl border border-brand-emerald p-8 shadow-sm text-canvas-pure">
                <h3 className="text-md font-semibold text-canvas-pure mb-4 font-display">
                  Tampilan pada Latar Gelap (Forest Canvas)
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Variant 3: outline-white */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-moss font-semibold font-body">3. Outline White</span>
                    <Button variant="outline-white">
                      Hubungi Hub
                    </Button>
                  </div>

                  {/* Showcase other variants on dark for completeness */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-moss font-semibold font-body">Solid Lime (On Dark)</span>
                    <Button variant="solid-lime">
                      Mulai Pelacakan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line-trace bg-canvas-pure py-8 text-center text-xs text-brand-forest/60 font-body">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} MURI. Hak Cipta Dilindungi.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-emerald">Github</a>
            <a href="#" className="hover:text-brand-emerald">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
