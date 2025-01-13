import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SetupAccountForm } from "./setup-account-form";
import { ServiceManager } from "@/services/service-manager";

export default async function SetupAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user already has an account
  const services = ServiceManager.initialize(supabase);
  const accountResult = await services.accounts.selectAccount(user.id);

  if (accountResult.success && accountResult.content) {
    return redirect("/protected");
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SetupAccountForm user={user} />
      </div>
    </div>
  );
} 