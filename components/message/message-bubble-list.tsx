"use client"

import * as React from "react"
import { Message, Account } from "@/services/types"
import { MessageBubbleItem } from "@/components/message/message-bubble-item"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"

interface MessageBubbleListProps {
  account: Account
  channel_id: string | null
}

export function MessageBubbleList({ account, channel_id }: MessageBubbleListProps) {
  const { service_manager } = useServiceContext()
  const [messages, setMessages] = React.useState<Message[]>([])
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const handleCreateMessage = React.useCallback((message: Message) => {
    setMessages(prev => {
      if (prev.some(m => m.message_id === message.message_id)) {
        return prev
      }
      return [...prev, message]
    })
  }, [])

  const handleUpdateMessage = React.useCallback((message: Message) => {
    setMessages(prev => prev.map(m => 
      m.message_id === message.message_id ? message : m
    ))
  }, [])

  const handleDeleteMessage = React.useCallback((message: Message) => {
    setMessages(prev => prev.filter(m => 
      m.message_id !== message.message_id
    ))
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  React.useEffect(() => {
    const initialize = async () => {
      if (!channel_id) return

      // Fetch initial messages
      const messages_result = await service_manager.messages.selectMessages(channel_id)
      if (messages_result.success) {
        setMessages(messages_result.content || [])
      } else {
        toast.error(messages_result.failure?.message || "Failed to load messages", {
          description: messages_result.failure?.context || "An unexpected error occurred"
        })
      }

      const subscription = await service_manager.channels.subscribe({
        channel_id,
        onMessageCreate: handleCreateMessage,
        onMessageUpdate: handleUpdateMessage,
        onMessageDelete: handleDeleteMessage,
      })

      if (!subscription.success) {
        toast.error(subscription.failure?.message || "Failed to subscribe to channel", {
          description: subscription.failure?.context || "An unexpected error occurred"
        })
        return
      }

      return () => {
        subscription.content?.unsubscribe()
      }
    }

    initialize()
  }, [channel_id, service_manager.channels])

  if (!channel_id) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a channel to begin messaging
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 min-h-full">
      {messages.map((message) => (
        <MessageBubbleItem
          key={message.message_id}
          message={message}
          account={account}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
