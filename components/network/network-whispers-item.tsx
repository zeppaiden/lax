"use client"

import * as React from "react"
import { MessageSquareLock } from "lucide-react"

import { SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { useServiceContext } from "@/contexts/page"
import { Account, Channel } from "@/services/types"
import { WhisperDeleteForm } from "../whisper/whisper-delete-form"

export function NetworkWhispersItem({ whisper }: { whisper: Channel }) {
  const { current_channel, setCurrentChannel, current_account, service_manager } = useServiceContext()
  const [otherUser, setOtherUser] = React.useState<Account | null>(null)
  
  // Fetch channel participants and find the other user
  React.useEffect(() => {
    const fetchParticipants = async () => {
      const result = await service_manager.channels.selectChannelContext(whisper.channel_id)
      if (result.success) {
        const otherParticipant = result.content?.accounts.find(
          account => account.account_id !== current_account?.account_id
        )
        setOtherUser(otherParticipant || null)
      }
    }
    
    fetchParticipants()
  }, [whisper.channel_id, current_account?.account_id, service_manager.channels])

  return (
    <SidebarMenuSubItem key={whisper.channel_id}>
      <SidebarMenuSubButton
        onClick={() => setCurrentChannel(whisper)}
        className={current_channel?.channel_id === whisper.channel_id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <MessageSquareLock className="size-6 pr-2" />
            <span>
              {otherUser ? `${otherUser.fname} ${otherUser.lname}` : 'Loading...'}
            </span>
          </div>
          <div className="opacity-0 transition-opacity hover:opacity-100">
            <WhisperDeleteForm channel={whisper} />
          </div>
        </div>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

