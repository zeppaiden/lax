"use client"

import * as React from "react"
import { Message, Account } from "@/services/types"
import { MessageBubbleItem } from "@/components/message/message-bubble-item"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"

interface MessageBubbleListProps {
  channel_id: string | null
}

interface MessageWithAccount extends Message {
  account?: Account;
}

export function MessageBubbleList({ channel_id }: MessageBubbleListProps) {
  const { service_manager, current_account } = useServiceContext()
  const [messages, setMessages] = React.useState<MessageWithAccount[]>([])
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const handleCreateMessage = React.useCallback(async (message: Message) => {
    const accountResult = await service_manager.accounts.selectAccount(message.created_by)
    const messageWithAccount = {
      ...message,
      account: accountResult.success ? accountResult.content : undefined
    }

    setMessages(prev => {
      if (prev.some(m => m.message_id === message.message_id)) {
        return prev
      }
      return [...prev, messageWithAccount]
    })
  }, [service_manager])

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
        // Fetch account information for each message
        const messagesWithAccounts = await Promise.all(
          (messages_result.content || []).map(async (message) => {
            const accountResult = await service_manager.accounts.selectAccount(message.created_by)
            return {
              ...message,
              account: accountResult.success ? accountResult.content : undefined
            }
          })
        )
        setMessages(messagesWithAccounts)
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
  }, [channel_id, service_manager])

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
          current_account={current_account}
          message_account={message.account}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
