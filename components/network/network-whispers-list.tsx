import * as React from "react";

import { SidebarMenuSub } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight, MessageSquareLock, Plus } from "lucide-react";
import { NetworkWhispersItem } from "@/components/network/network-whispers-item";
import { Channel, ChannelType } from "@/services/types";
import { useServiceContext } from "@/contexts/page";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";
import { WhisperCreateForm } from "@/components/whisper/whisper-create-form";

export function NetworkWhispersList() {
  const { service_manager, current_account, current_network } = useServiceContext();
  const { state } = useSidebar();
  const [whispers, setWhispers] = React.useState<Channel[]>([]);

  const handleCreateWhisper = React.useCallback((channel: Channel) => {
    setWhispers(prev => {
      if (prev.some(w => w.channel_id === channel.channel_id)) {
        return prev;
      }
      if (channel.type !== ChannelType.WHISPER) {
        return prev;
      }
      return [...prev, channel];
    });
  }, []);

  const handleUpdateWhisper = React.useCallback((channel: Channel) => {
    setWhispers(prev => prev.map(w => 
      w.channel_id === channel.channel_id ? channel : w
    ));
  }, []);

  const handleDeleteWhisper = React.useCallback((channel: Channel) => {
    setWhispers(prev => prev.filter(w => 
      w.channel_id !== channel.channel_id
    ));
  }, []);

  React.useEffect(() => {
    const initialize = async () => {
      if (!current_network?.network_id) return;

      // Initial load of whispers
      const whispers_result = await service_manager.channels.selectWhispers(
        current_network.network_id,
        current_account.account_id
      );

      if (!whispers_result.success) {
        toast.error(whispers_result.failure?.message, {
          description: whispers_result.failure?.context,
        });
        return;
      }

      setWhispers(whispers_result.content || []);

      // Subscribe to network events for whispers
      const subscription_result = await service_manager.networks.subscribe({
        network_id: current_network.network_id,
        onChannelCreate: handleCreateWhisper,
        onChannelUpdate: handleUpdateWhisper,
        onChannelDelete: handleDeleteWhisper,
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

  return (
    <Collapsible
      key="whispers"
      defaultOpen={current_network !== null}
      className="group/collapsible"
    >
      <CollapsibleTrigger asChild>
        <SidebarMenuButton tooltip="Whispers">
          <div className="flex w-full items-center gap-2">
            {state === "expanded" ? (
              <>
                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                <span>Whispers</span>
                <div onClick={(e) => e.stopPropagation()} className="ml-auto">
                  <WhisperCreateForm>
                    <div>
                      <Plus className="size-4" />
                    </div>
                  </WhisperCreateForm>
                </div>
              </>
            ) : (
              <div className="flex w-full justify-center">
                <MessageSquareLock className="size-4" />
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      {state === "expanded" && (
        <CollapsibleContent>
          <SidebarMenuSub>
            {whispers.map(whisper => (
              <NetworkWhispersItem 
                key={whisper.channel_id}
                whisper={whisper} 
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
