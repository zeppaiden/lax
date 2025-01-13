"use server";

import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { ServiceManager } from "@/services";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  let response = await updateSession(request);
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Skip account check for auth-related paths
    if (pathname.startsWith("/auth/setup-account")) {
      return response;
    }

    // Check if user has an account
    const services = ServiceManager.initialize(supabase);
    const accountResult = await services.accounts.selectAccount(user.id);

    if (!accountResult.success || !accountResult.content) {
      return Response.redirect(new URL("/auth/setup-account", request.url));
    }

    // Add this after account check
    if (pathname === "/") {
      return Response.redirect(new URL("/protected", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)"
  ],
};
