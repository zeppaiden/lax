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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Account } from "@/services/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function WhisperCreateForm({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("")
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const { service_manager, current_account, current_network } = useServiceContext()

  // Fetch network members when dialog opens
  React.useEffect(() => {
    if (open && current_network) {
      const fetchAccounts = async () => {
        const result = await service_manager.networks.selectNetworkContext(current_network.network_id)
        if (result.success) {
          setAccounts(result.content?.accounts.filter((account: Account) => account.account_id !== current_account.account_id) || [])
        }
      }
      fetchAccounts()
    }
  }, [open, current_network, service_manager.networks, current_account.account_id])

  const handleCreateWhisperAction = async () => {
    if (!current_network?.network_id) {
      toast.error("No network selected", {
        description: "Please select a network first",
      })
      return
    }

    if (!selectedAccountId) {
      toast.error("No user selected", {
        description: "Please select a user to whisper to",
      })
      return
    }

    const result = await service_manager.channels.createWhisper(
      current_network.network_id,
      current_account.account_id,
      selectedAccountId
    )

    if (!result.success) {
      toast.error(result.failure?.message || "Failed to create whisper", {
        description: result.failure?.context || "Please try again later",
      })
    } else {
      toast.success("Whisper created successfully", {
        description: "You can now start private messaging in this whisper",
      })
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Whisper</DialogTitle>
          <DialogDescription>
            Select a user to start a private whisper conversation.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <RadioGroup
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            className="space-y-2"
          >
            {accounts.map((account) => (
              <div key={account.account_id} className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value={account.account_id} id={account.account_id} />
                <Label htmlFor={account.account_id} className="flex-1">
                  {account.fname} {account.lname} ({account.uname})
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleCreateWhisperAction}
            disabled={!selectedAccountId}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
