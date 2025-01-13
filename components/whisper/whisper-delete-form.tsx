"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Channel } from "@/services/types"

export function WhisperDeleteForm({ channel, children }: { channel: Channel, children?: React.ReactNode }) {
  const { service_manager, current_network, current_channel, setCurrentChannel } = useServiceContext()

  const handleDelete = async () => {
    if (!current_network?.network_id) {
      toast.error("No network selected", {
        description: "Please select a network before deleting a whisper",
      })
      return
    }

    const result = await service_manager.channels.deleteChannel(
      channel.channel_id
    )

    if (!result.success) {
      toast.error(result.failure?.message, {
        description: result.failure?.context,
      })
      return
    }

    if (channel.channel_id === current_channel?.channel_id) {
      setCurrentChannel(null)
    }

    toast.success("Whisper deleted successfully", {
      description: "You should no longer see this whisper in your list",
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Trash2 className="size-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Whisper</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this whisper conversation? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
