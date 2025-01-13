"use client"

import * as React from "react"
import { Command } from "lucide-react"
import { Network } from "@/services/types"
import { useServiceContext } from "@/contexts/page"
import { NetworkDeleteForm } from "@/components/network/network-delete-form"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function AccountNetworksItem({
  network,
  onClick,
}: {
  network: Network
  onClick?: (network: Network) => void
}) {
  const { current_account } = useServiceContext()

  return (
    <div className="group flex w-full items-center justify-between">
      <div
        onClick={() => onClick?.(network)}
        className="flex flex-1 items-center gap-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
      >
        <div className="flex size-6 items-center justify-center rounded-sm border">
          <Command className="size-4 shrink-0" />
        </div>
        <span className="flex-1 truncate">{network.name}</span>
      </div>
      {network.created_by === current_account?.account_id && (
        <div className="ml-auto">
          <NetworkDeleteForm network={network}>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="size-4" />
            </Button>
          </NetworkDeleteForm>
        </div>
      )}
    </div>
  )
}
