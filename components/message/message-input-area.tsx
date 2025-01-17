"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  Bold, 
  Code, 
  FileIcon, 
  Italic, 
  Loader2, 
  Paperclip, 
  Send, 
  SmileIcon,
  Image as ImageIcon,
  X 
} from "lucide-react"
import { Account } from "@/services/types"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface MessageInputAreaProps {
  channel_id: string | null
}

export function MessageInputArea({ channel_id }: MessageInputAreaProps) {
  const supabase = createClient()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const { service_manager, current_account } = useServiceContext()
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [files, setFiles] = React.useState<File[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  // Format selection with markdown
  const formatSelection = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const text = content
    const before = text.substring(0, start)
    const selection = text.substring(start, end)
    const after = text.substring(end)

    setContent(`${before}${prefix}${selection}${suffix}${after}`)
    
    // Restore selection
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      )
      textareaRef.current?.focus()
    }, 0)
  }

  const handleBold = () => formatSelection('**')
  const handleItalic = () => formatSelection('*')
  const handleCode = () => formatSelection('`')

  const handleEmojiSelect = (emoji: any) => {
    setContent(prev => prev + emoji.native)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const handleToggleEmojiPicker = React.useCallback(() => {
    setShowEmojiPicker(prev => !prev)
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !channel_id) return

    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])

    // Clear the input for future selections
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !channel_id) return

    const file = e.target.files[0]
    if (!file.type.startsWith('image/')) {
      setTimeout(() => {
        toast.error('Only image files are allowed')
      }, 0)
      return
    }

    setIsUploadingImage(true)
    const toastId = toast.loading('Uploading image...')

    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(`${channel_id}/${Date.now()}-${file.name}`, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(data.path)

      // Add image markdown to content
      const imageMarkdown = `![${file.name}](${publicUrl})\n`
      setContent(prev => prev + imageMarkdown)
      
      // Clear the input for future selections
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }

      setTimeout(() => {
        toast.success('Image uploaded successfully', {
          id: toastId
        })
      }, 0)
    } catch (error) {
      setTimeout(() => {
        toast.error('Failed to upload image', {
          id: toastId
        })
      }, 0)
      console.error('Image upload error:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove))
  }

  const handleSubmit = async () => {
    if (!channel_id || !current_account) return
    if (!content.trim() && files.length === 0) return

    setIsSubmitting(true)
    const toastId = toast.loading('Sending message...')

    try {
      // Upload files first if any
      const payloads = await Promise.all(
        files.map(async file => {
          const { data, error } = await supabase.storage
            .from('attachments')
            .upload(`${channel_id}/${Date.now()}-${file.name}`, file)

          if (error) throw error

          const { data: { publicUrl } } = supabase.storage
            .from('attachments')
            .getPublicUrl(data.path)

          return {
            name: file.name,
            path: data.path,
            purl: publicUrl,
            size: file.size,
            type: file.type
          }
        })
      )

      // Create message
      const result = await service_manager.messages.createMessage(
        channel_id,
        current_account.account_id,
        content.trim(),
        payloads.length > 0 ? { payloads } : undefined
      )

      if (!result.success) {
        throw new Error(result.failure?.message)
      }

      // Reset form immediately
      setContent("")
      setFiles([])
      setIsSubmitting(false)

      setTimeout(() => {
        toast.success('Message sent', {
          id: toastId
        })
      }, 0)

      // Only send to bot if message starts with /ask
      if (content.trim().toLowerCase().startsWith('/ask')) {
        // Fire off Pinecone API call without waiting for result
        fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            channel_id, 
            content: content.trim(),
            message_id: result.content?.message_id,
            input_history: [] // Add empty input history if none exists
          })
        })
        .catch(error => {
          console.error('Error getting bot response:', error);
          toast.error('Failed to get bot response');
        });
      }
    } catch (error) {
      setIsSubmitting(false)
      setTimeout(() => {
        toast.error('Failed to send message', {
          id: toastId,
          description: error instanceof Error ? error.message : undefined
        })
      }, 0)
      console.error('Submit error:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          handleBold()
          break
        case 'i':
          e.preventDefault()
          handleItalic()
          break
        default:
          break
      }
      return
    }

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
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleBold}
            className="h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleItalic}
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCode}
            className="h-8 w-8"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            size="icon"
            variant="ghost"
            disabled={isUploadingImage}
            onClick={() => imageInputRef.current?.click()}
            className="h-8 w-8"
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleEmojiPicker}
              className="h-8 w-8"
            >
              <SmileIcon className="h-4 w-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
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
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageSelect}
              className="hidden"
              accept="image/*"
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
    </div>
  )
}