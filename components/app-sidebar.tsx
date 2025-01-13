"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { AccountNetworksList } from "@/components/account/account-networks-list"
import { NetworkChannelsList } from "@/components/network/network-channels-list"
import { NetworkWhispersList } from "@/components/network/network-whispers-list"
import { NetworkAccountsList } from "@/components/network/network-accounts-list"
import { AccountProfile } from "@/components/account/account-profile"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AccountNetworksList />
      </SidebarHeader>
      <SidebarContent>
        <NetworkChannelsList />
        <NetworkWhispersList />
        <NetworkAccountsList />
      </SidebarContent>
      <SidebarFooter>
        <AccountProfile />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
