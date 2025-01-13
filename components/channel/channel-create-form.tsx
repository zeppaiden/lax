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
import { Switch } from "@/components/ui/switch"

export function ChannelCreateForm({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const { service_manager, current_account, current_network } = useServiceContext();

  const isValidChannelName = (name: string) => {
    return /^[a-zA-Z0-9-]+$/.test(name);
  }

  const handleCreateChannelAction = async () => {
    if (!name.trim()) {
      toast.error("Invalid channel name", {
        description: "Channel name cannot be empty",
      });
      return;
    }

    if (!isValidChannelName(name)) {
      toast.error("Invalid channel name", {
        description: "Channel names can only contain letters, numbers, and hyphens",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!current_network?.network_id) {
        toast.error("No network selected", {
          description: "Please select a network first",
        });
        return;
      }

      const result = await service_manager.channels.createChannel(
        current_network.network_id,
        current_account.account_id,
        name.trim(),
        false
      );

      if (!result.success) {
        toast.error(result.failure?.message || "Failed to create channel", {
          description: result.failure?.context || "Please try again later",
        });
      } else {
        toast.success("Channel created successfully", {
          description: "You can now start chatting in this channel",
        });
      }
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new channel</DialogTitle>
          <DialogDescription>
            Create a new channel and add members from your network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Input
              placeholder="New channel name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Channel names can only contain letters, numbers, and hyphens
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleCreateChannelAction} 
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
