import * as React from "react";

import { SidebarMenuSub } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight, Plus, Hash } from "lucide-react";
import { NetworkChannelsItem } from "@/components/network/network-channels-item";
import { Channel, ChannelType } from "@/services/types";
import { useServiceContext } from "@/contexts/page";
import { toast } from "sonner";
import { ChannelCreateForm } from "@/components/channel/channel-create-form";
import { useSidebar} from "@/components/ui/sidebar";

export function NetworkChannelsList() {
  const { service_manager, current_network, current_channel, setCurrentChannel } = useServiceContext();
  const { state } = useSidebar();
  const [channels, setChannels] = React.useState<Channel[]>([]);

  const handleCreateChannel = React.useCallback((channel: Channel) => {
    setChannels(prev => {
      if (prev.some(c => c.channel_id === channel.channel_id)) {
        return prev;
      }
      if (channel.type !== ChannelType.PRIMARY) {
        return prev;
      }
      return [...prev, channel];
    });
  }, []);

  const handleUpdateChannel = React.useCallback((channel: Channel) => {
    setChannels(prev => prev.map(c => 
      c.channel_id === channel.channel_id ? channel : c
    ));
  }, []);

  const handleDeleteChannel = React.useCallback((channel: Channel) => {
    setChannels(prev => prev.filter(c => 
      c.channel_id !== channel.channel_id
    ));
  }, []);

  React.useEffect(() => {
    const initialize = async () => {
      if (!current_network?.network_id) return;

      // Initial load of channels
      const channels_result = await service_manager.channels.selectChannels(
        current_network.network_id
      );

      if (!channels_result.success) {
        toast.error(channels_result.failure?.message, {
          description: channels_result.failure?.context,
        });
        return;
      }

      setChannels(channels_result.content || []);

      // Only subscribe to network events for channels
      const subscription_result = await service_manager.networks.subscribe({
        network_id: current_network.network_id,
        onChannelCreate: handleCreateChannel,
        onChannelUpdate: handleUpdateChannel,
        onChannelDelete: handleDeleteChannel,
      });

      if (!subscription_result.success) {
        toast.error(subscription_result.failure?.message, {
          description: subscription_result.failure?.context,
        });
        return;
      }

      return () => {
        subscription_result.content?.unsubscribe();
      };
    };

    initialize();
  }, [current_network?.network_id]);

  React.useEffect(() => {
    if (channels.length > 0 && !current_channel) {
      setCurrentChannel(channels[0])
    }
  }, [channels, current_channel])

  return (
    <Collapsible
      key="channels"
      defaultOpen={current_network !== null}
      className="group/collapsible -mt-2 first:mt-0"
    >
      <CollapsibleTrigger asChild>
        <SidebarMenuButton tooltip="Channels">
          <div className="flex w-full items-center gap-2">
            {state === "expanded" ? (
              <>
                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                <span>Channels</span>
                <div onClick={(e) => e.stopPropagation()} className="ml-auto">
                  <ChannelCreateForm>
                    <div>
                      <Plus className="size-4" />
                    </div>
                  </ChannelCreateForm>
                </div>
              </>
            ) : (
              <div className="flex w-full justify-center">
                <Hash className="size-4" />
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      {state === "expanded" && (
        <CollapsibleContent>
          <SidebarMenuSub>
            {channels.map(channel => (
              <NetworkChannelsItem 
                key={channel.channel_id}
                channel={channel} 
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}