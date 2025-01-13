import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { GitHubLogoIcon, DiscordLogoIcon } from "@radix-ui/react-icons";
import { signInWithGithub, signInWithDiscord, signInWithEmail } from "@/app/actions";

export default async function Signin(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Use one of our providers to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <button
              onClick={signInWithGithub}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <GitHubLogoIcon className="h-4 w-4" />
              Github
            </button>
            <button
              onClick={signInWithDiscord}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <DiscordLogoIcon className="h-4 w-4" />
              Discord
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>

            <form className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="mail">Email</Label>
                  <Input name="mail" id="mail" type="email" placeholder="m@example.com" required />
                </div>
                <SubmitButton pendingText="Signing In..." formAction={signInWithEmail} className="w-full">
                  Sign in
                </SubmitButton>
              </div>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
              <FormMessage message={searchParams} />
            </form>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}