"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsSettingsPage() {
  const { service_manager, current_account } = useServiceContext()
  const [emailNotifications, setEmailNotifications] = React.useState(false)
  const [desktopNotifications, setDesktopNotifications] = React.useState(false)
  const [soundEnabled, setSoundEnabled] = React.useState(false)

  const handleSaveSettings = async () => {
    toast.success("Notification preferences saved", {
      description: "Your notification settings have been updated."
    })
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how you receive notifications from the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications via email
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="desktop-notifications" className="flex flex-col space-y-1">
              <span>Desktop Notifications</span>
              <span className="text-sm text-muted-foreground">
                Show notifications on your desktop
              </span>
            </Label>
            <Switch
              id="desktop-notifications"
              checked={desktopNotifications}
              onCheckedChange={setDesktopNotifications}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="sound-enabled" className="flex flex-col space-y-1">
              <span>Sound Effects</span>
              <span className="text-sm text-muted-foreground">
                Play sounds for notifications
              </span>
            </Label>
            <Switch
              id="sound-enabled"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings}>Save preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 