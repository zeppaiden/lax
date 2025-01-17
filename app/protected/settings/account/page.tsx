"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OPENAI_TTS_VOICES } from "@/utils/constants"

export default function AccountSettingsPage() {
  const { service_manager, current_account, setCurrentAccount } = useServiceContext()
  const [fname, setFname] = React.useState(current_account?.fname || "")
  const [lname, setLname] = React.useState(current_account?.lname || "")
  const [uname, setUname] = React.useState(current_account?.uname || "")
  const [email, setEmail] = React.useState(current_account?.email || "")
  const [ttsVoice, setTtsVoice] = React.useState(current_account?.meta?.tts_voice || "alloy")

  const handleUpdateAccount = async () => {
    if (!current_account) return

    const result = await service_manager.accounts.updateAccount(
      current_account.account_id,
      {
        fname,
        lname,
        uname,
        email,
        meta: {
          ...current_account.meta,
          tts_voice: ttsVoice
        }
      }
    )

    if (!result.success) {
      toast.error("Failed to update account", {
        description: result.failure?.message
      })
      return
    }

    setCurrentAccount({
      ...current_account,
      fname,
      lname,
      uname,
      email,
      meta: {
        ...current_account.meta,
        tts_voice: ttsVoice
      }
    })

    toast.success("Account updated successfully")
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fname">First Name</Label>
              <Input
                id="fname"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lname">Last Name</Label>
              <Input
                id="lname"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="uname">Username</Label>
            <Input
              id="uname"
              value={uname}
              onChange={(e) => setUname(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Text-to-Speech Voice</Label>
            <Select value={ttsVoice} onValueChange={setTtsVoice}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {OPENAI_TTS_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span>{voice.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {voice.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the voice that will be used when playing message audio.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateAccount}>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 