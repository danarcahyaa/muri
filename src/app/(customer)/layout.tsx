import GuestOnly from "@/components/auth/GuestOnly";

type CustomerAuthLayoutProps = {
  children: React.ReactNode;
};

export default function CustomerAuthLayout({
  children,
}: CustomerAuthLayoutProps) {
  return <GuestOnly>{children}</GuestOnly>;
}