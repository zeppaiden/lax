"use client"

import * as React from "react"
import { Command } from "lucide-react"
import { Network } from "@/services/types"
import { useServiceContext } from "@/contexts/page"
import { NetworkOptionsMenu } from "@/components/network/network-options-menu"

export function AccountNetworksItem({
  network,
  onClick,
}: {
  network: Network
  onClick?: (network: Network) => void
}) {
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
      <div className="ml-auto opacity-0 group-hover:opacity-100">
        <NetworkOptionsMenu network={network} />
      </div>
    </div>
  )
}
