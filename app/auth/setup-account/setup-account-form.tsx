"use client";

import { ServiceManager } from "@/services/service-manager";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function SetupAccountForm({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const services = ServiceManager.initialize(supabase);
    const result = await services.accounts.createAccount(
      user.id,
      user.email!,
      formData.get("uname") as string,
      formData.get("fname") as string,
      formData.get("lname") as string,
      false
    );
    console.log('Result of account creation',  result);

    if (!result.success) {
      toast.error(result.failure?.message || "An error occurred", {
        description: result.failure?.context || "Please try again later",
      });
    } else {
      toast.success("Account created successfully", {
        description: "You can now access the platform",
      });
      router.push("/protected");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>Fill in your account details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="uname">Username</Label>
            <Input
              id="uname"
              name="uname"
              required
              defaultValue={user.email?.split("@")[0]}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fname">First Name</Label>
            <Input id="fname" name="fname" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lname">Last Name</Label>
            <Input id="lname" name="lname" required />
          </div>
          <Button type="submit" className="w-full">Complete Setup</Button>
        </form>
      </CardContent>
    </Card>
  );
} 