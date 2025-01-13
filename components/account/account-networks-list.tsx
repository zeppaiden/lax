"use client"

import * as React from "react"
import { ChevronsUpDown, Command, Hash, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Network } from "@/services/types"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { NetworkCreateForm } from "@/components/network/network-create-form"
import { NetworkInviteForm } from "@/components/network/network-invite-form"
import { AccountNetworksItem } from "./account-networks-item"

export function AccountNetworksList() {
  const { isMobile } = useSidebar()
  const { service_manager, current_account, current_network, setCurrentNetwork } = useServiceContext()
  const [networks, setNetworks] = React.useState<Network[]>([])

  const handleCreateNetwork = React.useCallback((network: Network) => {
    setNetworks([...networks, network])
  }, [networks])

  const handleUpdateNetwork = React.useCallback((network: Network) => {
    setNetworks(networks.map(n => n.network_id === current_network?.network_id ? network : n))
  }, [networks])

  const handleDeleteNetwork = React.useCallback((network: Network) => {
    setNetworks(networks.filter(n => n.network_id !== current_network?.network_id))
  }, [networks])

  React.useEffect(() => {
    const initialize = async () => {
      const networks_result = await service_manager.networks.selectNetworks(
        current_account?.account_id || ""
      )

      if (!networks_result.success) {
        toast.error(networks_result.failure?.message, {
          description: networks_result.failure?.context,
        })
        return
      }

      if (networks_result.content) {
        setNetworks(networks_result.content || [])
      }

      const subscription_result = await service_manager.networks.subscribe({
        network_id: current_network?.network_id || "",
        onNetworkUpdate: handleUpdateNetwork,
      })

      if (!subscription_result.success) {
        toast.error(subscription_result.failure?.message, {
          description: subscription_result.failure?.context,
        })
        return
      }

      return () => {
        subscription_result.content?.unsubscribe()
      }
    }

    const cleanup = initialize()

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [current_account?.account_id, handleCreateNetwork, handleUpdateNetwork, handleDeleteNetwork])

  React.useEffect(() => {
    if (networks.length > 0 && !current_network) {
      setCurrentNetwork(networks[0])
    }
  }, [networks, current_network])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {current_network?.name || "No network selected"}
                </span>
                <span className="truncate text-xs">Network</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Networks
            </DropdownMenuLabel>
            {networks.map((network, index) => (
              <DropdownMenuItem
                key={network.network_id}
                onSelect={(e) => e.preventDefault()}
                className="p-0"
              >
                <AccountNetworksItem 
                  network={network}
                  onClick={() => setCurrentNetwork(network)}
                />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <NetworkCreateForm>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex w-full items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Create network
                  </div>
                </div>
              </DropdownMenuItem>
            </NetworkCreateForm>
            <NetworkInviteForm>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex w-full items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Hash className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Invite to network
                  </div>
                </div>
              </DropdownMenuItem>
            </NetworkInviteForm>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
