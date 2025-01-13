import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form className="flex flex-col gap-4">
          <h1 className="text-2xl font-medium">Reset password</h1>
          <p className="text-sm text-foreground/60">
            Please enter your new password below.
          </p>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              type="password"
              name="password"
              placeholder="New password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              required
            />
          </div>
          <SubmitButton formAction={resetPasswordAction}>
            Reset password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
    </div>
  );
}
