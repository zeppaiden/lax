"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Network } from "@/services/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CircleDot, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NetworkManageFormProps {
  network: Network
  children?: React.ReactNode
}

export function NetworkManageForm({ network, children }: NetworkManageFormProps) {
  const { service_manager, current_account } = useServiceContext()
  const [name, setName] = React.useState(network.name)
  const [accounts, setAccounts] = React.useState<any[]>([])
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchAccounts = async () => {
      const result = await service_manager.networks.selectAccounts(network.network_id)
      if (result.success) {
        setAccounts(result.content || [])
      }
    }

    if (open) {
      fetchAccounts()
    }
  }, [network.network_id, open])

  const handleUpdateNetwork = async () => {
    if (!current_account || current_account.account_id !== network.created_by) return

    const result = await service_manager.networks.updateNetwork(
      network.network_id,
      name
    )

    if (!result.success) {
      toast.error("Failed to update network", {
        description: result.failure?.message
      })
      return
    }

    toast.success("Network updated successfully")
  }

  const handleRemoveAccount = async (accountId: string) => {
    if (!current_account || current_account.account_id !== network.created_by) return

    const result = await service_manager.networks.removeAccount(
      network.network_id,
      accountId
    )

    if (!result.success) {
      toast.error("Failed to remove account", {
        description: result.failure?.message
      })
      return
    }

    setAccounts(accounts.filter(a => a.account_id !== accountId))
    toast.success("Account removed successfully")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Network</DialogTitle>
          <DialogDescription>
            Make changes to your network here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={current_account?.account_id !== network.created_by}
            />
          </div>
          <div className="grid gap-2">
            <Label>Members</Label>
            <ScrollArea className="h-72 rounded-md border">
              <div className="p-4">
                {accounts.map((account) => (
                  <div
                    key={account.account_id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {account.fname[0]}
                          {account.lname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {account.fname} {account.lname}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CircleDot className={cn(
                            account.is_offline ? "text-red-500" : "text-green-500",
                            "mr-1 h-3 w-3"
                          )} />
                          {account.is_offline ? "Offline" : "Online"}
                        </div>
                      </div>
                    </div>
                    {current_account?.account_id === network.created_by && 
                     account.account_id !== network.created_by && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAccount(account.account_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          {current_account?.account_id === network.created_by && (
            <Button onClick={handleUpdateNetwork}>Save changes</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 