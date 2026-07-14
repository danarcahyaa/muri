import Link from "next/link";

interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export function AuthFooterLink({ text, linkText, href }: AuthFooterLinkProps) {
  return (
    <div className="mt-8 border-t border-line-trace/40 pt-6 text-center text-xs text-muted-moss">
      <span>{text} </span>
      <Link
        href={href}
        className="font-bold text-brand-emerald transition-colors hover:text-brand-forest"
      >
        {linkText}
      </Link>
    </div>
  );
}
