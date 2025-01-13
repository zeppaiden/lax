"use client"

import * as React from "react"
import { CircleDot, User } from "lucide-react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

import { Account } from "@/services/types"
import { SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { useServiceContext } from "@/contexts/page"
import { cn } from "@/lib/utils"

export function NetworkAccountsItem({ account }: { account: Account }) {
  const { current_account } = useServiceContext()

  return (
    <SidebarMenuSubItem key={account.account_id}>
      <SidebarMenuSubButton
        className={current_account?.account_id === account.account_id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
      >
        <HoverCard openDelay={200} closeDelay={200}>
          <HoverCardTrigger asChild>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <User className="size-6 pr-2" />
                <span>{`${account.fname} ${account.lname}`}</span>
              </div>
              <CircleDot className={cn(account.is_offline ? "text-red-500" : "text-green-500", "size-4")} />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{`${account.fname} ${account.lname}`}</h4>
                <p className="text-sm text-muted-foreground">Username: {account.uname}</p>
                <p className="text-sm text-muted-foreground">Email: {account.email}</p>
                <div className="flex items-center pt-2">
                  <CircleDot className={cn(account.is_offline ? "text-red-500" : "text-green-500", "size-4 mr-2")} />
                  <span className="text-sm text-muted-foreground">{account.is_offline ? "Offline" : "Online"}</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}
