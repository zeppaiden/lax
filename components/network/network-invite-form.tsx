"use client"

import * as React from "react"
import { Hash } from "lucide-react"
import { createHash } from "crypto"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"

export function NetworkInviteForm({ children }: { children?: React.ReactNode }) {
  const { service_manager, current_account, current_network } = useServiceContext()
  const [joinCode, setJoinCode] = React.useState("")

  const handleJoinNetwork = async () => {
    if (!joinCode || joinCode.length !== 6) {
      toast.error("Invalid join code")
      return
    }

    const result = await service_manager.networks.inviteAccount(
      current_account.account_id,
      joinCode
    )

    if (!result.success) {
      toast.error(result.failure?.message || "Failed to join network", {
        description: result.failure?.context || "Please try again later or contact support if the problem persists."
      })
    } else {
      toast.success("Network joined successfully", {
        description: "You can now start chatting with your friends in this network."
      })
    }
  }

  const getShareCode = () => {
    if (!current_network?.network_id) return "------"
    
    // Create MD5 hash and take first 6 characters
    const hash = createHash('md5')
      .update(current_network.network_id)
      .digest('hex')
      .substring(0, 6)
      .toUpperCase()
    
    return hash
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Hash className="mr-2 size-4" />
            Share Network
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Network Sharing</DialogTitle>
          <DialogDescription>
            Join an existing network or share your current network with others.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="join">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join">Join Network</TabsTrigger>
              <TabsTrigger value="share">Share Network</TabsTrigger>
            </TabsList>
            
            <TabsContent value="join" className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-character code to join a network
                </p>
                <InputOTP
                  maxLength={6}
                  value={joinCode}
                  onChange={setJoinCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button onClick={handleJoinNetwork}>Join Network</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="share" className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share this code with others to let them join your network
                </p>
                <div className="text-3xl font-mono font-bold tracking-wider">
                  {getShareCode()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
      </DialogContent>
    </Dialog>
  )
}
