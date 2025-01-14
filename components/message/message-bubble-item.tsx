"use client"

import * as React from "react"
import { Download, FileIcon, Loader2 } from "lucide-react"
import { useEffect } from "react";

import { Account, Message } from "@/services/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageBubbleMenubar } from "./message-bubble-menubar"
import { Button } from "../ui/button"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"

interface Reaction {
  emoji: string;
  count: number;
}

interface Payload {
  path: string;
  size: number;
  type?: string;
}

interface MessageBubbleItemProps {
  message: Message;
  current_account: Account;
  message_account?: Account;
}

export function MessageBubbleItem({ 
  message, 
  current_account, 
  message_account, 
}: MessageBubbleItemProps) {
  const { service_manager } = useServiceContext()
  const [signed_payloads, setSignedPayloads] = React.useState<Record<string, string>>({})
  
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

  const handleReactionClick = async (emoji: string) => {
    const result = await service_manager.messages.toggleReaction(
      message.message_id, 
      current_account.account_id, 
      emoji
    )

    if (result.success) {
      toast.success('Reaction toggled successfully')
    } else {
      toast.error('Failed to toggle reaction')
    }
  }

  const handlePayloadDownload = async (payload: Payload) => {
    console.log('Getting signed URL for payload:', payload)
    const result = await service_manager.messages.getSignedUrl(payload.path) // We'll add this method
    console.log('Signed URL result:', result)
  
    if (result.success && typeof result.content === 'string') {
      setSignedPayloads(prev => ({
        ...prev,
        [payload.path]: result.content as string
      }))
    } else {
      console.error('Failed to get signed URL:', result)
      toast.error('Failed to generate download link')
    }
  }

  useEffect(() => {
    if (!message_account?.robot && message.channel_id.includes('whisper')) {
      console.log('Triggering AI response for message:', {
        channel_id: message.channel_id,
        content: message.content,
        message_account
      });
      
      service_manager.messages.createAIResponse(
        message.channel_id,
        message.content
      ).then(result => {
        console.log('AI response result:', result);
        if (!result.success) {
          toast.error('Failed to get AI response');
        }
      });
    }
  }, [message.message_id]);

  return (
    <div className="group flex items-start gap-3 p-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground font-sans">
          {message_account?.fname?.[0] || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold font-sans">
              {message_account ? `${message_account.fname} ${message_account.lname}` : 'Unknown User'}
            </span>
            {message_account?.robot && (
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
                  onClick={() => handleReactionClick(reaction.emoji)}
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
                disabled={!signed_payloads[payload.path]}
              >
                <a 
                  href={signed_payloads[payload.path]} 
                  download={payload.path.split('/').pop()}
                  onClick={(e) => {
                    if (!signed_payloads[payload.path]) {
                      e.preventDefault()
                      handlePayloadDownload(payload)
                    }
                  }}
                >
                  {!signed_payloads[payload.path] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  )
}
