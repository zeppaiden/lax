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
import { Network } from "@/services/types"

export function NetworkDeleteForm({ network, children }: { network: Network, children?: React.ReactNode }) {
  const { service_manager, current_account, current_network, setCurrentNetwork } = useServiceContext()

  const handleDelete = async () => {
    if (!network?.network_id) {
      toast.error("Invalid network", {
        description: "Unable to delete network due to missing ID",
      })
      return
    }

    if (network?.created_by !== current_account?.account_id) {
      toast.error("You are not the owner of this network", {
        description: "Only the owner can delete the network",
      })
      return
    }

    const result = await service_manager.networks.deleteNetwork(
      network.network_id
    )

    if (!result.success) {
      toast.error(result.failure?.message, {
        description: result.failure?.context,
      })
      return
    }

    if (network.network_id === current_network?.network_id) {
      setCurrentNetwork(null)
    }

    toast.success("Network deleted successfully", {
      description: "You should no longer see this network in your list",
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon">
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Network</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the network &quot;{network.name}&quot;? 
            This action cannot be undone and will delete all channels and messages within the network.
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
