"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DASHBOARD_REDIRECT_URL = "/protected/dashboard";

export const signUpAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString();
  const uniq = formData.get("uniq")?.toString();
  const mail = formData.get("mail")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect(
      "error", 
      "/sign-up",
      "You must be logged in to complete the authentication process"
    );
  }

  if (!name || !uniq || !mail) {
    return encodedRedirect(
      "error", 
      "/sign-up",
      "All fields are required"
    );
  }

  // Create the account in the database
  const { data, error } = await supabase.from('accounts').insert({
    account_id: user.id,
    name,
    uniq,
    mail,
  });
  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  return encodedRedirect(
    "success",
    "/sign-in", 
    "Thanks for signing up! You can now sign in with your email or provider account."
  );
};

export const signInAction = async (formData: FormData) => {
  const mail = formData.get("mail") as string;
  const pass = formData.get("pass") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: mail,
    password: pass,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const mail = formData.get("mail")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!mail) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(mail, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const pass = formData.get("pass") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!pass || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (pass !== confirmPassword) {
    encodedRedirect(
      "error", 
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: pass,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password", 
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const signUpWithEmail = async (formData: FormData) => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const mail = formData.get("mail") as string;

  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('*')
    .eq('mail', mail)
    .single()

  if (existingAccount) {
    return encodedRedirect("error", "/sign-up", "An account with this email already exists");
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: mail,
    options: {
      emailRedirectTo: `${origin}/auth/callback?redirect_to=${DASHBOARD_REDIRECT_URL}`,
    },
  })

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  return encodedRedirect("success", "/sign-up", "Check your email for a verification link.");
}

export const signInWithEmail = async (formData: FormData) => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const mail = formData.get("mail") as string;
  const { data, error } = await supabase.auth.signInWithOtp({
    email: mail,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?redirect_to=${DASHBOARD_REDIRECT_URL}`,
    },
  })
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return encodedRedirect("success", "/sign-in", "Check your email for a verification link.");
}

export const signUpWithGithub = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const redirectTo = `${origin}/auth/callback?next=${DASHBOARD_REDIRECT_URL}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo,
    },
  })
  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (data.url) {
    redirect(data.url)
  }
}

export const signInWithGithub = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const redirectTo = `${origin}/auth/callback?next=${DASHBOARD_REDIRECT_URL}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo,
      scopes: 'read:user read:email',
    },
  })
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  if (data.url) {
    redirect(data.url)
  }
}

export const signUpWithDiscord = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const redirectTo = `${origin}/auth/callback?next=${DASHBOARD_REDIRECT_URL}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo },
  })
  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (data.url) {
    redirect(data.url)
  }
}

export const signInWithDiscord = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const redirectTo = `${origin}/auth/callback?next=${DASHBOARD_REDIRECT_URL}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo },
  })

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  if (data.url) {
    redirect(data.url)
  }
}
