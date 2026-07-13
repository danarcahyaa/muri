import Image from "next/image"
import { Leaf } from "lucide-react"

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
            <button className="px-5 py-2 text-xs font-semibold rounded-full border border-canvas-pure text-canvas-pure bg-transparent hover:bg-canvas-pure hover:text-brand-forest transition-colors font-body cursor-pointer">
              Masuk
            </button>
            {/* Lime Pill Button */}
            <button className="px-5 py-2 text-xs font-semibold rounded-full bg-brand-lime text-brand-black hover:bg-brand-lime/90 transition-colors flex items-center gap-1 cursor-pointer font-body">
              <span>Mulai Bergabung</span>
              <span className="text-base">→</span>
            </button>
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
              <button className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold rounded-full bg-brand-lime text-brand-black hover:bg-brand-lime/90 transition-all cursor-pointer font-body">
                Mulai Sekarang
              </button>
              <button className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold rounded-full bg-transparent text-canvas-pure border border-canvas-pure/30 hover:bg-canvas-pure/10 transition-all cursor-pointer font-body">
                Pelajari Fitur
              </button>
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
