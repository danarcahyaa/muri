import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
    >
      <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </Link>
  );
}
