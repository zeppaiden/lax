"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Copy, MessageSquarePlus, SmileIcon, Split, Trash2 } from "lucide-react"
import { useServiceContext } from "@/contexts/page"
import { Message } from "@/services/types"
import { toast } from "sonner"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useState } from "react"

interface MessageBubbleMenubarProps {
  message: Message
}

export function MessageBubbleMenubar({ message }: MessageBubbleMenubarProps) {
  const { service_manager, current_account, current_network, current_spinoff, setCurrentSpinoff } = useServiceContext()

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleReaction = async (reaction: string) => {
    if (!message.message_id) return

    const result = await service_manager.messages.toggleReaction(
      message.message_id,
      current_account.account_id,
      reaction
    )

    if (!result.success) {
      toast.error("Failed to add reaction", {
        description: result.failure?.message
      })
      return
    }

    toast.success("Reaction added")
  }

  const handleSpinoff = async () => {
    if (!message.message_id || !message.channel_id) return

    let joined = false
    let result = await service_manager.channels.selectSpinoff(
      current_network?.network_id || "",
      current_account.account_id,
      message.channel_id,
      message.message_id
    )

    if (!result.success || !result.content) {
      result = await service_manager.channels.createSpinoff(
        current_network?.network_id || "",
        current_account.account_id,
        message.channel_id,
        message.message_id
      )

      if (!result.success) {
        toast.error("Failed to create spinoff", {
          description: result.failure?.message
        })
        return
      }
      joined = false
    } else {
      joined = true
    }

    if (!result.content) {
      toast.error("Failed to create spinoff thread", {
        description: "An unexpected error occurred"
      })
      return
    }

    setCurrentSpinoff(result.content)
    toast.success(joined ? "Joined spinoff thread" : "Created spinoff thread")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast.success("Copied to clipboard")
  }

  const handleDelete = async () => {
    if (!message.message_id) return;

    const result = await service_manager.messages.deleteMessage(
      message.message_id,
      current_account.account_id
    );

    console.log(result);
    if (!result.success) {
      toast.error(result.failure?.message || "Failed to delete message", {
        description: result.failure?.context || "An unexpected error occurred"
      });
      return;
    }

    toast.success("Message deleted");
  };

  const handleEmojiSelect = (emoji: any) => {
    handleReaction(emoji.native)
    setShowEmojiPicker(false)
  }

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <SmileIcon className="h-4 w-4" />
        </Button>
        
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}
      </div>
      
      {!current_spinoff && <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleSpinoff}
      >
        <Split className="h-4 w-4" />
      </Button>}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
      </Button>

      {message.created_by === current_account.account_id && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
