"use client"

import * as React from "react"
import { MoreVertical, Settings, LogOut, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Network } from "@/services/types"
import { NetworkManageForm } from "./network-manage-form"

interface NetworkOptionsMenuProps {
  network: Network
}

export function NetworkOptionsMenu({ network }: NetworkOptionsMenuProps) {
  const { service_manager, current_account, setCurrentNetwork } = useServiceContext()

  const handleLeaveNetwork = async () => {
    if (!current_account) return

    const result = await service_manager.networks.removeAccount(
      network.network_id,
      current_account.account_id
    )

    if (!result.success) {
      toast.error("Failed to leave network", {
        description: result.failure?.message
      })
      return
    }

    setCurrentNetwork(null)
    toast.success("Left network successfully")
  }

  const handleDeleteNetwork = async () => {
    if (!current_account || current_account.account_id !== network.created_by) return

    const result = await service_manager.networks.deleteNetwork(network.network_id)

    if (!result.success) {
      toast.error("Failed to delete network", {
        description: result.failure?.message
      })
      return
    }

    setCurrentNetwork(null)
    toast.success("Network deleted successfully")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open network options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {current_account?.account_id === network.created_by && (
          <>
            <NetworkManageForm network={network}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Manage Network</span>
              </DropdownMenuItem>
            </NetworkManageForm>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleLeaveNetwork}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Leave Network</span>
        </DropdownMenuItem>
        {current_account?.account_id === network.created_by && (
          <DropdownMenuItem onClick={handleDeleteNetwork} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Network</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 