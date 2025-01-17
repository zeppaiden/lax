"use client"

import * as React from "react"
import { 
  MoreHorizontal, 
  Pencil, 
  Reply, 
  Trash2, 
  Pin, 
  PinOff,
  SmileIcon,
  Copy,
  GitBranch,
  Volume2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Message } from "@/services/types"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { generateSpeech } from "@/utils/tts";

interface MessageBubbleMenubarProps {
  message: Message
  onEdit?: () => void
  onReply?: () => void
}

export function MessageBubbleMenubar({
  message,
  onEdit,
  onReply,
}: MessageBubbleMenubarProps) {
  const { 
    service_manager, 
    current_account, 
    current_network, 
    current_channel,
    setCurrentChannel,
    setCurrentSpinoff
  } = useServiceContext()

  const handleDelete = async () => {
    if (!current_account) return

    const result = await service_manager.messages.deleteMessage(
      message.message_id,
      current_account.account_id
    )

    if (!result.success) {
      toast.error("Failed to delete message", {
        description: result.failure?.message
      })
      return
    }

    toast.success("Message deleted successfully")
  }

  const handlePin = async () => {
    if (!current_account || !current_network || current_account.account_id !== current_network.created_by) {
      toast.error("Only network creator can pin messages")
      return
    }

    const result = await service_manager.messages.pinMessage(
      message.message_id,
      current_account.account_id
    )

    if (!result.success) {
      toast.error("Failed to pin message", {
        description: result.failure?.message
      })
      return
    }

    toast.success("Message pinned successfully")
  }

  const handleUnpin = async () => {
    if (!current_account || !current_network || current_account.account_id !== current_network.created_by) {
      toast.error("Only network creator can unpin messages")
      return
    }

    const result = await service_manager.messages.unpinMessage(
      message.message_id,
      current_account.account_id
    )

    if (!result.success) {
      toast.error("Failed to unpin message", {
        description: result.failure?.message
      })
      return
    }

    toast.success("Message unpinned successfully")
  }

  const handleReactionSelect = async (emoji: any) => {
    if (!current_account) return

    const result = await service_manager.messages.toggleReaction(
      message.message_id,
      current_account.account_id,
      emoji.native
    )

    if (!result.success) {
      toast.error("Failed to add reaction", {
        description: result.failure?.message
      })
      return
    }

    toast.success("Reaction added successfully")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast.success("Message copied to clipboard")
  }

  const handleSpinoff = async () => {
    if (!current_account || !current_network || !current_channel) return

    const result = await service_manager.channels.createSpinoff(
      current_network.network_id,
      current_account.account_id,
      current_channel.channel_id,
      message.message_id
    )

    if (!result.success) {
      toast.error("Failed to create spinoff", {
        description: result.failure?.message
      })
      return
    }

    // Update UI state to show the new spinoff
    if (result.content) {
      setCurrentSpinoff(result.content)
      setCurrentChannel(result.content)
    }

    toast.success("Spinoff created successfully")
  }

  const handlePlayAudio = async () => {
    const loadingToast = toast.loading('Generating audio...');
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: message.content,
          message_creator_id: message.created_by 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioData = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioSource = audioContext.createBufferSource();
      
      audioContext.decodeAudioData(audioData, (buffer) => {
        audioSource.buffer = buffer;
        audioSource.connect(audioContext.destination);
        audioSource.start(0);
        toast.dismiss(loadingToast);
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      toast.error('Failed to play audio');
      toast.dismiss(loadingToast);
    }
  }

  const isNetworkCreator = current_network?.created_by === current_account?.account_id
  const isMessageCreator = message.created_by === current_account?.account_id
  const isPinned = Boolean(message.pinned_at)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open message menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onReply && (
          <DropdownMenuItem onClick={onReply}>
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSpinoff}>
          <GitBranch className="mr-2 h-4 w-4" />
          Spinoff
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePlayAudio}>
          <Volume2 className="mr-2 h-4 w-4" />
          Play Audio
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SmileIcon className="mr-2 h-4 w-4" />
            Add Reaction
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <div className="p-2">
              <Picker 
                data={data} 
                onEmojiSelect={handleReactionSelect}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
              />
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {isMessageCreator && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {isNetworkCreator && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={isPinned ? handleUnpin : handlePin}>
              {isPinned ? (
                <>
                  <PinOff className="mr-2 h-4 w-4" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="mr-2 h-4 w-4" />
                  Pin
                </>
              )}
            </DropdownMenuItem>
          </>
        )}
        {(isMessageCreator || isNetworkCreator) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
