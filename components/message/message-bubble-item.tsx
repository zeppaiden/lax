"use client"

import * as React from "react"
import { Download, FileIcon, Loader2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import ReactMarkdown from 'react-markdown'

import { Account, Message } from "@/services/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MessageBubbleMenubar } from "./message-bubble-menubar"
import { Button } from "../ui/button"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"

interface Payload {
  name?: string;
  path: string;
  purl: string;
  size: number;
  type?: string;
}

interface MessageBubbleItemProps {
  message: Message;
  account: Account;
}

export function MessageBubbleItem({ 
  message, 
  account, 
}: MessageBubbleItemProps) {
  const { service_manager } = useServiceContext()
  const [showMarkdown, setShowMarkdown] = React.useState(true)
  
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
      account.account_id, 
      emoji
    )

    if (result.success) {
      toast.success('Reaction toggled successfully')
    } else {
      toast.error('Failed to toggle reaction')
    }
  }

  const handlePayloadDownload = async (payload: Payload) => {
    console.log('Downloading payload:', payload)
    const result = await service_manager.messages.downloadFile(payload.path)
    console.log('Download result:', result)

    if (result.success && result.content instanceof Blob) {
      const url = URL.createObjectURL(result.content)

      const link = document.createElement('a')
      link.href = url
      link.download = payload.path.split('/').pop() || 'file'
      link.click()

      URL.revokeObjectURL(url)
    } else {
      toast.error('Failed to download file')
    }
  }

  return (
    <div className="group flex items-start gap-3 p-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground font-sans">
          {account?.fname?.[0] || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold font-sans">
              {account ? `${account.fname} ${account.lname}` : 'Unknown User'}
            </span>
            {account?.robot && (
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowMarkdown(!showMarkdown)}
            >
              {showMarkdown ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <MessageBubbleMenubar message={message} />
          </div>
        </div>

        <Card className="max-w-[85%]">
          <CardContent className="p-3 font-sans">
            {showMarkdown ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm">{message.content}</pre>
            )}
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
                disabled={!payload.purl}
              >
                <a 
                  href={payload.purl} 
                  download={payload.path}
                  onClick={(e) => {
                    if (!payload.purl) {
                      e.preventDefault()
                      handlePayloadDownload(payload)
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
            
            { payload.type?.includes('image') && payload.purl && (
              <CardFooter className="w-full">
                <div className="relative w-full max-w-[400px] aspect-[4/3]">
                  <Image 
                    src={payload.purl} 
                    alt={payload.path} 
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              </CardFooter>
            )}

            { payload.type?.includes('video') && payload.purl && (
              <CardFooter className="w-full">
                <div className="relative w-full max-w-[400px]">
                  <video 
                    controls
                    className="w-full rounded-md"
                    preload="metadata"
                  >
                    <source src={payload.purl} type={payload.type} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardFooter>
            )}

            { payload.type?.includes('audio') && payload.purl && (
              <CardFooter className="w-full">
                <div className="w-full max-w-[400px]">
                  <audio 
                    controls
                    className="w-full"
                    preload="metadata"
                  >
                    <source src={payload.purl} type={payload.type} />
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              </CardFooter>
            )}

            { payload.type?.includes('pdf') && payload.purl && (
              <CardFooter className="w-full">
                <div className="w-full max-w-[600px] aspect-[8.5/11]">
                  <iframe
                    src={`${payload.purl}#view=FitH`}
                    className="w-full h-full rounded-md border"
                    title={`PDF: ${payload.path.split('/').pop()}`}
                  />
                </div>
              </CardFooter>
            )}
          </Card>
        ))}

      </div>
    </div>
  )
}
