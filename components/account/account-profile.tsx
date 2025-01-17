"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CircleDot,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

export function AccountProfile() {
  const { isMobile } = useSidebar()

  const router = useRouter()
  const supabase = createClient()
  const { service_manager, current_account, setCurrentAccount } = useServiceContext();

  const handleToggleStatus = async () => {
    const result = await service_manager.accounts.updateAccount(
      current_account.account_id,
      undefined, undefined, undefined, undefined, undefined,
      !current_account.is_offline
    )

    if (!result.success) {
      toast.error("Failed to update status", {
        description: result.failure?.message
      })
      return
    }

    setCurrentAccount({
      ...current_account,
      is_offline: !current_account.is_offline
    })

    toast.success("Status updated!", {
      description: `You are now ${!current_account.is_offline ? "offline" : "online"}!`
    })
  }

  const handleSignOut = async () => {
    toast.info("Signing out...")

    await supabase.auth.signOut();

    toast.success("Signed out successfully", {
      description: "Come back soon!",
    })
    await new Promise(resolve => setTimeout(resolve, 300));

    router.push("/")
  }

  const handleNavigateToSettings = (path: string) => {
    router.push(`/protected/settings/${path}`)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {current_account?.uname[0] || current_account?.fname[0] || current_account?.lname[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{current_account?.uname}</span>
                <span className="truncate text-xs">{current_account?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {current_account?.uname[0] || current_account?.fname[0] || current_account?.lname[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{current_account?.uname}</span>
                  <span className="truncate text-xs">{current_account?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleNavigateToSettings("account")}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                <CircleDot className={cn(current_account?.is_offline ? "text-red-500" : "text-green-500", "size-4")} />
                Status <span className="text-xs text-muted-foreground ml-1">{current_account?.is_offline ? "(offline)" : "(online)"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigateToSettings("notifications")}>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigateToSettings("settings")}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}