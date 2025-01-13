"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileIcon, Loader2, Paperclip, Send, X } from "lucide-react"
import { Account } from "@/services/types"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"

interface MessageInputAreaProps {
  account: Account
  channel_id: string | null
}

interface FileUpload {
  file: File;
  uploading: boolean;
  path?: string;
  originalName?: string;
}

export function MessageInputArea({ account, channel_id }: MessageInputAreaProps) {
  const { service_manager } = useServiceContext()
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [files, setFiles] = React.useState<FileUpload[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !channel_id) return

    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      uploading: true
    }))

    setFiles(prev => [...prev, ...newFiles])

    for (const fileUpload of newFiles) {
      const toastId = toast.loading(`Uploading ${fileUpload.file.name}...`)

      try {
        const result = await service_manager.payloads.uploadPayload(
          channel_id,
          fileUpload.file
        )

        if (!result.success) {
          toast.error(`Failed to upload ${fileUpload.file.name}`, {
            id: toastId,
            description: result.failure?.message
          })
          setFiles(prev => prev.filter(f => f !== fileUpload))
          continue
        }

        setFiles(prev => prev.map(f => 
          f === fileUpload ? { 
            ...f, 
            uploading: false, 
            path: result.content?.path,
            originalName: fileUpload.file.name
          } : f
        ))
        toast.success(`Uploaded ${fileUpload.file.name}`, { id: toastId })
      } catch (error) {
        toast.error(`Failed to upload ${fileUpload.file.name}`, { id: toastId })
        setFiles(prev => prev.filter(f => f !== fileUpload))
      }
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (fileToRemove: FileUpload) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove))
  }

  const handleSubmit = async () => {
    if (!channel_id) return
    if (!content.trim() && files.length === 0) return
    if (files.some(f => f.uploading)) {
      toast.error("Please wait for files to finish uploading")
      return
    }
    
    setIsSubmitting(true)
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
        account.account_id,
        content.trim(),
        {
          payloads: files
            .filter(f => f.path)
            .map(f => ({
              path: f.path!,
              size: f.file.size,
              type: f.file.type
            }))
        }
      )

      if (!result.success) {
        toast.error(result.failure?.message || "Failed to send message", {
          description: result.failure?.context || "Unknown error"
        })
        return
      }

      setContent("")
      setFiles([])
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
              <span className="text-sm">{file.file.name}</span>
              {file.uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleRemoveFile(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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
            disabled={(!content.trim() && files.length === 0) || isSubmitting || files.some(f => f.uploading)}
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
