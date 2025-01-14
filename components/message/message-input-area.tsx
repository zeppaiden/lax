"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileIcon, Loader2, Paperclip, Send, X } from "lucide-react"
import { Account } from "@/services/types"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
interface MessageInputAreaProps {
  channel_id: string | null
}

export function MessageInputArea({ channel_id }: MessageInputAreaProps) {
  const supabase = createClient()

  const { service_manager, current_account } = useServiceContext()
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [files, setFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !channel_id) return

    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])

    // Clear the input for future selections
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove))
  }

  const handleSubmit = async () => {
    if (!channel_id) return
    if (!content.trim() && files.length === 0) return
    
    setIsSubmitting(true)
    const toastId = files.length ? toast.loading(`Sending message with ${files.length} file(s)...`) : undefined

    try {
      const channel_result = await service_manager.channels.selectChannel(channel_id)
      
      if (!channel_result.success) {
        toast.error("Cannot access channel", {
          description: channel_result.failure?.message
        })
        return
      }

      const result = await service_manager.messages.createMessage(
        channel_id,
        current_account.account_id,
        content.trim(),
        {},  // Empty meta object - files will be handled inside createMessage
        files // Pass files directly
      )

      if (!result.success) {
        toast.error(result.failure?.message || "Failed to send message", {
          id: toastId,
          description: result.failure?.context || "Unknown error"
        })
        return
      }

      const { data, error } = await supabase
        .from('channels_accounts')
        .select('channel_id')
        .eq('account_id', 'd9d2c190-fee1-4ef7-9c2e-9dfdcda17c2f')
        .eq('channel_id', channel_id);

      if (!error && data && data.length > 0) {
        console.log('Deadpool is in this channel')

        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channel_id, content: content.trim() })
        })

        const result = await response.json();
        
        if (!result.success) {
          toast.error('Failed to get AI response', {
            description: result.failure?.message || "Unknown error"
          })
        }
      } else if (toastId) {
        toast.success('Message sent with files', { id: toastId })
      }

      setContent("")
      setFiles([])
    } catch (error) {
      toast.error('Failed to send message', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!channel_id) {
    return (
      <div className="border-t p-4">
        <div className="flex gap-2">
          <div className="h-[80px] w-full animate-pulse rounded-md bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t p-4">
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md border bg-muted p-2"
            >
              <FileIcon className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => handleRemoveFile(file)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[80px] max-h-[360px] resize-y"
          disabled={isSubmitting}
        />
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <Button
            size="icon"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            disabled={(!content.trim() && files.length === 0) || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}