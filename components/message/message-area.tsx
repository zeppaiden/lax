"use client"

import * as React from "react"
import { Account } from "@/services/types"
import { MessageInputArea } from "@/components/message/message-input-area"
import { MessageBubbleList } from "@/components/message/message-bubble-list"

interface MessageAreaProps {
  account: Account
  channel_id: string
}

export function MessageArea({ account, channel_id }: MessageAreaProps) {
  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute inset-0 bottom-[104px] overflow-y-auto">
        <MessageBubbleList 
          account={account}
          channel_id={channel_id}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-background">
        <MessageInputArea
          account={account}
          channel_id={channel_id}
        />
      </div>
    </div>
  )
}
