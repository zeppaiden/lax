"use client"

import * as React from "react"
import { Download, FileIcon, User } from "lucide-react"

import { Account, Message } from "@/services/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageBubbleMenubar } from "./message-bubble-menubar"
import { Button } from "../ui/button"
import { useServiceContext } from "@/contexts/page"

interface Reaction {
  emoji: string;
  count: number;
}

interface Payload {
  path: string;
  size: number;
}

export function MessageBubbleItem({ account, message }: { account: Account, message: Message }) {
  const { service_manager } = useServiceContext()
  
  const reactions = React.useMemo(() => {
    if (!message.meta) return [];
    if (!message.meta.reactions) return [];
    if (!Array.isArray(message.meta.reactions)) return [];
    
    return message.meta.reactions.map(reaction => ({
      emoji: reaction.emoji,
      count: Array.isArray(reaction.accounts) ? reaction.accounts.length : 0
    }));
  }, [message.meta]);
    
  const payloads = React.useMemo(() => {
    if (!message.meta) return [];
    if (!message.meta.payloads) return [];
    if (!Array.isArray(message.meta.payloads)) return [];
    
    return message.meta.payloads;
  }, [message.meta]);

  return (
    <div className="group flex items-start gap-3 p-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground font-sans">
          {account.fname[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold font-sans">
              {`${account.fname} ${account.lname}`}
            </span>
            {account.robot && (
              <Badge variant="secondary" className="h-5 px-1.5 font-sans">
                BOT
              </Badge>
            )}
            {message.created_at && (
              <span className="text-xs text-muted-foreground font-sans">
                {new Date(message.created_at).toLocaleString()}
              </span>
            )}
          </div>
          <MessageBubbleMenubar message={message} />
        </div>

        <Card className="max-w-[85%]">
          <CardContent className="p-3 font-sans">
            {message.content}
          </CardContent>
          {reactions.length > 0 && (
            <CardFooter className="flex flex-wrap gap-2">
              {reactions.map((reaction) => (
                <Button
                  key={reaction.emoji}
                  variant="secondary" 
                  size="sm"
                  onClick={() => service_manager.messages.toggleReaction(
                    message.message_id, 
                    account.account_id, 
                    reaction.emoji
                  )}
                  className="px-2 py-1 hover:bg-muted"
                >
                  <span className="text-lg">{reaction.emoji}</span>
                  {reaction.count > 0 && (
                    <span className="ml-1 mr-1 text-sm text-muted-foreground font-sans">
                      {reaction.count}
                    </span>
                  )}
                </Button>
              ))}
            </CardFooter>
          )}
        </Card>

        {payloads.length > 0 && payloads.map((payload: Payload) => (
          <Card key={payload.path} className="max-w-[85%] p-2">
            <CardContent className="p-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {payload.path.split('/').pop()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(payload.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <Button
                variant="ghost" 
                size="icon"
                asChild
              >
                <a href={payload.path} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  )
}
