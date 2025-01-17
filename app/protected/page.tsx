"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { MessageBubbleItem } from "@/components/message/message-bubble-item"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useServiceContext } from "@/contexts/page";
import { MessageArea } from "@/components/message/message-area"
import { ChannelType } from "@/services/types"
import { ModeToggle } from "@/components/mode-toggle"
import { SearchesOpenDrawer } from "@/components/searches/searches-open-drawer"
import { PinnedMessagesDrawer } from "@/components/message/pinned-messages-drawer"

export default function Page() {
  const { 
    service_manager, 
    current_account, 
    current_network, 
    current_channel, 
    current_spinoff,
    setCurrentChannel,
    setCurrentSpinoff
  } = useServiceContext();

  React.useEffect(() => {
    service_manager.accounts.updateAccount(
      current_account.account_id,
    );
  }, [current_account])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {current_network && (
                    <BreadcrumbLink onClick={() => setCurrentChannel(null)}>
                      {current_network.name}
                    </BreadcrumbLink>
                  )}
                    {current_channel && (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbLink onClick={() => setCurrentSpinoff(null)}>
                          {current_channel.type === ChannelType.PRIMARY ? `# ${current_channel.name}` : 'Whisper'}
                        </BreadcrumbLink>
                      </>
                    )}
                    {current_spinoff && (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbLink>
                          Spinoff
                        </BreadcrumbLink>
                      </>
                    )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {current_channel && (
                <PinnedMessagesDrawer channel_id={current_channel.channel_id} />
              )}
              <SearchesOpenDrawer />
              <Separator orientation="vertical" className="h-4" />
              <ModeToggle />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <MessageArea
            channel_id={current_spinoff ? current_spinoff.channel_id : current_channel?.channel_id || ""}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
