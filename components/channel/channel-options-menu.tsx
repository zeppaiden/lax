"use client"

import * as React from "react"
import { MoreVertical, Settings, LogOut, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Channel } from "@/services/types"
import { ChannelManageForm } from "./channel-manage-form"

interface ChannelOptionsMenuProps {
  channel: Channel
}

export function ChannelOptionsMenu({ channel }: ChannelOptionsMenuProps) {
  const { service_manager, current_account, current_network, setCurrentChannel } = useServiceContext()

  const handleLeaveChannel = async () => {
    if (!current_account) return

    const result = await service_manager.channels.removeAccount(
      channel.channel_id,
      current_account.account_id
    )

    if (!result.success) {
      toast.error("Failed to leave channel", {
        description: result.failure?.message
      })
      return
    }

    setCurrentChannel(null)
    toast.success("Left channel successfully")
  }

  const handleDeleteChannel = async () => {
    if (!current_account || !current_network || current_account.account_id !== current_network.created_by) return

    const result = await service_manager.channels.deleteChannel(channel.channel_id)

    if (!result.success) {
      toast.error("Failed to delete channel", {
        description: result.failure?.message
      })
      return
    }

    setCurrentChannel(null)
    toast.success("Channel deleted successfully")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open channel options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {current_account?.account_id === current_network?.created_by && (
          <>
            <ChannelManageForm channel={channel}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Manage Channel</span>
              </DropdownMenuItem>
            </ChannelManageForm>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleLeaveChannel}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Leave Channel</span>
        </DropdownMenuItem>
        {current_account?.account_id === current_network?.created_by && (
          <DropdownMenuItem onClick={handleDeleteChannel} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Channel</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 