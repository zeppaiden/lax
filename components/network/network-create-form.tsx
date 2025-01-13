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

export function NetworkCreateForm({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")

  const { service_manager, current_account } = useServiceContext();

  const handleCreateNetworkAction = async () => {
    const result = await service_manager.networks.createNetwork(
      current_account.account_id,
      name
    );

    if (!result.success) {
      toast.error(result.failure?.message || "Failed to create network", {
        description: result.failure?.context || "Please try again later",
      });
    } else {
      toast.success("Network created successfully", {
        description: "You can now add channels to this network",
      });
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Network</DialogTitle>
          <DialogDescription>
            Create a new network by entering a name below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateNetworkAction}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
