"use client"

import * as React from "react"
import { useServiceContext } from "@/contexts/page"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchMessage } from "@/services"
import { ChannelType } from "@/services/types"
import { toast } from "sonner"

interface SearchesMessagesItemProps {
  result: SearchMessage
}

export function SearchesMessagesItem({ result }: SearchesMessagesItemProps) {
  const { setCurrentChannel, setCurrentSpinoff } = useServiceContext()

  const handleChannelClick = (e: React.MouseEvent) => {
    e.preventDefault()

    switch (result.channel.type) {
      case ChannelType.PRIMARY:
        setCurrentChannel(result.channel)
        toast.success("Channel changed", {
          description: `Switched to ${result.channel.name}`
        })
        break
      case ChannelType.SPINOFF:
        setCurrentChannel(result.channel)
        setCurrentSpinoff(result.channel)
        toast.success("Channel changed", {
          description: `Switched to spinoff in ${result.channel.name}`
        })
        break
      case ChannelType.WHISPER:
        setCurrentChannel(result.channel)
        toast.success("Channel changed", {
          description: `Switched to whisper of ${result.account.uname}`
        })
        break
      default:
        toast.error("Channel not found", {
          description: `Channel type ${result.channel.type} not found`
        })
        break
    }
  }

  // Create highlighted message content
  const renderHighlightedContent = () => {
    const { text, positions } = result.highlight
    if (!positions.length) return text

    let lastIndex = 0
    const elements: React.ReactNode[] = []

    positions.forEach((position: number, idx: number) => {
      // Add non-highlighted text before match
      if (position > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {text.slice(lastIndex, position)}
          </span>
        )
      }

      // Add highlighted character
      elements.push(
        <span key={`highlight-${idx}`} className="font-bold bg-yellow-100 dark:bg-yellow-900/50">
          {text[position]}
        </span>
      )

      lastIndex = position + 1
    })

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      )
    }

    return elements
  }

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-1 text-xs hover:text-primary"
          onClick={handleChannelClick}
        >
          {result.channel.type === ChannelType.PRIMARY ? result.channel.name : result.channel.type}
        </Button>
        {result.spinoff && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-1 text-xs hover:text-primary"
              onClick={handleChannelClick}
            >
              Spinoff
            </Button>
          </>
        )}
      </div>

      {/* Account info */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar className="h-6 w-6">
          <AvatarFallback>{result.account.uname[0] || result.account.fname[0] || result.account.lname[0] || "?"}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{result.account.uname}</span>
      </div>

      {/* Message content */}
      <div className="text-sm leading-relaxed">
        <div 
          className="text-muted-foreground mb-2"
          dangerouslySetInnerHTML={{ __html: result.message.content.replace(
            new RegExp(result.highlight.text.replace(/<\/?mark>/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            (match: string) => `<mark>${match}</mark>`
          )}}
        />
      </div>
    </div>
  )
}
