export type FooterLink = {
  label: string;
  href: string;
};

export type FooterSocialLink = FooterLink & {
  shortLabel: string;
};

export const exploreLinks: FooterLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Ekosistem", href: "/#ekosistem" },
  { label: "Edukasi", href: "/edukasi" },
];

export const marketplaceLinks: FooterLink[] = [
  { label: "Material Sirkular", href: "/material" },
  { label: "Produk Upcycled", href: "/produk" },
];

export const platformLinks: FooterLink[] = [
  { label: "AI Material", href: "/#ai-material" },
  { label: "Traceability", href: "/#traceability" },
  { label: "Dampak", href: "/#dampak" },
];

export const socialLinks: FooterSocialLink[] = [
  { label: "Instagram", shortLabel: "ig", href: "#instagram" },
  { label: "LinkedIn", shortLabel: "in", href: "#linkedin" },
  { label: "YouTube", shortLabel: "yt", href: "#youtube" },
];
