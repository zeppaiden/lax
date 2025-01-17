"use client"

import * as React from "react"
import { Pin } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useServiceContext } from "@/contexts/page"
import { Message, Account } from "@/services/types"
import { toast } from "sonner"
import { MessageBubbleItem } from "./message-bubble-item"
import { MessageBubbleMenubar } from "./message-bubble-menubar"

interface PinnedMessage extends Message {
  account: Account;
}

interface PinnedMessagesDrawerProps {
  channel_id: string;
}

export function PinnedMessagesDrawer({ channel_id }: PinnedMessagesDrawerProps) {
  const { service_manager } = useServiceContext()
  const [open, setOpen] = React.useState(false)
  const [pinnedMessages, setPinnedMessages] = React.useState<PinnedMessage[]>([])
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null)

  const fetchPinnedMessages = React.useCallback(async () => {
    if (!channel_id) return

    const result = await service_manager.messages.selectPinnedMessages(channel_id)
    if (!result.success) {
      toast.error("Failed to load pinned messages", {
        description: result.failure?.message
      })
      return
    }

    if (!result.content) {
      setPinnedMessages([])
      return
    }

    // Fetch account info for each message
    const messagesWithAccounts = await Promise.all(
      result.content.map(async (message) => {
        const accountResult = await service_manager.accounts.selectAccount(message.created_by)
        if (!accountResult.success) return null
        return { ...message, account: accountResult.content }
      })
    )

    setPinnedMessages(messagesWithAccounts.filter(Boolean) as PinnedMessage[])
  }, [channel_id, service_manager])

  React.useEffect(() => {
    if (open) {
      fetchPinnedMessages()
    }
  }, [open, fetchPinnedMessages])

  const handleEdit = (messageId: string) => {
    setEditingMessageId(messageId)
  }

  const handleReply = (messageId: string) => {
    // Handle reply functionality
    toast.info("Reply functionality coming soon")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Pin className="h-4 w-4" />
          <span className="sr-only">View pinned messages</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Pinned Messages</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="flex flex-col gap-4 pr-4">
            {pinnedMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No pinned messages
              </div>
            ) : (
              pinnedMessages.map((message) => (
                <div key={message.message_id} className="group relative">
                  <MessageBubbleItem
                    message={message}
                    account={message.account}
                  />
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageBubbleMenubar
                      message={message}
                      onEdit={() => handleEdit(message.message_id)}
                      onReply={() => handleReply(message.message_id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 