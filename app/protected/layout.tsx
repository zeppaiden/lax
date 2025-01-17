"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ServiceProvider } from "@/contexts/page"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSettingsPage = pathname.startsWith("/protected/settings")

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ServiceProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          {children}
        </div>
        <Toaster />
      </ServiceProvider>
    </NextThemeProvider>
  )
}