"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChevronLeft } from "lucide-react"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const currentPage = pathname.split("/").pop()

  const getPageTitle = () => {
    switch (currentPage) {
      case "account":
        return "Account Settings"
      case "notifications":
        return "Notification Settings"
      case "settings":
        return "General Settings"
      default:
        return "Settings"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/protected")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
} 