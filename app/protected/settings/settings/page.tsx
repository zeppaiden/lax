"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { OPENAI_TTS_VOICES } from "@/utils/constants"

export default function GeneralSettingsPage() {
  const { service_manager, current_account } = useServiceContext()
  const [compactMode, setCompactMode] = React.useState(false)
  const [messagePreview, setMessagePreview] = React.useState(false)
  const [fontSize, setFontSize] = React.useState("medium")
  const [ttsVoice, setTtsVoice] = React.useState<string>("alloy")

  React.useEffect(() => {
    if (current_account?.meta?.tts_voice) {
      setTtsVoice(current_account.meta.tts_voice)
    }
  }, [current_account])

  const handleSaveSettings = async () => {
    toast.success("Settings saved", {
      description: "Your preferences have been updated."
    })
  }

  const handleVoiceChange = async (voice: string) => {
    if (!current_account) return

    const meta = {
      ...current_account.meta,
      tts_voice: voice
    }

    const result = await service_manager.accounts.updateAccount(
      current_account.account_id,
      { meta }
    )

    if (!result.success) {
      toast.error("Failed to update voice preference")
      return
    }

    setTtsVoice(voice)
    toast.success("Voice preference updated")
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Customize your app experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label className="flex flex-col space-y-1">
              <span>Theme</span>
              <span className="text-sm text-muted-foreground">
                Choose your preferred theme
              </span>
            </Label>
            <ModeToggle />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="compact-mode" className="flex flex-col space-y-1">
              <span>Compact Mode</span>
              <span className="text-sm text-muted-foreground">
                Show more content with less spacing
              </span>
            </Label>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="message-preview" className="flex flex-col space-y-1">
              <span>Message Preview</span>
              <span className="text-sm text-muted-foreground">
                Show message previews in notifications
              </span>
            </Label>
            <Switch
              id="message-preview"
              checked={messagePreview}
              onCheckedChange={setMessagePreview}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="font-size" className="flex flex-col space-y-1">
              <span>Font Size</span>
              <span className="text-sm text-muted-foreground">
                Adjust the text size
              </span>
            </Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Text-to-Speech Voice</h3>
            <p className="text-sm text-muted-foreground">
              Choose the voice that will be used when playing message audio.
            </p>
            <Select value={ttsVoice} onValueChange={handleVoiceChange}>
              <SelectTrigger>
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
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings}>Save preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 