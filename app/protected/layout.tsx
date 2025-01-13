import { ServiceProvider } from "@/contexts/page";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServiceProvider>
      {children}
    </ServiceProvider>
  )
}