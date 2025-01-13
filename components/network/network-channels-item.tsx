"use client"

import * as React from "react";
import { Hash } from "lucide-react";

import { Channel } from "@/services/types";
import { SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { useServiceContext } from "@/contexts/page";
import { ChannelDeleteForm } from "@/components/channel/channel-delete-form";

export function NetworkChannelsItem({ channel }: { channel: Channel }) {
  const { current_account, current_network, current_channel,setCurrentChannel, setCurrentSpinoff } = useServiceContext();

  return (
    <SidebarMenuSubItem key={channel.channel_id}>
      <SidebarMenuSubButton 
        onClick={() => {
          setCurrentChannel(channel)
          setCurrentSpinoff(null)
        }}
        className={current_channel?.channel_id === channel.channel_id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <Hash className="size-6 pr-2" />
            <span>{channel.name}</span>
          </div>
          {current_account?.account_id === current_network?.created_by && (
            <div className="opacity-0 transition-opacity hover:opacity-100">
              <ChannelDeleteForm channel={channel} />
            </div>
          )}
        </div>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}