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
  account: Account;
}

export function MessageBubbleList({ channel_id }: MessageBubbleListProps) {
  const { service_manager, current_account } = useServiceContext()
  const [messages, setMessages] = React.useState<MessageWithAccount[]>([])
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const createMessageWithAccount = React.useCallback(async (message: Message) => {
    if (!message.created_by) {
      console.warn('Message has no created_by field:', message)
      return {
        ...message,
        account: {
          account_id: 'unknown',
          fname: 'Unknown',
          lname: 'User',
          uname: 'unknown',
          email: '',
          robot: false,
          is_offline: true,
          created_at: new Date().toISOString(),
          present_at: new Date().toISOString()
        }
      }
    }

    const result = await service_manager.accounts.selectAccount(message.created_by)

    if (!result.success) {
      console.warn('Failed to load account for message:', {
        message_id: message.message_id,
        error: result.failure
      })
      return {
        ...message,
        account: {
          account_id: message.created_by,
          fname: 'Unknown',
          lname: 'User',
          uname: 'unknown',
          email: '',
          robot: false,
          is_offline: true,
          created_at: new Date().toISOString(),
          present_at: new Date().toISOString()
        }
      }
    }

    return { ...message, account: result.content as Account }
  }, [service_manager])

  const handleCreateMessage = React.useCallback(async (message: Message) => {
    const messageWithAccount = await createMessageWithAccount(message)

    if (!messageWithAccount) {
      console.warn('Could not create message with account:', message)
      return
    }

    setMessages(prev => {
      if (prev.some(m => m.message_id === message.message_id)) {
        return prev
      }
      return [...prev, messageWithAccount]
    })
  }, [createMessageWithAccount])

  const handleUpdateMessage = React.useCallback((message: Message) => {
    setMessages(prev => prev.map(m => 
      m.message_id === message.message_id ? { ...m, ...message } : m
    ))
  }, [])

  const handleDeleteMessage = React.useCallback((message: Message) => {
    setMessages(prev => prev.filter(m => 
      m.message_id !== message.message_id
    ))
  }, [])

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  React.useEffect(() => {
    let isMounted = true
    let subscription: any

    const initialize = async () => {
      if (!channel_id) return

      // Fetch initial messages
      const messages_result = await service_manager.messages.selectMessages(channel_id)
      if (messages_result.success) {
        // Fetch account information for each message
        const messagesWithAccounts = await Promise.all(
          (messages_result.content || []).map(createMessageWithAccount)
        )
        
        if (isMounted) {
          setMessages(messagesWithAccounts.filter(Boolean) as MessageWithAccount[])
        }
      } else {
        toast.error(messages_result.failure?.message || "Failed to load messages", {
          description: messages_result.failure?.context || "An unexpected error occurred"
        })
      }

      const sub = await service_manager.channels.subscribe({
        channel_id,
        onMessageCreate: handleCreateMessage,
        onMessageUpdate: handleUpdateMessage,
        onMessageDelete: handleDeleteMessage,
      })

      if (!sub.success) {
        toast.error(sub.failure?.message || "Failed to subscribe to channel", {
          description: sub.failure?.context || "An unexpected error occurred"
        })
        return
      }

      subscription = sub.content
    }

    initialize()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [channel_id, service_manager, createMessageWithAccount, handleCreateMessage, handleUpdateMessage, handleDeleteMessage])

  if (!channel_id) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a channel to begin messaging
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 min-h-full overflow-y-auto pb-20">
      {messages.map((message) => (
        <MessageBubbleItem
          key={message.message_id}
          message={message}
          account={message.account}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
