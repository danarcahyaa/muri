import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function FooterNewsletter() {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-white">
        Ikuti Perkembangan
      </h3>

      <p className="mt-7 max-w-xs text-sm leading-relaxed text-white/55">
        Ide bulanan, pembaruan produk, dan cerita dari komunitas sirkular.
      </p>

      <form className="mt-7" action="#">
        <label htmlFor="footer-email" className="sr-only">
          Alamat email
        </label>

        <div className="flex items-center border-b border-white/20 transition-colors focus-within:border-brand-lime">
          <Input
            id="footer-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Alamat Email"
            variant="plain"
            size="content"
            className="min-w-0 flex-1 py-4 text-sm text-white placeholder:text-white/50 placeholder:opacity-100"
          />

          <Button
            type="submit"
            aria-label="Berlangganan newsletter"
            variant="ghost"
            size="icon-sm"
            className="group shrink-0 text-brand-lime hover:bg-transparent hover:text-white focus-visible:border-brand-lime focus-visible:ring-brand-lime/30"
          >
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </div>
  );
}
